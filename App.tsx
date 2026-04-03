// App.tsx — Entry point
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import RootNavigator from './src/navigation/RootNavigator';

import * as WebBrowser from 'expo-web-browser';

// Required for Web Auth and Android deep linking popup clearing
WebBrowser.maybeCompleteAuthSession();

// Supabase Stuff
import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { supabase } from './src/lib/supabase'
import Auth from './src/components/Auth'
import { View, Text } from 'react-native'
import { JwtPayload } from '@supabase/supabase-js'

export default function App() {

  // Supabase Stuff
  const [claims, setClaims] = useState<JwtPayload | null>(null)
  useEffect(() => {
    supabase.auth.getClaims().then(({ data: { claims } }) => {
      setClaims(claims)
    })
    supabase.auth.onAuthStateChange(() => {
      supabase.auth.getClaims().then(({ data: { claims } }) => {
        setClaims(claims)
      })
    })
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
