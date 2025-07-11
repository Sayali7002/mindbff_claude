'use client'

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/components/profile/ProfileSetup';
import { useAuth } from '@/hooks/useAuth';
import EnhancedJournal from '@/components/features/mindfulness/EnhancedJournal';
import EnhancedGratitudeJournal from '@/components/features/mindfulness/EnhancedGratitudeJournal';
import EnhancedFocusTimer from '@/components/features/mindfulness/EnhancedFocusTimer';
import StrengthsTracker from '@/components/features/mindfulness/StrengthsTracker';
import EnhancedAffirmations from '@/components/features/mindfulness/EnhancedAffirmations';
import QuickBreathe from '@/components/features/mindfulness/QuickBreathe';
import EnhancedMeditation from '@/components/features/mindfulness/EnhancedMeditation';
import { supabase } from '@/lib/supabase';
import WhiteNoisePlayer from '@/components/ui/WhiteNoisePlayer';

// Add custom animation styles
const fadeInAnimation = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;

interface MeditationTrack {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  icon: string;
  audioUrl: string;
  instructor: string;
  completed?: boolean;
  favorite?: boolean;
  fileId?: string;
}

interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood: string;
  tags: string[];
}

interface GratitudeEntry {
  id: string;
  date: string;
  content: string;
  category: string;
}

interface Affirmation {
  id: string;
  text: string;
  category: string;
  favorite?: boolean;
}

interface Strengths {

}

interface QuickBreathe {

}

// Categories for filtering
const categories = [
  'All',
  'Meditation',
  'Breathing',
  'Movement',
  'Sleep',
  'Focus',
  'Chanting'
];



const affirmations: Affirmation[] = [
  {
    id: '1',
    text: 'I am capable of handling whatever comes my way',
    category: 'Confidence'
  },
  {
    id: '2',
    text: 'I choose to be calm and peaceful',
    category: 'Peace'
  },
  {
    id: '3',
    text: 'I am worthy of love and respect',
    category: 'Self-Love'
  },
  {
    id: '4',
    text: 'I trust in my journey and my growth',
    category: 'Growth'
  }
];

// Add streak data interface
interface StreakData {
   mindfulness: number;
 // meditation: number;
  //journaling: number;
  //gratitude: number;
  //focus: number;
  //affirmations: number;
  lastUpdated: string;
  lastMindfulnessDate: string;
  // Track the last completion date for each activity type to calculate streaks
  //lastMeditationDate: string;
  //lastJournalingDate: string;
  //lastGratitudeDate: string;
  //lastFocusDate: string;
  //lastAffirmationsDate: string;
} 

// Update the GoogleDriveAudio component to handle guest users
const GoogleDriveAudio = ({ 
  fileId, 
  title, 
  onEnded, 
  isAuthenticated,
  onRequestSignup
}: { 
  fileId: string; 
  title: string; 
  onEnded?: () => void;
  isAuthenticated: boolean;
  onRequestSignup: () => void;
}) => {
  // Extract file ID from URL if a full URL is provided
  const getFileId = (idOrUrl: string) => {
    if (idOrUrl.includes('drive.google.com')) {
      const match = idOrUrl.match(/[-\w]{25,}/);
      return match ? match[0] : idOrUrl;
    }
    return idOrUrl;
  };

  const cleanFileId = getFileId(fileId);
  // Use Google Drive's embedded preview player directly
  const embedUrl = `https://drive.google.com/file/d/${cleanFileId}/preview`;

  // Set up event listener for completion (approximate)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Listen for messages from the iframe (this is approximate as Google Drive doesn't send clear "ended" events)
      if (event.data && typeof event.data === 'string' && event.data.includes('complete') && onEnded) {
        onEnded();
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onEnded]);

  const handleMarkComplete = () => {
    if (isAuthenticated) {
      // For authenticated users, just mark as complete
      if (onEnded) onEnded();
    } else {
      // For guest users, redirect to signup
      onRequestSignup();
    }
  };

  return (
    <div className="google-drive-player rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
      <iframe
        src={embedUrl}
        width="100%"
        height="180"
        allow="autoplay"
        title={title}
        className="w-full"
        frameBorder="0"
      ></iframe>
      <div className="p-3 text-center">
        <p className="text-sm text-gray-600">Playing: {title}</p>
        <button 
          onClick={handleMarkComplete} 
          className="mt-2 text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full"
        >
          Mark as Complete {!isAuthenticated && '(Sign Up)'}
        </button>
      </div>
    </div>
  );
};

