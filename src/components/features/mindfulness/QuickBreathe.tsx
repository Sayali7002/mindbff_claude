'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import HelperIcon from './HelperIcon';

interface QuickBreatheProps {
  onClose: () => void;
  onComplete?: () => void;
  onNextActivity?: () => void;
}

// Breathing patterns (in seconds)
const BREATHING_PATTERNS = {
  inhale: 4,
  hold: 4,
  exhale: 4,
  pause: 2,
};

// Duration options in minutes
const DURATION_OPTIONS = [1, 2, 5, 10];

export default function QuickBreathe({ onClose, onComplete, onNextActivity }: QuickBreatheProps) {
  const [duration, setDuration] = useState(2); // Default 2 minutes
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert to seconds
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(BREATHING_PATTERNS.inhale);
  const [breathCount, setBreathCount] = useState(0);
  
  // Refs for intervals
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const phaseIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set up the timer when duration changes
  useEffect(() => {
    setTimeLeft(duration * 60);
  }, [duration]);
  
  // Handle breathing phases
  useEffect(() => {
    if (!isActive) return;
    
    // Clear any existing phase interval
    if (phaseIntervalRef.current) {
      clearInterval(phaseIntervalRef.current);
    }
    
    // Set up phase interval
    setPhaseTimeLeft(BREATHING_PATTERNS[breathingPhase]);
    
    phaseIntervalRef.current = setInterval(() => {
      setPhaseTimeLeft((prev) => {
        if (prev <= 1) {
          // Move to next phase
          switch (breathingPhase) {
            case 'inhale':
              setBreathingPhase('hold');
              return BREATHING_PATTERNS.hold;
            case 'hold':
              setBreathingPhase('exhale');
              return BREATHING_PATTERNS.exhale;
            case 'exhale':
              setBreathingPhase('pause');
              return BREATHING_PATTERNS.pause;
            case 'pause':
              setBreathingPhase('inhale');
              setBreathCount((prev) => prev + 1);
              return BREATHING_PATTERNS.inhale;
            default:
              return BREATHING_PATTERNS.inhale;
          }
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (phaseIntervalRef.current) {
        clearInterval(phaseIntervalRef.current);
      }
    };
  }, [isActive, breathingPhase]);
  
  // Handle main timer
  useEffect(() => {
    if (!isActive) return;
    
    // Clear any existing timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    // Set up timer interval
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isActive]);
  
  // Handle start/stop
  const handleToggleActive = () => {
    if (isActive) {
      setIsActive(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (phaseIntervalRef.current) clearInterval(phaseIntervalRef.current);
    } else {
      setIsActive(true);
      setBreathingPhase('inhale');
      setPhaseTimeLeft(BREATHING_PATTERNS.inhale);
    }
  };
  
  // Handle reset
  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(duration * 60);
    setBreathingPhase('inhale');
    setPhaseTimeLeft(BREATHING_PATTERNS.inhale);
    setBreathCount(0);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (phaseIntervalRef.current) clearInterval(phaseIntervalRef.current);
  };
  
  // Handle completion
  const handleComplete = () => {
    setIsActive(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (phaseIntervalRef.current) clearInterval(phaseIntervalRef.current);
    if (onComplete) onComplete();
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get orb size based on breathing phase
  const getOrbSize = () => {
    switch (breathingPhase) {
      case 'inhale':
        return 1 - phaseTimeLeft / BREATHING_PATTERNS.inhale;
      case 'hold':
        return 1;
      case 'exhale':
        return phaseTimeLeft / BREATHING_PATTERNS.exhale;
      case 'pause':
        return 0;
      default:
        return 0.5;
    }
  };
  
  // Get emoji based on breathing phase
  const getEmoji = () => {
    switch (breathingPhase) {
      case 'inhale':
        return '😌';
      case 'hold':
        return '😊';
      case 'exhale':
        return '😌';
      case 'pause':
        return '😌';
      default:
        return '😌';
    }
  };
  
  // Get instruction text based on breathing phase
  const getInstructionText = () => {
    switch (breathingPhase) {
      case 'inhale':
        return 'Inhale';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Exhale';
      case 'pause':
        return 'Pause';
      default:
        return '';
    }
  };
  
  return (
    <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto relative">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Quick Breathe</h2>
          <HelperIcon
            content={
              <ul className="list-disc pl-5 space-y-1">
                <li>Find a comfortable seated position</li>
                <li>Breathe in deeply through your nose</li>
                <li>Hold your breath comfortably</li>
                <li>Exhale slowly through your mouth</li>
                <li>Focus on the sensation of breathing</li>
              </ul>
            }
            icon="lightbulb"
            label="Show breathing tips"
          />
        </div>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      {/* Duration selector */}
      {!isActive && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Select Duration</h3>
          <div className="flex space-x-2">
            {DURATION_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => setDuration(option)}
                className={`flex-1 py-2 rounded-lg transition-colors ${
                  duration === option
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option} min
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Breathing visualization */}
      <div className="relative flex flex-col items-center justify-center h-80 mb-8">
        <AnimatePresence>
          {isActive && (
            <>
              {/* Breathing orb - shifted up and reduced size */}
              <motion.div
                className="absolute rounded-full bg-blue-500 bg-opacity-20"
                animate={{
                  scale: getOrbSize() * 0.6 + 0.4, // Reduced from 0.8 to 0.6 (scale between 0.2 and 0.8)
                }}
                transition={{
                  duration: 1,
                  ease: "easeInOut"
                }}
                style={{
                  width: '200px', // Reduced from 240px
                  height: '200px', // Reduced from 240px
                  top: '20px', // Shift up from center
                }}
              />
              
              {/* Static emoji - fixed size, no animation */}
              <div
                className="absolute flex items-center justify-center"
                style={{
                  width: '100px',
                  height: '100px',
                  top: '70px', // Shift up from center
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                <span className="text-3xl">{getEmoji()}</span>
              </div>
              
              {/* Instruction text - moved further down with better spacing */}
              <motion.div
                className="absolute bottom-2 text-center z-10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                key={breathingPhase}
              >
                <h3 className="text-xl font-medium text-blue-800 mb-1">{getInstructionText()}</h3>
                <p className="text-sm text-blue-600 bg-white bg-opacity-90 px-3 py-1 rounded-full shadow-sm">
                  {phaseTimeLeft}s left
                </p>
              </motion.div>
            </>
          )}
          
          {!isActive && !timeLeft && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-medium text-blue-800">Great job!</h3>
              <p className="text-sm text-blue-600">You completed {breathCount} breaths</p>
            </motion.div>
          )}
          
          {!isActive && timeLeft > 0 && !breathCount && (
            <div className="text-center">
              <div className="text-6xl mb-4">🧘‍♀️</div>
              <h3 className="text-xl font-medium text-blue-800">Ready to begin?</h3>
              <p className="text-sm text-blue-600">Press start when you're ready</p>
            </div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Timer display */}
      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-gray-800">{formatTime(timeLeft)}</div>
        <div className="text-sm text-gray-500">
          {isActive ? `${breathCount} breaths completed` : 'Time remaining'}
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={handleToggleActive}
          className={isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'}
          disabled={timeLeft === 0}
        >
          {isActive ? 'Pause' : timeLeft < duration * 60 ? 'Resume' : 'Start'}
        </Button>
        
        <Button
          onClick={handleReset}
          variant="outline"
          className="border-gray-300"
          disabled={timeLeft === duration * 60 && !isActive && breathCount === 0}
        >
          Reset
        </Button>
      </div>
      
      {/* After main CTA, add Next Activity button if provided */}
      {onNextActivity && (
        <Button
          onClick={onNextActivity}
          variant="outline"
          className="w-full mt-3 rounded-full"
        >
          Next Activity
        </Button>
      )}
    </div>
  );
} 