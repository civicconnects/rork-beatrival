import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/hooks/use-auth";
import { BattleProvider } from "@/hooks/use-battles";
import { trpc, trpcClient } from "@/lib/trpc";

// Prevent auto hide only on mobile
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

// Create query client with stable configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false, // Disable retries to prevent hydration issues
    },
  },
});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Back",
      headerStyle: {
        backgroundColor: '#0A0A0A',
      },
      headerTintColor: '#FFFFFF',
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="battle/[id]" options={{ 
        presentation: 'modal',
        headerShown: false,
      }} />
      <Stack.Screen name="challenge" options={{ 
        presentation: 'modal',
        title: 'New Challenge',
      }} />
      <Stack.Screen name="achievements" options={{ 
        title: 'My Achievements',
        headerShown: false,
      }} />
      <Stack.Screen name="messages" options={{ 
        title: 'Messages',
        headerShown: false,
      }} />
      <Stack.Screen name="crew" options={{ 
        title: 'My Crew',
        headerShown: false,
      }} />
      <Stack.Screen name="help" options={{ 
        title: 'Help & FAQ',
        headerShown: false,
      }} />
      <Stack.Screen name="fans" options={{ 
        title: 'My Fans',
        headerShown: false,
      }} />
      <Stack.Screen name="settings" options={{ 
        title: 'Settings',
        headerShown: false,
      }} />
      <Stack.Screen name="report" options={{ 
        title: 'Report Issue',
        headerShown: false,
      }} />
      <Stack.Screen name="live-test" options={{ 
        title: 'Live Stream Test',
        headerShown: false,
      }} />
      <Stack.Screen name="live-streams" options={{ 
        title: 'Live Streams',
        headerShown: false,
      }} />
      <Stack.Screen name="profile-edit" options={{ 
        title: 'Edit Profile',
        headerShown: false,
      }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [isHydrated, setIsHydrated] = useState(Platform.OS === 'web' ? false : true);

  useEffect(() => {
    // Handle splash screen only on mobile
    if (Platform.OS !== 'web') {
      SplashScreen.hideAsync();
    }
    
    // Handle hydration for web
    if (Platform.OS === 'web') {
      // Small delay to ensure proper hydration
      const timer = setTimeout(() => {
        setIsHydrated(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // Show loading screen during hydration on web
  if (Platform.OS === 'web' && !isHydrated) {
    return (
      <View style={styles.loadingContainer}>
        {/* Empty loading screen to prevent hydration mismatch */}
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <GestureHandlerRootView style={styles.container}>
          <AuthProvider>
            <BattleProvider>
              <RootLayoutNav />
            </BattleProvider>
          </AuthProvider>
        </GestureHandlerRootView>
      </trpc.Provider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
});