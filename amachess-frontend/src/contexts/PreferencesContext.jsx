import React, { createContext, useState, useContext, useEffect } from 'react';

// Default preferences
const defaultPreferences = {
  showCoordinates: true,
  highlightMoves: true,
  soundEffects: false,
  dailyPuzzleReminders: true,
  gameAnalysisReady: true,
};

const PreferencesContext = createContext();

export const usePreferences = () => useContext(PreferencesContext);

export const PreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [loaded, setLoaded] = useState(false);

  // Load preferences from localStorage on component mount
  useEffect(() => {
    const storedPreferences = localStorage.getItem('amachessPreferences');
    if (storedPreferences) {
      try {
        setPreferences(JSON.parse(storedPreferences));
      } catch (error) {
        console.error('Failed to parse stored preferences:', error);
      }
    }
    setLoaded(true);
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (loaded) {
      localStorage.setItem('amachessPreferences', JSON.stringify(preferences));
    }
  }, [preferences, loaded]);

  // Toggle a preference
  const togglePreference = (preferenceName) => {
    setPreferences(prev => ({
      ...prev,
      [preferenceName]: !prev[preferenceName]
    }));
  };

  // Update multiple preferences at once
  const updatePreferences = (newPreferences) => {
    setPreferences(prev => ({
      ...prev,
      ...newPreferences
    }));
  };

  const value = {
    preferences,
    togglePreference,
    updatePreferences,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};
