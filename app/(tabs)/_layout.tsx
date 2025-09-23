import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
  const palette = {
    barBg: "#FFFFFF",
    active: Colors.light.tint,
    inactive: "#6B7280",
    divider: "rgba(0,0,0,0.06)",
  };
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: palette.barBg }}
      edges={["top", "bottom"]}
    >
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarActiveTintColor: palette.active,
          tabBarInactiveTintColor: palette.inactive,
          tabBarStyle: {
            backgroundColor: palette.barBg,
            borderTopColor: palette.divider,
          },
          tabBarActiveBackgroundColor: "transparent",
          tabBarInactiveBackgroundColor: "transparent",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="paperplane.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="Emoji"
          options={{
            title: "Emoji",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="face.smiling.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="setting"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="gearshape.fill" color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
