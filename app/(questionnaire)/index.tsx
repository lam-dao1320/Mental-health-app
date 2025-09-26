// app/(questionnaire)/index.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Intro() {
  const start = () => {
    router.push({
      pathname: "/(questionnaire)/q",
      params: { i: "0", a: "[]" },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9FB" />
      <Text style={styles.title}>MindLog Check‑in</Text>
      <Text style={styles.subtitle}>
        A short, gentle screening to spot trends
      </Text>
      <TouchableOpacity style={styles.cta} onPress={start}>
        <Text style={styles.ctaText}>Start</Text>
        <Ionicons name="arrow-forward" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9FB",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
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
    textAlign: "center",
    fontFamily: "Noto Sans HK",
  },
  cta: {
    backgroundColor: "#ACD1C9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginRight: 10,
    fontFamily: "Noto Sans HK",
  },
});
