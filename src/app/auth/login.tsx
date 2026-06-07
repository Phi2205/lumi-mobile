import { GlassCard } from "@/components/ui";
import { BorderRadius, Colors, FontSize, Spacing } from "@/constants/theme";
import { useAuthStore } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthService } from "@/services/auth.service";

const { height } = Dimensions.get("window");

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login } = useAuthStore();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await AuthService.login({
        email,
        password,
      });

      const { user } = response;

      // Lưu thông tin user vào Zustand store (token do cookie tự quản lý)
      login({
        id: user.id,
        username: user.name || user.email.split("@")[0],
        email: user.email,
        fullName: user.name,
        avatar_url: user.avatar_url,
        avatar: user.avatar_url,
      });

      // Chuyển hướng tới màn hình explore
      router.replace("/tabs/feed");
    } catch (err: any) {
      console.error("Login error:", err.message);
      setErrors({
        email: err.message || "Invalid email or password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fillTestAccount = () => {
    setEmail("user1@example.com");
    setPassword("123456@Abc");
    setErrors({});
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
            <View style={styles.mainContent}>
              {/* Logo Section */}
              <View style={styles.logoSection}>
                <Text style={styles.logoText}>Lumi</Text>
                <Text style={styles.subheadingText}>Have an account?</Text>
              </View>

              {/* Form Fields directly on the background */}
              <View style={styles.formContainer}>
                <View style={[styles.inputWrapper, errors.email ? styles.inputErrorBorder : null]}>
                  <RNTextInput
                    style={styles.inputField}
                    placeholder="email"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                <View style={[styles.inputWrapper, styles.passwordWrapper, errors.password ? styles.inputErrorBorder : null]}>
                  <RNTextInput
                    style={styles.inputField}
                    placeholder="Password"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="rgba(255, 255, 255, 0.6)"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                {/* Sign In Button */}
                <TouchableOpacity
                  style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#1E1E1E" />
                  ) : (
                    <Text style={styles.loginButtonText}>SIGN IN</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={() => router.push("/auth/forgot-password")}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password</Text>
                </TouchableOpacity>

                {/* Sign Up Link */}
                <View style={styles.registerContainer}>
                  <Text style={styles.registerText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => router.push("/auth/register")}>
                    <Text style={styles.registerLink}>Sign up</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Test Account Section */}
              <GlassCard style={styles.testAccountCard}>
                <View style={styles.testAccountHeader}>
                  <View style={styles.testAccountTitleContainer}>
                    <Ionicons name="shield-checkmark-outline" size={18} color="rgba(255, 255, 255, 0.6)" />
                    <Text style={styles.testAccountTitle}>TEST ACCOUNT</Text>
                  </View>
                  <TouchableOpacity style={styles.fillButton} onPress={fillTestAccount}>
                    <Text style={styles.fillButtonText}>Click to fill</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.testAccountDetails}>
                  <Text style={styles.testAccountLabel}>user1@example.com</Text>
                  <Text style={styles.testAccountSublabel}>123456@Abc</Text>
                </View>
              </GlassCard>
            </View>
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
    justifyContent: "space-between",
    minHeight: height - 60,
  },
  mainContent: {
    marginTop: 80,
    width: "100%",
  },
  logoSection: {
    alignItems: "center",
    marginTop: height * 0.08,
    marginBottom: 48,
  },
  logoText: {
    fontFamily: Platform.select({
      web: "'Dancing Script', 'DancingScript', cursive",
      default: "DancingScript",
    }),
    fontSize: 76,
    fontWeight: "500",
    color: "#ffffff",
    letterSpacing: 4,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 20,
    transform: [{ rotate: "-1.5deg" }],
    marginBottom: Spacing.xs,
  },
  subheadingText: {
    fontSize: FontSize.lg,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  formContainer: {
    width: "100%",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  inputWrapper: {
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: Spacing.xl,
    justifyContent: "center",
  },
  inputErrorBorder: {
    borderColor: Colors.status.error,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputField: {
    flex: 1,
    color: "#ffffff",
    fontSize: FontSize.base,
    height: "100%",
    padding: 0,
    outlineStyle: "none", // Avoid focus rings on web
  } as any,
  eyeIcon: {
    paddingLeft: Spacing.sm,
  },
  errorText: {
    color: Colors.status.error,
    fontSize: FontSize.sm,
    marginLeft: Spacing.lg,
    marginTop: -Spacing.xs,
  },
  loginButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.sm,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#1E1E1E",
    fontSize: FontSize.base,
    fontWeight: "500",
    letterSpacing: 1,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  forgotPasswordText: {
    color: "#ffffff",
    fontSize: FontSize.base,
    fontWeight: "500",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  registerText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: FontSize.base,
  },
  registerLink: {
    color: Colors.brand.primary,
    fontSize: FontSize.base,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  testAccountCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  testAccountHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  testAccountTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  testAccountTitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: FontSize.sm,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  fillButton: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  fillButtonText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  testAccountDetails: {
    gap: Spacing.xs,
  },
  testAccountLabel: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: FontSize.base,
    fontWeight: "600",
  },
  testAccountSublabel: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: FontSize.sm,
  },
});