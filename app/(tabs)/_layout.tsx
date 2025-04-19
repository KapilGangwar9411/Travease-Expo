import React from "react";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { 
  Home, 
  Search, 
  Plus, 
  User, 
  Bell 
} from "lucide-react-native";
import { colors } from "@/constants/colors";
import { useAuthStore } from "@/store/auth-store";

export default function TabLayout() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 90 : 60,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          display: isAuthenticated ? 'flex' : 'none',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: Platform.OS === 'ios' ? -6 : 0,
        },
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: colors.text,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
          tabBarLabel: "Home",
        }}
      />
      <Tabs.Screen
        name="find-pool"
        options={{
          title: "Find Pool",
          tabBarIcon: ({ color }) => <Search size={22} color={color} />,
          tabBarLabel: "Find Pool",
        }}
      />
      <Tabs.Screen
        name="offer-ride"
        options={{
          title: "Offer Ride",
          tabBarIcon: ({ color }) => <Plus size={22} color={color} />,
          tabBarLabel: "Offer Ride",
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color }) => <Bell size={22} color={color} />,
          tabBarLabel: "Notifications",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
          tabBarLabel: "Profile",
        }}
      />
    </Tabs>
  );
}