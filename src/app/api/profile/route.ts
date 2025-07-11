import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
import { encryptProfileFields, decryptProfileFields } from '@/types/profile';

export async function GET() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (error) throw error;
    
    // Decrypt sensitive fields
    const mappedProfile = decryptProfileFields({
      name: data.name || '',
      dateOfBirth: data.dob || '',
      location: data.location || '',
      gender: data.gender || '',
      workplace: data.workplace || '',
      jobTitle: data.job_title || '',
      education: data.education || '',
      religiousBeliefs: data.religious_beliefs || '',
      communicationPreferences: data.communication_style || '',
      availability: data.availability || '',
      completedSetup: data.completed_setup || false,
      profileCompletionPercentage: 0,
      journey: data.support_preferences ? data.support_preferences[0] : '',
      supportPreferences: data.support_preferences || [],
      supportType: data.support_type || '',
      journeyNote: data.journey_note || '',
      certifications: { status: 'none' }
    }, session.user.id);
    // Add id field after decryption
    mappedProfile.id = data.id || '';
    return NextResponse.json(mappedProfile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    // Encrypt sensitive fields before saving
    const encryptedProfile = encryptProfileFields(body, session.user.id);
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: session.user.id,
        name: encryptedProfile.name,
        dob: encryptedProfile.dateOfBirth,
        location: encryptedProfile.location,
        gender: encryptedProfile.gender,
        workplace: encryptedProfile.workplace || null,
        job_title: encryptedProfile.jobTitle || null,
        education: encryptedProfile.education || null,
        religious_beliefs: encryptedProfile.religiousBeliefs || null,
        availability: encryptedProfile.availability || null,
        communication_style: encryptedProfile.communicationPreferences || null,
        support_preferences: encryptedProfile.supportPreferences || [],
        journey_note: encryptedProfile.journeyNote || null,
        completed_setup: encryptedProfile.completedSetup,
        support_type: encryptedProfile.supportType || null,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