export default function MindfulnessPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [resources, setResources] = useState<MeditationTrack[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentResource, setCurrentResource] = useState<MeditationTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Journal states
  const [showJournal, setShowJournal] = useState(false);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [currentJournalEntry, setCurrentJournalEntry] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  
  // Gratitude states
  const [showGratitude, setShowGratitude] = useState(false);
  const [gratitudeEntries, setGratitudeEntries] = useState<GratitudeEntry[]>([]);
  const [currentGratitudeEntry, setCurrentGratitudeEntry] = useState('');
  const [selectedGratitudeCategory, setSelectedGratitudeCategory] = useState('');
  
  // Focus timer states
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const [focusTime, setFocusTime] = useState(25);
  const [isFocusTimerRunning, setIsFocusTimerRunning] = useState(false);
  const [focusTimerProgress, setFocusTimerProgress] = useState(0);
  
  // Affirmation states
  const [showAffirmations, setShowAffirmations] = useState(false);
  const [currentAffirmations, setCurrentAffirmations] = useState<Affirmation[]>(affirmations);
  const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState(0);

  // Quick Breathe states
  const [showQuickBreathe, setShowQuickBreathe] = useState(false);
  const [currentQuickBreathe, setCurrentQuickBreathe] = useState<QuickBreathe[]>([]);
  const [currentQuickBreatheIndex, setCurrentQuickBreatheIndex] = useState(0);

  // Strengths states
  const [showStrengths, setShowStrengths] = useState(false);
  const [currentStrengths, setCurrentStrengths] = useState<Strengths[]>([]);
  const [currentStrengthsIndex, setCurrentStrengthsIndex] = useState(0);
  
  // Add streak states
  const [streakData, setStreakData] = useState<StreakData>({
    mindfulness:0,
    lastUpdated: new Date().toISOString(),
    lastMindfulnessDate: ''
    /* meditation: 0,
    journaling: 0,
    gratitude: 0,
    focus: 0,
    affirmations: 0,
    lastUpdated: new Date().toISOString(),
    lastMeditationDate: '',
    lastJournalingDate: '',
    lastGratitudeDate: '',
    lastFocusDate: '',
    lastAffirmationsDate: '' */
  });

  // Add new state for affirmation display
  const [showAffirmationsList, setShowAffirmationsList] = useState(false);
  
  useEffect(() => {
    // Check authentication status - directly use user from useAuth()
    setIsAuthenticated(!!user);
    
    // Load meditation resources
    const meditationTracks = [
      
      {
        id: '1',
        title: 'Body Scan Relaxation',
        description: 'Progressive relaxation technique for whole-body awareness',
        duration: '15:12',
        category: 'Meditation',
        icon: '👁️',
        audioUrl: 'https://meditation-track.s3.ap-south-1.amazonaws.com/Body+Scan+Guided+Meditation+-+Male+Voice.mp3',
        instructor: 'Diana Winston'
      },
      {
        id: '2',
        title: 'Loving-Kindness Meditation',
        description: 'Practice extending compassion and good wishes to yourself and others',
        duration: '12:35',
        category: 'Meditation',
        icon: '❤️',
        audioUrl: 'https://meditation-track.s3.ap-south-1.amazonaws.com/GuidedMeditation-LovingKindness_FIXED.mp3',
        instructor: 'Dr. Emma Seppälä'
      },

      {
        id: '3',
        title: 'Gratitude Meditation',
        description: 'Cultivate gratitude with this guided meditation',
        duration: '10:00',
        category: 'Meditation',
        icon: '🙏',
        audioUrl: 'https://meditation-track.s3.ap-south-1.amazonaws.com/GuidedMeditation_Gratitude_revised031518.mp3',
        instructor: 'Dr. Emma Seppälä'
      }
    ];
    
    setResources(meditationTracks);
    setIsLoading(false);

    // Fix for Safari AudioContext issue
    document.addEventListener('click', () => {
      if (audioRef.current) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(_ => {
            // Automatic playback started
            audioRef.current?.pause();
          }).catch(error => {
            // Auto-play was prevented
            console.log("Audio playback prevented:", error);
          });
        }
      }
    }, { once: true });

    // Initialize or load streak data from localStorage
 {/*}   const savedStreak = localStorage.getItem('mindfulness_streak');
    if (savedStreak) {
      try {
        setStreakData(JSON.parse(savedStreak));
      } catch (e) {
        console.error('Error parsing streak data:', e);
      }
    } */}
  }, [user, isLoading]);

  // Update effect to save streak data
  {/* useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('mindfulnessStreaks', JSON.stringify(streakData));
    }
  }, [streakData, isAuthenticated]); */}
  // Fetch streak data when authenticated
  useEffect(() => {
    const fetchStreakData = async () => {
      if (user) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            console.error('No session found for fetching streak');
            return;
          }

          const response = await fetch('/api/mindfulness/streak', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch streak data');
          }

          const result = await response.json();
          if (result.data) {
            setStreakData(result.data);
          }
        } catch (error) {
          console.error('Error fetching streak data:', error);
          setStreakData({
            mindfulness: 0,
            lastUpdated: new Date().toISOString(),
            lastMindfulnessDate: ''
          });
        }
      } else {
        // Reset streak data for unauthenticated users
        setStreakData({
          mindfulness: 0,
          lastUpdated: new Date().toISOString(),
          lastMindfulnessDate: ''
        });
      }
    };

    fetchStreakData();
  }, [user]);


  // Audio player functions
  const handlePlayPause = () => {
    if (!isAuthenticated) {
      router.push('/auth/signup?redirect=mindfulness');
      return;
    }
    
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Helper function to update streak for a specific activity
  const updateStreak = async (activityType: 'mindfulness') => {
    if (!isAuthenticated) return;
    
    try {
      // Get the current session to include the authorization header
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('No session found for streak update');
        return;
      }
      
      // Call the API endpoint to update streak
      const response = await fetch('/api/mindfulness/streak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          activityType,
          userId: user?.id
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update streak');
      }
      
      const data = await response.json();
      
    {/*}  // Update local state
      setStreakData(prev => ({
        ...prev,
        [activityType]: data.data?.mindfulness || prev[activityType] + 1,
        lastUpdated: new Date().toISOString(),
        [`last${activityType.charAt(0).toUpperCase() + activityType.slice(1)}Date`]: new Date().toISOString().split('T')[0]
      }));
      
    } catch (error) {
      console.error('Error updating streak:', error);
      
      // Fall back to the local storage approach if API call fails
      const today = new Date().toISOString().split('T')[0];
    
    setStreakData(prev => {
      // Get the last completion date for this activity
      const lastDateKey = `last${activityType.charAt(0).toUpperCase() + activityType.slice(1)}Date` as 
          'lastMindfulnessDate';
      const lastDate = prev[lastDateKey];
      
      // If there's no last date or it's from a previous day, increment streak
      // If it's from today, don't increment (prevent multiple increments in same day)
      let newStreak = prev[activityType];
      
      if (!lastDate || lastDate !== today) {
        newStreak += 1;
      }
      
      const updatedStreak = {
        ...prev,
        [activityType]: newStreak,
        [lastDateKey]: today,
        lastUpdated: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem('mindfulness', JSON.stringify(updatedStreak));
      
      return updatedStreak;
    });
    }
  }; */}
      // Update local state with data from API response
      if (data.data) {
        setStreakData(data.data);
      }
      
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  // Journal functions
  const saveJournalEntry = () => {
    if (!isAuthenticated) {
      router.push('/auth/signup?redirect=mindfulness');
      return;
    }

    if (currentJournalEntry.trim()) {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        content: currentJournalEntry,
        mood: selectedMood,
        tags: []
      };
      setJournalEntries([...journalEntries, newEntry]);
      setCurrentJournalEntry('');
      setSelectedMood('');
      
      // Update streak
     // updateStreak('journaling');
          updateStreak('mindfulness');

    }
  };

  // Gratitude functions
  const saveGratitudeEntry = () => {
    if (!isAuthenticated) {
      router.push('/auth/signup?redirect=mindfulness');
      return;
    }

    if (currentGratitudeEntry.trim()) {
      const newEntry: GratitudeEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        content: currentGratitudeEntry,
        category: selectedGratitudeCategory
      };
      setGratitudeEntries([...gratitudeEntries, newEntry]);
      setCurrentGratitudeEntry('');
      setSelectedGratitudeCategory('');
      
      // Update streak
      //updateStreak('gratitude');
      updateStreak('mindfulness');

    }
  };

  // Focus timer functions
  const startFocusTimer = () => {
    if (!isAuthenticated) {
      router.push('/auth/signup?redirect=mindfulness');
      return;
    }

    setIsFocusTimerRunning(true);
    const timer = setInterval(() => {
      setFocusTime(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          setIsFocusTimerRunning(false);
          // Update streak when timer completes
          //updateStreak('focus');
          updateStreak('mindfulness');
          return 25;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Filter resources by category
  const filteredResources = selectedCategory === 'All' 
    ? resources 
    : resources.filter(r => r.category === selectedCategory);


  // Add category streak data
  const getCategoryStreak = (category: string) => {
    switch(category) {
      case 'Mindfulness':
        return streakData.mindfulness;
      /*case 'Meditation':
        return streakData.meditation;
      case 'Journaling':
        return streakData.journaling;
      case 'Focus':
        return streakData.focus;
      case 'Gratitude':
        return streakData.gratitude;
      case 'Affirmations':
        return streakData.affirmations; */
      default:
        return 0;
    }
  };

  // Affirmation functions
  const handleNextAffirmation = () => {
    setCurrentAffirmationIndex((prev) => (prev + 1) % currentAffirmations.length);
  };
  
  const handlePrevAffirmation = () => {
    setCurrentAffirmationIndex((prev) => 
      prev === 0 ? currentAffirmations.length - 1 : prev - 1
    );
  };
  
  // Handle focus timer completion
  const handleFocusComplete = () => {
    updateStreak('mindfulness');
  };

  // Add test function for debugging authentication
  const testAuth = async () => {
    try {
      // Get the current session to include the authorization header
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('No session found - user not authenticated');
        return;
      }
      
      const response = await fetch('/api/mindfulness/test', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      const data = await response.json();
      console.log('Auth test result:', data);
      alert(`Auth test: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error('Auth test error:', error);
      alert('Auth test failed');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Main content view
  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Mind Essentials
          </h1>
          {isAuthenticated && (
            <div className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center">
              🔥 {streakData.mindfulness} days
            </div>
          )}
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            className="flex items-center"
          >
            <span className="material-icons">home</span>
          </Button>
        </div>
        <div className="text-lg text-gray-600 font-medium mb-2">10-min mindfulness curated for you</div>
        {/* Mindfulness Tools in custom order */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {/* Journal - 5 mins */}
          <button
            onClick={() => isAuthenticated ? setShowJournal(true) : router.push('/auth/signup?redirect=mindfulness')}
            className="bg-purple-50 hover:bg-purple-100 rounded-lg p-4 flex flex-col items-center shadow transition relative"
          >
            <span className="material-icons text-4xl text-purple-500 mb-2">menu_book</span>
            <span className="font-semibold">Journal</span>
            <span className="text-xs text-gray-500 mt-1">Write your thoughts and feelings</span>
            {/*{isAuthenticated && (
              <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                🔥 {streakData.journaling} days
              </div>
            )} */}
           {/* <div className="absolute top-8 right-8 text-blue-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div> */}
            <span className="absolute top-2 right-2 bg-white text-purple-500 text-xs px-2 py-0.5 rounded-full border border-purple-200">5 min</span>
          </button>
          {/* Gratitude - 2 mins */}
          <button
            onClick={() => isAuthenticated ? setShowGratitude(true) : router.push('/auth/signup?redirect=mindfulness')}
            className="bg-pink-50 hover:bg-pink-100 rounded-lg p-4 flex flex-col items-center shadow transition relative"
          >
            <span className="material-icons text-4xl text-pink-500 mb-2">favorite</span>
            <span className="font-semibold">Gratitude</span>
            <span className="text-xs text-gray-500 mt-1">Reflect on what you're grateful for</span>
           {/* {isAuthenticated && (
              <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                🔥 {streakData.gratitude} days
              </div>
            )} */}
             <span className="absolute top-2 right-2 bg-white text-pink-500 text-xs px-2 py-0.5 rounded-full border border-pink-200">2 min</span>
         
          </button>
          {/* Affirmations - 1 min */}
          <button
            onClick={() => isAuthenticated ? setShowAffirmations(true) : router.push('/auth/signup?redirect=mindfulness')}
            className="bg-green-50 hover:bg-green-100 rounded-lg p-4 flex flex-col items-center shadow transition relative"
          >
            <span className="material-icons text-4xl text-green-500 mb-2">self_improvement</span>
            <span className="font-semibold">Affirmations</span>
            <span className="text-xs text-gray-500 mt-1">Boost your mood with positive affirmations</span>
           {/* {isAuthenticated && (
              <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                🔥 {streakData.affirmations || 0} days
              </div>
            )} */}
           <span className="absolute top-2 right-2 bg-white text-green-500 text-xs px-2 py-0.5 rounded-full border border-green-200">1 min</span>
         
          </button>
          {/* Quick Breathe - 2 mins */}
          <button
            onClick={() => isAuthenticated ? setShowQuickBreathe(true) : router.push('/auth/signup?redirect=mindfulness')}
            className="bg-cyan-50 hover:bg-cyan-100 rounded-lg p-4 flex flex-col items-center shadow transition relative"
          >
            <span className="material-icons text-4xl text-cyan-500 mb-2">air</span>
            <span className="font-semibold">Quick Breathe</span>
            <span className="text-xs text-gray-500 mt-1">Take a calming breathing break</span>
            <span className="absolute top-2 right-2 bg-white text-cyan-500 text-xs px-2 py-0.5 rounded-full border border-cyan-200">2 min</span>
          </button>
          {/* Focus Timer - last */}
          <button
            onClick={() => isAuthenticated ? setShowFocusTimer(true) : router.push('/auth/signup?redirect=mindfulness')}
            className="bg-yellow-50 hover:bg-yellow-100 rounded-lg p-4 flex flex-col items-center shadow transition"
          >
            <span className="material-icons text-4xl text-yellow-500 mb-2">timer</span>
            <span className="font-semibold">Focus Timer</span>
            <span className="text-xs text-gray-500 mt-1">Practice mindful focus and breathing</span>
           {/* {isAuthenticated && (
              <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                🔥 {streakData.focus} days
              </div>
            )} */}
          </button>
          {/* Strengths - last */}
          <button
            onClick={() => isAuthenticated ? setShowStrengths(true) : router.push('/auth/signup?redirect=mindfulness')}
            className="bg-orange-50 hover:bg-orange-100 rounded-lg p-4 flex flex-col items-center shadow transition"
          >
            <span className="material-icons text-4xl text-orange-500 mb-2">emoji_events</span>
            <span className="font-semibold">Your Strengths</span>
            <span className="text-xs text-gray-500 mt-1">Track and celebrate your strengths</span>
          </button>
        </div>

        

        {/* Category Filters */}
        <div className="bg-white p-3 rounded-xl shadow-sm overflow-x-auto">
          <div className="flex space-x-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
           {/* Add White Noise Player here */}
        <div className="fixed bottom-8 left-8 z-50">
 
       <WhiteNoisePlayer s3AudioUrl="https://meditation-track.s3.ap-south-1.amazonaws.com/02-White-Noise-10min.mp3" />
       </div>


        {/* Meditation Resources with streak data - 2 per row with play icon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map(resource => (
            <div 
              key={resource.id}
              onClick={() => {
                if (isAuthenticated) {
                  setCurrentResource(resource);
                } else {
                  router.push('/auth/signup?redirect=mindfulness');
                }
              }}
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all relative"
            >
              
              <div className="flex items-start space-x-4">
                
                <span className="material-icons text-3xl text-slate-600">{resource.icon}</span>
                <div className="flex-1">
                  
                  <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                  <p className="text-sm text-gray-600">{resource.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-gray-500">{resource.duration}</span>
                    <span className="text-sm text-gray-500">{resource.instructor}</span>
                    <button
                    className="mt-3 w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center ml-auto"
                    aria-label="Play meditation"
                  >
                    <span className="material-icons">play_arrow</span>
                  </button>
                  </div>
                
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Audio Player Modal */}
        {currentResource && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <EnhancedMeditation 
              onClose={() => setCurrentResource(null)} 
              currentResource={currentResource}
            />
          </div>
        )}
        
        {/* Journal Modal */}
        {showJournal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <EnhancedJournal 
              onClose={() => setShowJournal(false)}
              onNextActivity={() => { setShowJournal(false); setShowGratitude(true); }}
            />
          </div>
        )}
        
        {/* Gratitude Modal */}
        {showGratitude && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <EnhancedGratitudeJournal 
              onClose={() => setShowGratitude(false)}
              onNextActivity={() => { setShowGratitude(false); setShowAffirmations(true); }}
            />
          </div>
        )}
        
        {/* Affirmations Modal */}
        {showAffirmations && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <EnhancedAffirmations 
              onClose={() => setShowAffirmations(false)}
              //onComplete={() => updateStreak('mindfulness')}
              onNextActivity={() => { setShowAffirmations(false); setShowQuickBreathe(true); }}
            />
          </div>
        )}
        
        {/* Focus Timer Modal */}
        {showFocusTimer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <EnhancedFocusTimer 
              onClose={() => setShowFocusTimer(false)}
              onComplete={handleFocusComplete}
            />
          </div>
        )}
        
        {/* Quick Breathe Modal */}
        {showQuickBreathe && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <QuickBreathe 
              onClose={() => setShowQuickBreathe(false)}
              onComplete={() => updateStreak('mindfulness')}
              onNextActivity={() => { setShowQuickBreathe(false); setShowFocusTimer(true); }}
            />
          </div>
        )}
        
        {/* Strengths Modal */}
        {showStrengths && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <StrengthsTracker onClose={() => setShowStrengths(false)} />
          </div>
        )}
      </div>
    </div>
  );
}