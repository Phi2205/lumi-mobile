import React from "react";
import { View, StyleSheet } from "react-native";
import { Slot } from "expo-router";
import { Image } from "expo-image";

export default function AuthLayout() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/images/bg12.jpg")}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
