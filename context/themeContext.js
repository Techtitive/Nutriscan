import { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes } from '../constant/themes';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState('amoled');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const saved = await AsyncStorage.getItem('Theme');

    if (saved && themes[saved]) {
      setThemeName(saved);
    }
  };

  const changeTheme = async (name) => {
    if (!themes[name]) return;

    setThemeName(name);

    await AsyncStorage.setItem('Theme', name);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: themes[themeName],
        themeName,
        changeTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
