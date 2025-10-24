import ActivitySuggestion from "@/components/suggestion/activity";
import { useUserContext } from "@/context/authContext";
import { suggestActivities } from "@/lib/geminiAI_func";
import { getRecordsByEmail } from "@/lib/mood_crud";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SuggestPage() {
  const { profile } = useUserContext();
  const [data, setData] = useState<any>(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activitySuggestion, setActivitySuggestion] = useState<any | null>(
    null
  );

  useFocusEffect(
    useCallback(() => {
      if (profile) {
        const loadData = async () => {
          try {
            const moodData = await getRecordsByEmail(profile.email);
            setData(moodData[0]);
          } catch (error) {
            setError("Error loading mood records: " + error);
          }
        };
        loadData();
      }
    }, [profile])
  );

  const status = (data: any) => {
    if (!data) return "";
    let status = "Now, I live in Canada.";
    if (profile?.country) status += ` I'm from ${profile.country}.`;
    const d = new Date(data.date);
    const recordDate = d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    if (data.diary)
      return `${status} I'm feeling ${data.mood} (Recorded on ${recordDate}) because ${data.diary.body}`;
    return `${status} I'm feeling ${data.mood} (Recorded on ${recordDate})`;
  };

  const handleActivitySuggestion = async () => {
    setActivityLoading(true);
    setError(null);
    try {
      if (!data) {
        setError("Please log your mood first!");
        return;
      }
      const aiResponse = await suggestActivities(status(data));
      setActivitySuggestion(JSON.parse(aiResponse));
    } catch (error) {
      setError("Error fetching AI suggestions: " + error);
    } finally {
      setActivityLoading(false);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.centerScroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Try Something New ✨</Text>
        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.section}>
          {/* Output Box */}
          <View style={styles.outputBox}>
            {!activitySuggestion ? (
              <Text style={styles.placeholder}>
                🌿 Hey there! Let’s see what new activity you could try today!
              </Text>
            ) : (
              <ActivitySuggestion data={activitySuggestion} />
            )}
          </View>

          {/* Button */}
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: "#F49790" },
              activityLoading && styles.disabled,
            ]}
            onPress={handleActivitySuggestion}
            disabled={activityLoading}
          >
            {activityLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Get Activity Suggestion</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.description}>
            AI suggests small activities like music, journaling, or walking
            based on your most recent mood entry.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#F9F9FB",
    justifyContent: "center",
    alignItems: "center",
  },
  container: { flex: 1, width: "100%" },
  centerScroll: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1D1D1F",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Noto Sans HK",
  },
  error: {
    color: "#F49790",
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "Noto Sans HK",
  },
  section: {
    width: "100%",
    alignItems: "center",
  },
  outputBox: {
    width: "100%",
    minHeight: 120,
    backgroundColor: "#FFF5F7",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F4C6C3",
    marginBottom: 18,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  placeholder: {
    textAlign: "center",
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
    fontFamily: "Noto Sans HK",
  },
  button: {
    width: "80%",
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: "Noto Sans HK",
  },
  description: {
    fontSize: 13,
    color: "#444",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 18,
    fontFamily: "Noto Sans HK",
    width: "85%",
  },
  disabled: { opacity: 0.6 },
});
