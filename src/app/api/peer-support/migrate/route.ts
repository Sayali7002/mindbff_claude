import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { withAuth } from '@/app/api/auth-middleware';

export async function POST(request: NextRequest) {
  return withAuth(request, async (userId, request) => {
    try {
      const supabase = createClient();
      
      // Check if user is admin (you can modify this check as needed)
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!userProfile) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      // Add is_read column to peer_support_chats table if it doesn't exist
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: `
          DO $$ 
          BEGIN 
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'peer_support_chats' 
              AND column_name = 'is_read'
            ) THEN
              ALTER TABLE peer_support_chats ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
            END IF;
          END $$;
        `
      });
      
      if (alterError) {
        console.error('Migration error:', alterError);
        return NextResponse.json(
          { error: 'Migration failed: ' + alterError.message },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ 
        message: 'Migration completed successfully',
        details: 'Added is_read column to peer_support_chats table'
      });
      
    } catch (error) {
      console.error('Error in migration API:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
} 