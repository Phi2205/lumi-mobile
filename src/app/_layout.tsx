import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Colors } from "@/constants/theme";
import "../global.css";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    "DancingScript": require("../../assets/fonts/DancingScript-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.dark.background },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
        {/* Comment out non-existent routes to prevent warnings. 
            Uncomment them once the files/folders are created.
        <Stack.Screen
          name="chat/[id]"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="story/[id]"
          options={{
            headerShown: false,
            animation: "fade",
            presentation: "fullScreenModal",
          }}
        />
        <Stack.Screen
          name="profile/[id]"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        */}
      </Stack>
    </>
  );
}