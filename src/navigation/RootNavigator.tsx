// src/navigation/RootNavigator.tsx
//
// Defines the navigation stack for the entire app.
// Screen flow:
//   Splash  →  checks for existing Supabase session
//              ├─ session exists   → navigates directly to Main
//              └─ no session       → shows animation, then navigates to Login
//   Login   →  email/password or Google OAuth → Main
//   Main    →  home screen with session list
//   SessionDetail, Upload, Settings, Profile → secondary screens

import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors } from '../theme/colors';

// ── Screen imports ─────────────────────────────────────────────────
import SplashScreen from '../screens/onboarding/SplashScreen';
import LoginScreen from '../screens/onboarding/LoginScreen';
import MainScreen from '../screens/main/MainScreen';
import SessionDetailScreen from '../screens/session/SessionDetailScreen';
import SelectVideoScreen from '../screens/upload/SelectVideoScreen';
import UploadScreen from '../screens/upload/UploadScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Override the default NavigationContainer theme to match our dark mode colors
const DarkTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: Colors.dark.bg,
        card: Colors.dark.surface,
        text: Colors.text.primary,
        border: Colors.dark.border,
        notification: Colors.primary.default,
    },
};

const RootNavigator: React.FC = () => (
    <NavigationContainer theme={DarkTheme}>
        <Stack.Navigator
            id="RootNavigator"
            initialRouteName="Splash"  // Always start at Splash — it decides where to go
            screenOptions={{ headerShown: false, animation: 'fade' }}
        >
            {/* Onboarding screens */}
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />

            {/* Main app screens */}
            <Stack.Screen
                name="Main"
                component={MainScreen}
                options={{ gestureEnabled: false }}  // Prevent swiping back to Login
            />
            <Stack.Screen
                name="SessionDetail"
                component={SessionDetailScreen}
                options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
                name="SelectVideo"
                component={SelectVideoScreen}
                options={{
                    animation: 'slide_from_bottom',
                    presentation: 'fullScreenModal'
                }}
            />
            <Stack.Screen
                name="Upload"
                component={UploadScreen}
                options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ animation: 'slide_from_left' }}
            />
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ animation: 'slide_from_right' }}
            />
        </Stack.Navigator>
    </NavigationContainer>
);

export default RootNavigator;
