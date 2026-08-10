import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect, useContext } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './screens/homescreen';
import ScannerScreen from './screens/scanner';
import DetailsScreen from './screens/details';
import FavoritesScreen from './screens/favourites';
import TobuyScreen from './screens/tobuy';
import ProfileScreen from './screens/profile';
import RecentsScreen from './screens/recents';
import ToBuyRecentsScreen from './screens/tobuyRecents';
import { ThemeProvider } from './context/themeContext';
import { LinkProvider } from './context/linkContext';
import { ThemeContext } from './context/themeContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { theme } = useContext(ThemeContext);
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconActive,
        tabBarInactiveTintColor: theme.tabIcon,

        tabBarStyle: {
          position: 'absolute',
          bottom: 15,
          right: 15,
          left: 15,

          paddingTop: 6,

          marginRight: 15,
          marginLeft: 15,
          marginBottom: 10,

          height: 65,

          backgroundColor: theme.tabBar,

          borderRadius: 30,

          borderTopWidth: 0,

          elevation: 10,
        },

        headerStyle: {
          backgroundColor: theme.card,
        },

        headerTintColor: theme.primary,

        headerTitleStyle: {
          color: theme.primary,
          fontWeight: 'bold',
          fontSize: 20,
        },

        headerShadowVisible: false,
        headerTitleAlign: 'center',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, size, color }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Recents"
        component={RecentsScreen}
        options={{
          tabBarIcon: ({ focused, size, color }) => (
            <Ionicons
              name={focused ? 'time' : 'time-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Favourites"
        component={FavoritesScreen}
        options={{
          tabBarIcon: ({ focused, size, color }) => (
            <Ionicons
              name={focused ? 'heart' : 'heart-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="ToBuy"
        component={TobuyScreen}
        options={{
          tabBarIcon: ({ focused, size, color }) => (
            <Ionicons
              name={focused ? 'cart' : 'cart-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, size, color }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const { theme } = useContext(ThemeContext);
  useEffect(() => {
    NavigationBar.setButtonStyleAsync('light');
  }, []);

  return (
    <>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#181818" />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <LinkProvider>
            <NavigationContainer>
              <Stack.Navigator
                screenOptions={{
                  headerStyle: {
                    backgroundColor: theme.card,
                  },

                  headerTintColor: theme.primary,
                  headerTitleStyle: {
                    fontWeight: 'bold',
                    fontSize: 20,
                  },

                  headerShadowVisible: false,
                  headerTitleAlign: 'center',
                }}
              >
                <Stack.Screen
                  name="MainTabs"
                  component={MainTabs}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="Scanner"
                  component={ScannerScreen}
                  options={{ headerShown: true }}
                />
                <Stack.Screen
                  name="Details"
                  component={DetailsScreen}
                  options={{ headerShown: true }}
                />
                <Stack.Screen
                  name="ToBuyRecents"
                  component={ToBuyRecentsScreen}
                  options={{ headerShown: true }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </LinkProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </>
  );
}
