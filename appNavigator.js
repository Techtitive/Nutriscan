import { useContext, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';

import { ThemeContext } from './context/themeContext';

import HomeScreen from './screens/homescreen';
import ScannerScreen from './screens/scanner';
import DetailsScreen from './screens/details';
import FavoritesScreen from './screens/favourites';
import TobuyScreen from './screens/tobuy';
import ProfileScreen from './screens/profile';
import RecentsScreen from './screens/recents';
import ToBuyRecentsScreen from './screens/tobuyRecents';
import Settings from './screens/settings';

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
          left: 15,
          right: 15,

          height: 65,
          borderRadius: 30,

          backgroundColor: theme.tabBar,

          borderTopWidth: 0,
          elevation: 10,

          paddingTop: 6,
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

        headerTitleAlign: 'center',
        headerShadowVisible: false,
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

export default function AppNavigator() {
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    NavigationBar.setButtonStyleAsync(
      theme.background === '#ededed' ? 'dark' : 'light',
    );
  }, [theme]);

  return (
    <Stack.Navigator
      screenOptions={{
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
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />

      <Stack.Screen name="Scanner" component={ScannerScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
      <Stack.Screen name="ToBuyRecents" component={ToBuyRecentsScreen} />
      <Stack.Screen name="Settings" component={Settings} />
    </Stack.Navigator>
  );
}
