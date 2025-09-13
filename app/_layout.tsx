import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/hooks/use-auth";
import { BattleProvider } from "@/hooks/use-battles";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

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
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={styles.container}>
          <AuthProvider>
            <BattleProvider>
              <RootLayoutNav />
            </BattleProvider>
          </AuthProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});