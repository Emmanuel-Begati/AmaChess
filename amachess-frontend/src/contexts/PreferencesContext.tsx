import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserPreferences, PreferencesContextType } from '../types';

interface PreferencesProviderProps {
  children: ReactNode;
}

const PreferencesContext = createContext<PreferencesContextType | null>(null);

const defaultPreferences: UserPreferences = {
  theme: 'dark',
  boardTheme: 'default',
  pieceSet: 'default',
  soundEnabled: true,
  showLegalMoves: true,
  autoPromoteToQueen: false,
  boardFlipped: false,
  animationSpeed: 'normal',
  showCoordinates: true,
  highlightMoves: true,
  soundEffects: true,
  dailyPuzzleReminders: false,
  gameAnalysisReady: true,
  language: 'en'
};

export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};

export const PreferencesProvider: React.FC<PreferencesProviderProps> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('userPreferences');
      return saved ? { ...defaultPreferences, ...JSON.parse(saved) } : defaultPreferences;
    } catch (error) {
      console.error('Error loading preferences:', error);
      return defaultPreferences;
    }
  });

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [preferences]);

  const updatePreferences = (updates: Partial<UserPreferences>): void => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  const resetPreferences = (): void => {
    setPreferences(defaultPreferences);
  };

  const value: PreferencesContextType = {
    preferences,
    updatePreferences,
    resetPreferences
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};
