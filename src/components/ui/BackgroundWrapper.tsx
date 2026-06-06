import { Colors } from "@/constants/theme";
import React, { useState, useRef, useEffect } from "react";
import {
    Animated,
    Platform,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from "react-native";
import { Image } from "expo-image";
import { BlurView, BlurTargetView } from "expo-blur";
import { BlurTargetProvider } from "@/context/BlurTargetContext";

interface BackgroundWrapperProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

export function BackgroundWrapper({
    children,
    style,
}: BackgroundWrapperProps) {
    const [isBgLoaded, setIsBgLoaded] = useState(false);
    const [showLogo, setShowLogo] = useState(true);
    const contentAnim = useRef(new Animated.Value(0)).current;
    const blurAnim = useRef(new Animated.Value(1)).current;
    const logoAnim = useRef(new Animated.Value(1)).current;
    const bgRef = useRef<View | null>(null);

    useEffect(() => {
        if (isBgLoaded) {
            Animated.parallel([
                Animated.timing(contentAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(blurAnim, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(logoAnim, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setShowLogo(false);
            });
        }
    }, [isBgLoaded]);

    return (
        <View style={[styles.container as ViewStyle, style]}>
            {/* Background Image and dark overlay wrapped in BlurTargetView */}
            <BlurTargetView ref={bgRef} style={StyleSheet.absoluteFill}>
                <Image
                    source={require("../../../assets/images/bg12.jpg")}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    transition={0}
                    priority="high"
                    onLoad={() => setIsBgLoaded(true)}
                />
                <View style={[StyleSheet.absoluteFill, styles.overlay]} />
            </BlurTargetView>

            {/* Transitional heavy blur (fades out to reveal sharp image underneath) */}
            {showLogo && (
                <Animated.View style={[StyleSheet.absoluteFill, { opacity: blurAnim }]} pointerEvents="none">
                    <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" blurMethod="dimezisBlurView" blurTarget={bgRef} />
                </Animated.View>
            )}

            {/* Render content with smooth fade-in only when background is ready */}
            <Animated.View style={[{ flex: 1 }, Platform.OS !== "web" ? { opacity: contentAnim } : { opacity: 1 }]}>
                <BlurTargetProvider value={bgRef}>
                    {children}
                </BlurTargetProvider>
            </Animated.View>

            {/* Show logo centered on top of blurry background while image loads / fades */}
            {showLogo && (
                <Animated.View 
                    style={[StyleSheet.absoluteFill, styles.loadingContainer, { opacity: logoAnim }]}
                    pointerEvents="none"
                >
                    <Image
                        source={require("../../../assets/images/lumi-logo-v2.png")}
                        style={styles.loadingLogo}
                        contentFit="contain"
                    />
                </Animated.View>
            )}
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
    loadingContainer: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent", // Làm trong suốt để thấy được hình nền mờ phía sau
    },
    loadingLogo: {
        width: 120,
        height: 120,
    },
});
