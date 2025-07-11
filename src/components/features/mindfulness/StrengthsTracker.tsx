'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMindfulness } from '@/hooks/useMindfulness';
import { useAuth } from '@/hooks/useAuth';
import { StrengthEntry } from '@/lib/mindfulness';

interface StrengthsTrackerProps {
  onClose: () => void;
}

export default function StrengthsTracker({ onClose }: StrengthsTrackerProps) {
  const { user } = useAuth();
  const { entries, isLoading, createStrengthEntry, deleteEntry } = useMindfulness({ type: 'strength', autoFetch: true });
  const [newStrength, setNewStrength] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState<'new' | 'past'>('new');
  const [showSavedAnimation, setShowSavedAnimation] = useState(false);
  
  const strengthCategories = [
    { id: 'personal', name: 'Personal', color: 'bg-blue-100 text-blue-700' },
    { id: 'social', name: 'Social', color: 'bg-green-100 text-green-700' },
    { id: 'professional', name: 'Professional', color: 'bg-purple-100 text-purple-700' },
    { id: 'emotional', name: 'Emotional', color: 'bg-yellow-100 text-yellow-700' },
    { id: 'cognitive', name: 'Cognitive', color: 'bg-red-100 text-red-700' },
  ];
  
  const getCategoryColor = (categoryId: string) => {
    const category = strengthCategories.find(c => c.id === categoryId);
    return category ? category.color : 'bg-gray-100 text-gray-700';
  };
  
  const handleSaveStrength = async () => {
    if (!newStrength.trim() || !selectedCategory) return;
    
    await createStrengthEntry(newStrength, selectedCategory);
    setNewStrength('');
    setSelectedCategory('');
    setShowSavedAnimation(true);
    setTimeout(() => setShowSavedAnimation(false), 1500);
  };
  
  const handleDeleteStrength = async (id: string) => {
    await deleteEntry(id);
  };
  
  return (
    <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] flex flex-col" style={{ minHeight: '500px' }}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold">Your Strengths</h2>
          <p className="text-sm text-gray-500">Recognize and celebrate your personal strengths</p>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      {/* Tab Switcher */}
      <div className="flex mb-4 border-b">
        <button
          className={`px-4 py-2 font-medium focus:outline-none ${activeTab === 'new' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('new')}
        >
          New Entry
        </button>
        <button
          className={`px-4 py-2 font-medium focus:outline-none ${activeTab === 'past' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('past')}
        >
          Past Reflections
        </button>
      </div>
      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'new' ? (
          <div className="space-y-6">
            {/* Add new strength */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Add a New Strength</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {strengthCategories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedCategory === category.id
                            ? category.color + ' font-medium'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Strength Description
                  </label>
                  <textarea
                    value={newStrength}
                    onChange={(e) => setNewStrength(e.target.value)}
                    placeholder="e.g., I'm good at listening to others' problems"
                    className="w-full p-3 border border-gray-300 rounded-lg h-20"
                  />
                </div>
                
                <Button
                  onClick={handleSaveStrength}
                  disabled={!newStrength.trim() || !selectedCategory || isLoading}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  {isLoading ? 'Saving...' : 'Save Strength'}
                </Button>
              </div>
            </div>
            {showSavedAnimation && (
              <div className="flex items-center justify-center my-4 animate-fade-in-out">
                <span className="material-icons text-green-500 text-3xl mr-2">check_circle</span>
                <span className="text-green-600 font-semibold text-lg">Saved!</span>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 className="font-medium mb-3">Your Strengths</h3>
            
            {isLoading && entries.length === 0 ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
                <p className="text-gray-500">Loading your strengths...</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">You haven't added any strengths yet.</p>
                <p className="text-gray-500 text-sm">Add your first strength above!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(entries as StrengthEntry[]).map(entry => (
                  <div 
                    key={entry.id} 
                    className="border rounded-lg p-4 relative group"
                  >
                    <div className="flex items-center mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(entry.category || '')}`}>
                        {strengthCategories.find(c => c.id === entry.category)?.name || 'Other'}
                      </span>
                      <span className="text-xs text-gray-500 ml-auto">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{entry.content}</p>
                    
                    {/* Delete button (only visible on hover) */}
                    <button
                      onClick={() => handleDeleteStrength(entry.id)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete strength"
                    >
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 