import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
import {
  BricolageGrotesque_300Light,
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
} from '@expo-google-fonts/bricolage-grotesque';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Create a client for React Query
const queryClient = new QueryClient();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
    'BricolageGrotesque-Light': BricolageGrotesque_300Light,
    'BricolageGrotesque-Regular': BricolageGrotesque_400Regular,
    'BricolageGrotesque-Medium': BricolageGrotesque_500Medium,
    'BricolageGrotesque-SemiBold': BricolageGrotesque_600SemiBold,
    'BricolageGrotesque-Bold': BricolageGrotesque_700Bold,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <RootLayoutNav />
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: true,
          title: "Login",
          headerBackTitle: "Back"
        }} 
      />
      <Stack.Screen 
        name="register" 
        options={{ 
          headerShown: true,
          title: "Register",
          headerBackTitle: "Back"
        }} 
      />
      <Stack.Screen 
        name="ride-request/[id]" 
        options={{ 
          headerShown: true,
          title: "Ride Request",
          headerBackTitle: "Back"
        }} 
      />
      <Stack.Screen 
        name="ride-match/[id]" 
        options={{ 
          headerShown: true,
          title: "Ride Match",
          headerBackTitle: "Back"
        }} 
      />
      <Stack.Screen 
        name="wallet" 
        options={{ 
          headerShown: true,
          title: "Wallet",
          headerBackTitle: "Back"
        }} 
      />
      <Stack.Screen 
        name="referrals" 
        options={{ 
          headerShown: true,
          title: "Referrals",
          headerBackTitle: "Back"
        }} 
      />
      <Stack.Screen 
        name="my-rides" 
        options={{ 
          headerShown: true,
          title: "My Rides",
          headerBackTitle: "Back"
        }} 
      />
    </Stack>
  );
}