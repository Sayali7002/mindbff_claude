'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

type SupportRole = 'need' | 'provide' | 'both';



interface SupportPreferencesProps {
  onNext?: () => void;
}

export default function SupportPreferencesScreen({ onNext }: SupportPreferencesProps) {
  const router = useRouter();
  const [journeyNote, setjourneyNote] = useState('');
  const [supportType, setSupportType] = useState<'support-seeker' | 'support-giver' | null>(null);

  const handleContinue = () => {
    // Get existing profile data
    let profileData = {};
    try {
      const existingData = localStorage.getItem('userProfile');
      if (existingData) {
        profileData = JSON.parse(existingData);
      }
    } catch (e) {
      console.error('Error parsing profile data:', e);
    }
    
    // Update profile with support type and journey note
    const updatedProfile = {
      ...profileData,
      journeyNote: journeyNote,
      supportType: supportType
    };
    
    console.log("Saving support type to profile:", supportType);
    
    // Save updated profile
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    
    // Also save support type and journey note separately for easier access
    if (supportType) {
      console.log("Saving support type to localStorage:", supportType);
      localStorage.setItem('supportType', supportType);
    }
    
    if (journeyNote) {
      localStorage.setItem('journeyNote', journeyNote);
    }
    
    if (onNext) {
      onNext();
    } else {
      router.push('/onboarding/journey');
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
            What is your goal?
          </h1>
          <p className="text-lg text-gray-600">
            Great! Thanks for taking the first step, heal and grow in the community.
          </p>
        </motion.div>

        <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
              className="bg-white rounded-lg p-5 shadow-sm"
            >
           {/* <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="material-icons mr-2 text-blue-600">support_agent</span>
              Select your support type
            </h3> */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                onClick={() => setSupportType('support-seeker')}
                  className={`py-3 px-4 rounded-full border transition-colors flex items-center justify-center ${
                  supportType === 'support-seeker'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary/30'
                  }`}
                >
                  <span className="material-icons mr-2 text-sm">favorite</span>
                  I want to vent out
                </button>
                <button
                onClick={() => setSupportType('support-giver')}
                  className={`py-3 px-4 rounded-full border transition-colors flex items-center justify-center ${
                  supportType === 'support-giver'
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary/30'
                  }`}
                >
                  <span className="material-icons mr-2 text-sm">volunteer_activism</span>
                  I want to be there for others
                </button>
              </div>
            </motion.div>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="bg-white rounded-lg p-5 shadow-sm"
        >
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <span className="material-icons mr-2 text-green-600">edit_note</span>
            Share your personal journey
          </h3>
          <textarea
            value={journeyNote}
            onChange={(e) => setjourneyNote(e.target.value)}
            placeholder="Tell us about your professional challenges, experiences, or how you've overcome workplace stress..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none h-32"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex flex-col space-y-4 pt-6"
        >
          <Button
            onClick={handleContinue}
            className="w-full py-6 text-lg rounded-full"
          >
            Continue
          </Button>
          <Button
            onClick={() => router.push('/onboarding')}
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