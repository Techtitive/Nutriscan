import { registerRootComponent } from 'expo';
import { ThemeProvider } from './context/themeContext';
import { SettingsProvider } from './context/settingsContext';
import App from './App';

function Root() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </ThemeProvider>
  );
}

registerRootComponent(Root);
