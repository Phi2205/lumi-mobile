// Force Metro rebuild
import { Colors } from "@/constants/theme";
import React from "react";
import {
    Platform,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from "react-native";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";

interface BackgroundWrapperProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

export function BackgroundWrapper({
    children,
    style,
}: BackgroundWrapperProps) {
    return (
        <View style={[styles.container as ViewStyle, style]}>
            {/* Background Image using expo-image for cross-platform reliability */}
            <Image
                source={require("../../../assets/images/bg12.jpg")}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
            />
            {/* Dark overlay to reduce brightness */}
            <View style={[StyleSheet.absoluteFill, styles.overlay]} />

            {/* Backdrop blur effect */}
            <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />

            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
        ...Platform.select({
            web: {
                height: "100vh" as any,
                overflow: "hidden",
            },
        }),
    },
    overlay: {
        backgroundColor: "rgba(0, 0, 0, 0.45)",
    },
});
