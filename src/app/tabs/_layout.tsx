// Force rebuild
import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { Colors } from "@/constants/theme";
import { BackgroundWrapper } from "@/components/ui";

export default function TabLayout() {
  return (
    <BackgroundWrapper>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.brand.primary,
          tabBarInactiveTintColor: Colors.text.muted,
          tabBarStyle: styles.tabBar,
          tabBarBackground: () => (
            <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill}>
              <View style={styles.tabBarBackground} />
            </BlurView>
          ),
          tabBarShowLabel: true,
          tabBarLabelStyle: styles.tabBarLabel,
          sceneStyle: { backgroundColor: "transparent" },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Chats",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "chatbubbles" : "chatbubbles-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="feed"
          options={{
            title: "Feed",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="reels"
          options={{
            title: "Reels",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "play-circle" : "play-circle-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    position: "absolute",
    borderTopWidth: 0,
    elevation: 0,
    height: Platform.OS === "ios" ? 88 : 68,
    paddingTop: 8,
    backgroundColor: "transparent",
  },
  tabBarBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(30, 30, 30, 0.85)",
    borderTopWidth: 1,
    borderTopColor: Colors.glass.lightBorder,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
});