import React, { useState } from "react";
import {
  View,
  Text,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from "@/constants/theme";

interface GlassInputProps extends Omit<RNTextInputProps, "style"> {
  label?: string;
  variant?: "default" | "sm";
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export function GlassInput({
  label,
  variant = "default",
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  ...props
}: GlassInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const getSizeStyles = () => {
    switch (variant) {
      case "sm":
        return {
          wrapper: styles.wrapperSm,
          input: styles.inputSm,
          borderRadius: BorderRadius.sm,
        };
      case "default":
      default:
        return {
          wrapper: styles.wrapperDefault,
          input: styles.inputDefault,
          borderRadius: BorderRadius.md,
        };
    }
  };

  const sizeConfig = getSizeStyles();

  // Dynamic glass colors depending on focus & error
  const getBorderColor = () => {
    if (error) return Colors.status.error;
    if (isFocused) return "rgba(255, 255, 255, 0.45)";
    return "rgba(255, 255, 255, 0.20)";
  };

  const getBackgroundColor = () => {
    if (isFocused) return "rgba(255, 255, 255, 0.15)";
    return "rgba(255, 255, 255, 0.10)";
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            borderRadius: sizeConfig.borderRadius,
            borderColor: getBorderColor(),
          },
        ]}
      >
        <BlurView
          intensity={isFocused ? 30 : 20}
          tint="dark"
          style={[styles.blur, { borderRadius: sizeConfig.borderRadius }]}
        >
          <View
            style={[
              sizeConfig.wrapper,
              styles.inputWrapper,
              { backgroundColor: getBackgroundColor() },
            ]}
          >
            {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

            <RNTextInput
              style={[
                styles.input,
                sizeConfig.input,
                leftIcon ? { paddingLeft: 8 } : null,
                rightIcon ? { paddingRight: 8 } : null,
                inputStyle,
              ]}
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              onFocus={handleFocus}
              onBlur={handleBlur}
              {...(Platform.OS === "web" ? { outlineStyle: "none" } : {})}
              {...props}
            />

            {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
          </View>
        </BlurView>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 14,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: "#FFFFFF",
    marginBottom: 6,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  inputContainer: {
    borderWidth: 1,
    overflow: "hidden",
  },
  blur: {
    width: "100%",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  wrapperDefault: {
    height: 50,
    paddingHorizontal: 16,
  },
  wrapperSm: {
    height: 38,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    height: "100%",
    padding: 0,
  },
  inputDefault: {
    fontSize: FontSize.base,
  },
  inputSm: {
    fontSize: FontSize.sm,
  },
  leftIconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  rightIconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: Colors.status.error,
    fontSize: FontSize.xs,
    marginTop: 4,
    marginLeft: 4,
  },
});
