import { useUserContext } from "@/context/authContext";
import { addQuestionnaireLog } from "@/lib/log_crud";
import { getUserByEmail, updateUser } from "@/lib/user_crud";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Summary() {
  const { profile, setProfile } = useUserContext();
  const { a } = useLocalSearchParams<{ a: string }>();
  const [showInfo, setShowInfo] = useState(false); // ✅ added missing state

  const answers = useMemo(() => {
    try {
      return JSON.parse(a || "[]") as { id: string; value: number }[];
    } catch {
      return [];
    }
  }, [a]);

  const depressionQs = ["q1", "q2", "q3", "q4", "q7", "q8", "q10"];
  const anxietyQs = ["q5", "q6", "q9", "q3", "q10"];
  const totalQs = Array.from({ length: 10 }, (_, i) => `q${i + 1}`);

  const depression = answers
    .filter((x) => depressionQs.includes(x.id))
    .reduce((s, x) => s + x.value, 0);

  const anxiety = answers
    .filter((x) => anxietyQs.includes(x.id))
    .reduce((s, x) => s + x.value, 0);

  const total = answers
    .filter((x) => totalQs.includes(x.id))
    .reduce((s, x) => s + x.value, 0);

  const depressionBand =
    depression >= 28
      ? "Severe"
      : depression >= 21
      ? "Moderately severe"
      : depression >= 14
      ? "Moderate"
      : depression >= 7
      ? "Mild"
      : "Minimal";

  const anxietyBand =
    anxiety >= 15
      ? "Severe"
      : anxiety >= 10
      ? "Moderate"
      : anxiety >= 5
      ? "Mild"
      : "Minimal";

  const wellnessBand =
    total >= 33
      ? "Severe concerns - immediate professional support strongly recommended"
      : total >= 25
      ? "Significant concerns - professional support recommended"
      : total >= 17
      ? "Moderate concerns - consider professional support"
      : total >= 9
      ? "Good with minor concerns"
      : "Excellent mental wellness";

  const emojiForWellness = () => {
    if (total >= 33) return "⚠️";
    if (total >= 25) return "😟";
    if (total >= 17) return "😕";
    if (total >= 9) return "🙂";
    return "🌟";
  };

  const handleSubmit = async () => {
    let updatedProfile = {
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      birth_date: profile?.birth_date || null,
      country: profile?.country || "",
      depression: depression,
      anxiety: anxiety,
      overall: total,
      checked_in_at: new Date(),
      icon_name: profile?.icon_name || "",
    };
    let newQuestionnaireLog = {
      user_email: profile?.email || "",
      date: new Date(),
    }
    // console.log("Updated profile to submit:", updatedProfile);
    try {
      await updateUser(updatedProfile);
      await addQuestionnaireLog(newQuestionnaireLog);
      if (profile) { 
        const profileData = await getUserByEmail(profile.email); 
        setProfile(profileData); 
      }
      router.push("/(tabs)");
    } catch (err: any) {
      Alert.alert("Error", "Could not save results");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.centerScroll}>
        <Text style={styles.title}>Your Mental Health Check-In</Text>
        <Text style={styles.emoji}>{emojiForWellness()}</Text>
        <Text style={styles.wellness}>{wellnessBand}</Text>

        <View style={styles.card}>
          <View style={styles.section}>
            <Text style={styles.label}>Depression</Text>
            <View style={[styles.pill, { backgroundColor: "#FCE1DC" }]}>
              <Text style={styles.pillText}>
                {depression} · {depressionBand}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Anxiety</Text>
            <View style={[styles.pill, { backgroundColor: "#EAF6F2" }]}>
              <Text style={styles.pillText}>
                {anxiety} · {anxietyBand}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Overall Wellness</Text>
            <View style={[styles.pill, { backgroundColor: "#FBECD7" }]}>
              <Text style={styles.pillText}>{total} / 40</Text>
            </View>
          </View>

          <Text style={styles.note}>
            These scores reflect recent depression and anxiety symptoms. They
            are for self-reflection, not a diagnosis.
          </Text>

          {/* Toggle extra info */}
          <TouchableOpacity
            style={styles.knowMoreBtn}
            onPress={() => setShowInfo(!showInfo)}
          >
            <Text style={styles.knowMoreText}>
              {showInfo ? "Hide details" : "Know More"}
            </Text>
            <Ionicons
              name={showInfo ? "chevron-up" : "chevron-down"}
              size={16}
              color="#1D1D1F"
            />
          </TouchableOpacity>

          {showInfo && (
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Score Guide</Text>
              <Text style={styles.infoText}>
                0–8: Excellent mental wellness
              </Text>
              <Text style={styles.infoText}>
                9–16: Good with minor concerns
              </Text>
              <Text style={styles.infoText}>
                17–24: Moderate concerns – consider support
              </Text>
              <Text style={styles.infoText}>
                25–32: Significant concerns – professional support recommended
              </Text>
              <Text style={styles.infoText}>
                33–40: Severe concerns – immediate support strongly recommended
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.save} onPress={handleSubmit}>
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#1D1D1F",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "Noto Sans HK",
  },
  emoji: {
    fontSize: 60,
    marginVertical: 8,
  },
  wellness: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 18,
    textAlign: "center",
    fontFamily: "Noto Sans HK",
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 20,
  },
  section: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
    fontFamily: "Noto Sans HK",
  },
  pill: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  pillText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D1D1F",
    fontFamily: "Noto Sans HK",
  },
  note: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 10,
    textAlign: "center",
    fontFamily: "Noto Sans HK",
  },
  knowMoreBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    marginTop: 10,
  },
  knowMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1D1D1F",
    marginRight: 6,
    fontFamily: "Noto Sans HK",
  },
  infoBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F9F9FB",
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
    color: "#1D1D1F",
    fontFamily: "Noto Sans HK",
  },
  infoText: {
    fontSize: 13,
    color: "#444",
    marginBottom: 4,
    fontFamily: "Noto Sans HK",
  },
  save: {
    backgroundColor: "#ACD1C9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 40,
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
