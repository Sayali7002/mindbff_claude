'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { UserProfile } from '@/components/profile/ProfileSetup';

interface CommunityGuidelinesProps {
  onNext?: () => void;
}

const guidelines = [
  {
    title: "Be Kind & Supportive",
    description: "Show empathy. No hate or harassment.",
    icon: "diversity_3"
  }
  ,
  {
    title: "Report Issues",
    description: "Flag any unsafe or concerning behavior.",
    icon: "report_problem"
  }
  ,
  {
    title: "Respect Privacy",
    description: "Share only experiences, no personal info.",
    icon: "lock"
  },  {
    title: "No Medical Advice",
    description: "Please consult professionals for the same.",
    icon: "medical_services"
  }
];

export default function CommunityGuidelinesScreen({ onNext }: CommunityGuidelinesProps) {
  const router = useRouter();

  const handleAgree = () => {
    // Store agreement in localStorage
    localStorage.setItem('guidelinesAccepted', 'true');
    
    // Check if we already have a user profile
    const existingProfile = localStorage.getItem('userProfile');
    
    if (existingProfile) {
      // If we have an existing profile, update the guidelines acceptance
      const profile = JSON.parse(existingProfile);
      
      // Do NOT mark as authenticated here - only store the profile data
      // localStorage.setItem('isAuthenticated', 'true');
      
      // Set profile as partially completed
      const updatedProfile = {
        ...profile,
        completedSetup: false,
        profileCompletionPercentage: profile.profileCompletionPercentage || 25
      };
      
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    } else {
      // Create a minimal user profile with proper typing
      const minimalProfile: UserProfile = {
        id: '',
        name: 'Guest User',
        dateOfBirth: '',
        location: '',
        gender: '',
        workplace: '',
        jobTitle: '',
        education: '',
        religiousBeliefs: '',
        communicationPreferences: '',
        availability: '',
        completedSetup: false,
        profileCompletionPercentage: 0,
        journey: '',
        supportPreferences: [],
        supportType: '',
        certifications: {
          status: 'none'
        }
      };
      
      // Try to get journey and support preferences from local storage
      try {
        const selectedJourneysJSON = localStorage.getItem('selectedJourneys');
        minimalProfile.supportType = localStorage.getItem('supportType') || '';
        if (selectedJourneysJSON) {
          const selectedJourneys = JSON.parse(selectedJourneysJSON);
          minimalProfile.journey = selectedJourneys[0] || '';
          minimalProfile.supportPreferences = selectedJourneys;
        }
      } catch (e) {
        console.error('Error loading selected journeys:', e);
      }
      
      // Store minimal profile data
      localStorage.setItem('userProfile', JSON.stringify(minimalProfile));
      localStorage.setItem('profileSetupCompleted', 'false');
    }
    
    if (onNext) {
      onNext();
    } else {
      // Redirect to dashboard
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Community Guidelines
          </h1>
          <p className="text-lg text-gray-600">
            Help us create a safe environment
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mt-6">
          {guidelines.map((guideline, idx) => (
            <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.15, duration: 0.5 }}>
            <div key={idx} className="bg-white rounded-3xl soft-shadow p-4 flex flex-col items-start border">
              <div className="flex items-start mb-2">
                <span className="material-icons mr-2 text-blue-500 text-xl">{guideline.icon}</span>
                <h3 className="font-semibold text-gray-900 mb-2">{guideline.title}</h3>
                </div>

              <p className="text-gray-600 text-semibold mb-2">{guideline.description}</p>
            </div>
             </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col space-y-4 pt-6"
        >
          <Button
            onClick={handleAgree}
            className="w-full py-6 text-lg rounded-full"
          >
            I Agree & Continue
          </Button>
          <Button
            onClick={() => router.push('/onboarding/journey')}
            variant="outline"
            className="w-full py-6 text-lg rounded-full"
          >
            Go Back
          </Button>
        </motion.div>
      </div>
    </div>
  );
} 