import React from "react";
import { View, StyleSheet } from "react-native";
import { Slot } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

export default function AuthLayout() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/images/bg12.jpg")}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <LinearGradient
        colors={["rgba(10, 10, 10, 0.4)", "rgba(10, 10, 10, 0.8)"]}
        style={StyleSheet.absoluteFill}
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
