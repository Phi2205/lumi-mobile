import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput as RNTextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { GlassCard, Button } from "@/components/ui";
import { Colors, Spacing, FontSize, BorderRadius } from "@/constants/theme";
import { useAuthStore } from "@/store";

const OTP_LENGTH = 6;

export default function OTPScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(RNTextInput | null)[]>([]);
  const { login } = useAuthStore();

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, OTP_LENGTH).split("");
      const newOtp = [...otp];
      pastedOtp.forEach((char, i) => {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      const lastIndex = Math.min(index + pastedOtp.length, OTP_LENGTH - 1);
      inputRefs.current[lastIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Move to next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== OTP_LENGTH) {
      setError("Please enter the complete verification code");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      if (otpString === "123456") {
        login({
          id: "1",
          username: "newuser",
          email: email || "user@example.com",
          fullName: "New User",
        });
        router.replace("/explore");
      } else {
        setError("Invalid verification code. Try 123456");
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setResendTimer(30);
    // Simulate resend
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace("/auth/login")}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={Colors.text.primary}
              />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.headerSection}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={Colors.gradients.brand}
                  style={styles.iconGradient}
                >
                  <Ionicons
                    name="mail-open"
                    size={32}
                    color={Colors.text.dark}
                  />
                </LinearGradient>
              </View>
              <Text style={styles.headerTitle}>Verify Your Email</Text>
              <Text style={styles.headerSubtitle}>
                {"We've sent a verification code to"}
              </Text>
              <Text style={styles.emailText}>{email || "your email"}</Text>
            </View>

            {/* OTP Form */}
            <GlassCard style={styles.formCard}>
              <Text style={styles.otpLabel}>Enter verification code</Text>
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <RNTextInput
                    key={index}
                    ref={(ref) => { inputRefs.current[index] = ref; }}
                    style={[
                      styles.otpInput,
                      digit && styles.otpInputFilled,
                      error && styles.otpInputError,
                    ]}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={index === 0 ? OTP_LENGTH : 1}
                    selectTextOnFocus
                  />
                ))}
              </View>

              {error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : (
                <Text style={styles.hintText}>
                  Demo code: 123456
                </Text>
              )}

              <Button
                title="Verify"
                onPress={handleVerify}
                loading={isLoading}
                size="lg"
                style={styles.verifyButton}
              />

              {/* Resend */}
              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>{"Didn't receive the code? "}</Text>
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={resendTimer > 0}
                >
                  <Text
                    style={[
                      styles.resendLink,
                      resendTimer > 0 && styles.resendDisabled,
                    ]}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend"}
                  </Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing["2xl"],
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.glass.light,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: FontSize["2xl"],
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  headerSubtitle: {
    fontSize: FontSize.base,
    color: Colors.text.secondary,
  },
  emailText: {
    fontSize: FontSize.base,
    color: Colors.brand.primary,
    fontWeight: "600",
    marginTop: Spacing.xs,
  },
  formCard: {
    paddingVertical: Spacing.xl,
  },
  otpLabel: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.glass.light,
    borderWidth: 1,
    borderColor: Colors.glass.lightBorder,
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: "700",
    textAlign: "center",
  },
  otpInputFilled: {
    borderColor: Colors.brand.primary,
    backgroundColor: "rgba(182, 196, 162, 0.1)",
  },
  otpInputError: {
    borderColor: Colors.status.error,
  },
  errorText: {
    color: Colors.status.error,
    fontSize: FontSize.sm,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  hintText: {
    color: Colors.text.muted,
    fontSize: FontSize.sm,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  verifyButton: {
    marginBottom: Spacing.xl,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  resendText: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
  },
  resendLink: {
    color: Colors.brand.primary,
    fontSize: FontSize.sm,
    fontWeight: "600",
  },
  resendDisabled: {
    color: Colors.text.muted,
  },
});