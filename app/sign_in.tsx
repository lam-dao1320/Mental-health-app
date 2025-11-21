import { useUserContext } from "@/context/authContext";
import { getDiaryByEmail } from "@/lib/diary_crud";
import { getRecordsByEmail } from "@/lib/mood_crud";
import { supabase } from "@/lib/supabase";
import { forgotPassword, signUp } from "@/lib/supabase_auth";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { getUserByEmail } from "../lib/user_crud";

export default function SignIn() {
  const { setProfile, setRecords, setDiaryRecords, signIn } = useUserContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(false);
  const [isSignIn, setIsSignIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const checkSaved = async () => {
      const savedEmail = await SecureStore.getItemAsync("email");
      const savedPassword = await SecureStore.getItemAsync("password");
      if (savedEmail && savedPassword) {
        try {
          setLoading(true);
          await doLogin(savedEmail, savedPassword);
        } finally {
          setLoading(false);
        }
      }
    };
    checkSaved();
  }, []);

  const hasCompletedQuestionnaire = async (email: string) => {
    const { data, error } = await supabase
      .from("questionnaire_log")
      .select("id")
      .eq("user_email", email);

    if (error) {
      console.warn("Questionnaire check failed:", error.message);
      return false;
    }

    console.log("Questionnaire check for:", email, "→", data);
    // If zero valid rows → they haven't filled it out
    return data && data.length > 0;
  };

  const ensureUserProfile = async (email: string) => {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (!data) {
      await supabase.from("user_profiles").insert({
        email,
        first_name: "",
        last_name: "",
        phone: "",
        birth_date: null,
        country: "",
        icon_name: "avatar1", // default avatar
        depression: null,
        anxiety: null,
        overall: null,
        checked_in_at: null,
      });
    }
  };

  const hydrateAndGo = async (userEmail: string) => {
    // --- NEW PART: questionnaire check ---
    const completed = await hasCompletedQuestionnaire(userEmail);

    const profileData = await getUserByEmail(userEmail);
    setProfile(profileData);
    const moodData = await getRecordsByEmail(userEmail);
    setRecords(moodData);
    const diaryData = await getDiaryByEmail(userEmail);
    setDiaryRecords(diaryData);

    // Otherwise go to main tabs
    if (!completed) {
      router.replace("/(questionnaire)");
      // router.dismissAll();
      // return;
    } else {
      router.replace("/(tabs)");
      router.dismissAll();
    }
  };

  const doLogin = async (e: string, p: string) => {
    await signIn(e, p);
    if (remember) {
      await SecureStore.setItemAsync("email", e);
      await SecureStore.setItemAsync("password", p);
    }

    await ensureUserProfile(e);

    await hydrateAndGo(e);
  };

  const handleAuth = async () => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    if (!isSignIn && password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (isSignIn) {
        await doLogin(email, password);
      } else {
        await signUp(email, password);
        // after sign up, redirect to login panel
        setIsSignIn(true);
        setError(
          "Account created. Please verify your email before signing in."
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };
  const handleForgot = async () => {
    if (!email) {
      setError("Enter your email first");
      return;
    }
    try {
      setLoading(true);
      await forgotPassword(email);
      setError("Password reset email sent");
    } catch {
      setError("Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F4F8F7" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.welcome}>Welcome to Mindlog</Text>
          <Text style={styles.subtitle}>
            {isSignIn ? "Take a moment to check in" : "Create your account"}
          </Text>

          <View style={styles.card}>
            {error && <Text style={styles.error}>{error}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />

            <View style={[styles.inputWrapper]}>
              <TextInput
                style={styles.inputField}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.toggleButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.toggleText}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>

            {!isSignIn && (
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.inputField}
                  placeholder="Confirm password"
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.toggleButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.toggleText}>
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.checkboxContainer,
                remember && styles.checkboxActive,
              ]}
              onPress={() => setRemember(!remember)}
            >
              <Text style={styles.checkboxText}>
                {remember ? "✓ Remember Me" : "Remember Me"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isSignIn ? "Sign In" : "Sign Up"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgot}>
              <Text style={styles.forgot}>Forgot password</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                setIsSignIn(!isSignIn);
                setError(null);
              }}
            >
              <Text style={styles.secondaryText}>
                {isSignIn ? "Need an account? " : "Have an account? "}
                <Text style={styles.highlightText}>
                  {isSignIn ? "Sign Up" : "Sign In"}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },
  welcome: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#1D1D1F",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "Noto Sans HK",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
    fontFamily: "Noto Sans HK",
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    paddingVertical: 25,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 15,
    backgroundColor: "#FAFAFA",
    fontSize: 16,
    color: "#111827",
  },
  button: {
    backgroundColor: "#ACD1C9",
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 5,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  error: { color: "#F49790", textAlign: "center", marginBottom: 12 },
  forgot: {
    color: "#0284c7",
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },
  checkboxContainer: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  checkboxText: {
    color: "#6B7280",
    fontSize: 14,
  },
  checkboxActive: {
    borderColor: "#ACD1C9",
  },
  secondaryButton: { marginTop: 10, alignItems: "center" },
  toggleButton: {
    position: "absolute",
    right: 14,
    top: "50%",
    transform: [{ translateY: -10 }], // keeps the text vertically centered
  },
  toggleText: {
    fontSize: 14,
    color: "#0284c7",
    fontWeight: "500",
    fontFamily: "Noto Sans HK",
  },
  inputField: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: "#FAFAFA",
    fontSize: 16,
    color: "#111827",
    paddingRight: 55,
  },
  secondaryText: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Noto Sans HK",
  },
  highlightText: {
    color: "#0284c7",
    fontWeight: "500",
    fontFamily: "Noto Sans HK",
  },
  inputWrapper: {
    position: "relative",
    width: "100%",
    marginBottom: 18, // previously 15
  },
});
