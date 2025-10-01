// app/(questionnaire)/summary.tsx
import { useUserContext } from "@/context/authContext";
import { updateUser } from "@/lib/user_crud";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Summary() {
  const { profile } = useUserContext();
  console.log("Profile: ", profile)

  const { a } = useLocalSearchParams<{ a: string }>();
  const answers = useMemo(() => {
    try {
      return JSON.parse(a || "[]") as { id: string; value: number }[];
    } catch {
      return [];
    }
  }, [a]); // [web:121]

  const phq = answers
    .filter((x) => x.id.startsWith("phq"))
    .reduce((s, x) => s + x.value, 0);
  const gad = answers
    .filter((x) => x.id.startsWith("gad"))
    .reduce((s, x) => s + x.value, 0);
  const total = phq + gad;

  const phqBand =
    phq >= 20
      ? "Severe"
      : phq >= 15
      ? "Moderately severe"
      : phq >= 10
      ? "Moderate"
      : phq >= 5
      ? "Mild"
      : "Minimal"; // [web:161][web:163]

  const gadBand =
    gad >= 15
      ? "Severe"
      : gad >= 10
      ? "Moderate"
      : gad >= 5
      ? "Mild"
      : "Minimal"; // [web:15][web:171]

  const adsBand =
    total >= 30
      ? "Severe (composite)"
      : total >= 20
      ? "Moderate (composite)"
      : total >= 10
      ? "Mild (composite)"
      : "Minimal (composite)"; // [web:6][web:169]

  const handleSubmit = async () => {

    let newProfile = {
      first_name: profile?.first_name ?? "",
      last_name: profile?.last_name ?? "",
      email: profile?.email ?? "",
      phone: profile?.phone ?? "",
      birth_date: profile?.birth_date ?? null,
      country: profile?.country ?? "",
      phq: phq,
      gad: gad,
    }

    console.log("Update profile: ", newProfile);

    try {
      await updateUser(newProfile);
      router.push('/(tabs)');
    } catch (err: any) {
      Alert.alert("Error", err instanceof Error ? err.message : "Update PHQ and GAD failed")
    } 
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.centerScroll}>
        <Text style={styles.title}>Check‑in Summary</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>PHQ‑9</Text>
            <Text style={styles.value}>
              {phq} / 27 · {phqBand}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>GAD‑7</Text>
            <Text style={styles.value}>
              {gad} / 21 · {gadBand}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>PHQ‑ADS</Text>
            <Text style={styles.value}>
              {total} / 48 · {adsBand}
            </Text>
          </View>

          <Text style={styles.note}>
            These scores reflect recent depression and anxiety symptoms to help
            track trends; they are not a diagnosis.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.save}
          onPress={handleSubmit}
        >
          <Text style={styles.saveText}>Done</Text>
          <Ionicons name="checkmark" size={20} color="white" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9FB" },
  centerScroll: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1D1D1F",
    marginBottom: 16,
    textAlign: "center",
    fontFamily: "Noto Sans HK",
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 16,
  },
  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: "#6B7280",
    fontFamily: "Noto Sans HK",
  },
  value: {
    fontSize: 16,
    color: "#1D1D1F",
    fontFamily: "Noto Sans HK",
  },
  note: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
    fontFamily: "Noto Sans HK",
  },
  save: {
    backgroundColor: "#ACD1C9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  saveText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginRight: 8,
    fontFamily: "Noto Sans HK",
  },
});
