import React from "react";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/store";
import { ActivityIndicator, View } from "react-native";
import { Colors } from "@/constants/theme";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.dark.background }}>
        <ActivityIndicator size="large" color={Colors.brand.primary} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/tabs/feed" />;
  }
  
  return <Redirect href="/auth/login" />;
}
