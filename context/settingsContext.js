import React, { createContext, useContext, useEffect, useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@nutriscan_settings';

const DEFAULT_SETTINGS = {
  // Scanner
  vibrateOnScan: true,
  scanSound: true,
  autoOpenScanner: false,
  scannerFlash: false,

  // Shopping
  linkToBuy: true,
  sortToBuy: 'date',
  showCompletedItems: true,

  // Favourites
  sortFavourites: 'recent',

  // Recents
  recentLimit: 25,
  autoRemoveOldRecents: false,
  scanHistory: true,

  // Notifications
  notifications: true,
  priceAlerts: false,
  productReminders: false,

  // Nutrition
  energyUnit: 'kcal',
  nutritionDisplay: '100g',
  showHealthWarnings: true,
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Load saved settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);

      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);

        // Merge with defaults so new settings added later
        // don't break existing users.
        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsedSettings,
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setSettingsLoaded(true);
    }
  };

  // Update one setting
  const updateSetting = async (key, value) => {
    try {
      const updatedSettings = {
        ...settings,
        [key]: value,
      };

      setSettings(updatedSettings);

      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  // Reset everything
  const resetSettings = async () => {
    try {
      setSettings(DEFAULT_SETTINGS);

      await AsyncStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(DEFAULT_SETTINGS),
      );
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings,
        settingsLoaded,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useSettings must be used inside SettingsProvider');
  }

  return context;
}
