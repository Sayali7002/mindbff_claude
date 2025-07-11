// components/features/mindfulness/WhiteNoisePlayer.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiPlay, FiPause, FiVolume2, FiVolumeX } from 'react-icons/fi';

interface WhiteNoisePlayerProps {
  s3AudioUrl: string;
  initialVolume?: number;
}

const WhiteNoisePlayer: React.FC<WhiteNoisePlayerProps> = ({ s3AudioUrl, initialVolume = 0.5 }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(initialVolume);
  const [showControls, setShowControls] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  // Effect 1: Initialize audio element on first render or s3AudioUrl change
  // This effect runs only once or when s3AudioUrl changes.
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(s3AudioUrl);
      audioRef.current.loop = true;
      audioRef.current.preload = 'auto'; // Load audio metadata and possibly some frames
    }

    // Cleanup function: This runs when the component unmounts.
    return () => {
      if (audioRef.current) {
        audioRef.current.pause(); // Ensure audio stops playing
        audioRef.current.currentTime = 0; // Reset playback position
        audioRef.current = null; // Clear the ref
      }
    };
  }, [s3AudioUrl]); // Dependency array: only re-run if s3AudioUrl changes

  // Effect 2: Synchronize audio element's volume with state
  // This runs whenever the 'volume' state changes.
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Effect 3: Synchronize audio playback (play/pause) with 'isPlaying' state
  // This runs whenever the 'isPlaying' state changes.
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]); // Dependency array: re-run when isPlaying changes

  // Handle play/pause toggle from user interaction
  const togglePlayPause = useCallback(() => {
    // This flips the 'isPlaying' state, which will then trigger Effect 3
    setIsPlaying(prev => {
      const newState = !prev;
      if (newState) { // If playing
        setShowMessage(true);
        // Hide message after 2 seconds
        setTimeout(() => {
          setShowMessage(false);
        }, 5000);
      } else { // If pausing
        setShowMessage(false);
      }
      return newState;
    });
  }, []);

  // Handle volume change from user interaction
  const handleVolumeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume); // This will trigger Effect 2
  }, []);
  // Handle show/hide controls toggle
  const toggleShowControls = useCallback(() => {
    setShowControls(prev => !prev);
  }, []);

  return (
<div className="flex items-center justify-center space-x-4 mb-4">
        {/* Play/Pause Button */}
      <button
        onClick={togglePlayPause}
        className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        aria-label={isPlaying ? "Pause white noise" : "Play white noise"}
        title={isPlaying ? "Pause white noise" : "Play white noise"}
      >
        {isPlaying ? <FiPause size={24} /> : <FiPlay size={24} />}
      </button>

      {/* Message display */}
      {showMessage && (
        <p className="bg-background rounded-3xl text-sm p-1 text-gray-700 animate-fadeIn text-center">
          Relax and focus with ambient sounds.
        </p>
      )}
        {/*  <div className="text-center mb-4">
        <button
          onClick={toggleShowControls}
          className="text-blue-500 hover:text-blue-700 transition-colors flex items-center justify-center mx-auto"
        >
          {showControls ? (
            <>
              Hide Controls <FiChevronUp className="ml-1" />
            </>
          ) : (
            <>
              Show Controls <FiChevronDown className="ml-1" />
            </>
          )}
        </button>
      </div> */}


{showControls && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center space-x-2">
            {volume === 0 ? <FiVolumeX size={20} className="text-gray-600" /> : <FiVolume2 size={20} className="text-gray-600" />}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500"
              aria-label={`Volume: ${Math.round(volume * 100)}%`}
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
            <span className="text-sm text-gray-600 w-10 text-right">{Math.round(volume * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhiteNoisePlayer;