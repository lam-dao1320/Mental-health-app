import ActivitySuggestion from "@/components/suggestion/activity";
import PlanSuggestion from "@/components/suggestion/plan";
import { useUserContext } from "@/context/authContext";
import { suggestActivities, suggestPlans } from "@/lib/geminiAI_func";
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
  const [planLoading, setPlanLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activitySuggestion, setActivitySuggestion] = useState<any | null>(
    null
  );
  const [planSuggestion, setPlanSuggestion] = useState<any | null>(null);

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
    if (activitySuggestion && !activityLoading) {
      setActivitySuggestion(null);
      return;
    }
    setActivityLoading(true);
    setError(null);
    try {
      if (!data) {
        setError("Must keep track of your mood first");
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

  const handlePlanSuggestion = async () => {
    if (planSuggestion && !planLoading) {
      setPlanSuggestion(null);
      return;
    }
    setPlanLoading(true);
    setError(null);
    try {
      if (!profile) {
        setError("Must sign in to access");
        return;
      }
      if (!profile.depression || !profile.anxiety || !profile.overall) {
        setError("Must complete your mental wellness check-in first");
        return;
      }
      const aiResponse = await suggestPlans(profile);
      setPlanSuggestion(JSON.parse(aiResponse));
    } catch (error) {
      setError("Error fetching AI suggestions: " + error);
    } finally {
      setPlanLoading(false);
    }
  };

  const hasSuggestions = activitySuggestion || planSuggestion;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.centerScroll,
        !hasSuggestions && styles.centerWhenEmpty,
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Try Something New</Text>
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Activity Suggestion Section */}
      <View style={styles.section}>
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
          AI suggests small activities like music, journaling, or walking based
          on your most recent mood entry.
        </Text>

        {activitySuggestion && (
          <View style={styles.suggestionBox}>
            <ActivitySuggestion data={activitySuggestion} />
          </View>
        )}
      </View>

      {/* Plan Suggestion Section */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: "#ACD1C9" },
            planLoading && styles.disabled,
          ]}
          onPress={handlePlanSuggestion}
          disabled={planLoading}
        >
          {planLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Get Plan Suggestion</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.description}>
          AI generates a personalized self-care or wellness plan using your
          mental health check-in data.
        </Text>

        {planSuggestion && (
          <View style={styles.suggestionBox}>
            <PlanSuggestion data={planSuggestion} />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9FB" },
  centerScroll: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
  },
  centerWhenEmpty: {
    justifyContent: "center",
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
    marginTop: 25,
    alignItems: "center",
  },
  button: {
    width: "100%",
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
    width: "90%",
  },
  suggestionBox: {
    width: "100%",
    marginTop: 20,
  },
  disabled: {
    opacity: 0.6,
  },
});
