import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from './context/themeContext';
import { LinkProvider } from './context/linkContext';

import AppNavigator from './appNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LinkProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </GestureHandlerRootView>
        </LinkProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
