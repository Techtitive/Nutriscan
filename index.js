import { registerRootComponent } from 'expo';
import { ThemeProvider } from './context/themeContext';
import App from './App';

function Root() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

registerRootComponent(Root);
