import ActivitySuggestion from "@/components/suggestion/activity";
import AIDisclaimerModal from "@/components/suggestion/disclaimer";
import PlanSuggestion from "@/components/suggestion/plan";
import { useUserContext } from "@/context/authContext";
import { getDiaryByEmail } from "@/lib/diary_crud";
import { suggestActivities, suggestPlans } from "@/lib/geminiAI_func";
import { getRecordsByEmail } from "@/lib/mood_crud";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  const [planSuggestion, setPlanSuggestion] = useState<any | null>(
    null
  );
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [aiConsent, setAiConsent] = useState<boolean | null>(null);

  useFocusEffect(
    useCallback(() => {
      let data = Array<any>([]);
      const loadData = async () => {
        if (profile) {
          try {
            const moodData = await getRecordsByEmail(profile.email);
            const diaryData = await getDiaryByEmail(profile.email);
            // console.log("Fetched diary records:", diaryData);
            // console.log("Fetched mood records:", moodData);

            let diaryIds = new Set(moodData?.map((m: any) => m.diary.id));
            const filteredDiary = diaryData?.filter((d: any) => !diaryIds.has(d.id));
            // console.log("Filtered diary records (unlinked):", filteredDiary);
            data = [...moodData, ...filteredDiary].sort(
              (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            // console.log("Merged and sorted records:", data);
            setData(data);
          } catch (error) {
            setError("Error loading mood records: " + error);
          }
        }

        const savedConsent = await AsyncStorage.getItem("ai_consent");
        if (savedConsent === null) setShowDisclaimer(true);
        else setAiConsent(savedConsent === "true");
      };
      loadData();
    }, [profile])
  );

  const status = (data: Array<any>) => {
    // console.log("Generating status from data:", data);
    if (!data) return "";
    let status = "Now, I live in Canada.";
    if (profile?.country) status += ` I'm from ${profile.country}.`;

    // Build history from records
    let history = "";
    data.forEach((entry) => {
      const d = new Date(entry.date);
      const recordDate = d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      if (entry.diary)
        history += `On ${recordDate}, I'm feeling ${entry.mood} because ${entry.diary.body}. `
      else
        if (entry.mood)
          history += `On ${recordDate}, I'm feeling ${entry.mood}. `
        else
          history += `On ${recordDate}, I wrote a diary entry (${entry.body}). `;
    });

    return status + " " + history;
  };

  const handleActivitySuggestion = async () => {
    if (!aiConsent) {
      setError("AI suggestions are disabled until you consent.");
      return;
    }
    setActivityLoading(true);
    setError(null);
    try {
      if (!data) {
        setError("Please log your mood first!");
        return;
      }
      // console.log("Fetching AI suggestions with status:", status(data));
      const aiActivityResponse = await suggestActivities(status(data));
      setActivitySuggestion(JSON.parse(aiActivityResponse));
      // console.log("AI Activity Suggestion Response:", aiActivityResponse);

      const aiPlanResponse = await suggestPlans(profile);
      setPlanSuggestion(JSON.parse(aiPlanResponse));
      // console.log("AI Plan Suggestion Response:", aiPlanResponse);
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
          {!activitySuggestion && !planSuggestion && (
            <View style={[styles.outputBox, styles.aiBox]}>
              <Text style={styles.placeholder}>
                🌿 Hey there! AI suggests small activities based on your most
                recent mood entry.
              </Text>
            </View>
          )}
          {activitySuggestion && 
            <View style={[styles.outputBox, styles.activityBox]}>
              <ActivitySuggestion data={activitySuggestion} />
            </View>
          }
          {planSuggestion &&
            <View style={[styles.outputBox, styles.planBox]}>
              <PlanSuggestion data={planSuggestion} />
            </View>
          }

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: aiConsent ? "#84B4FF" : "#BDBDBD" },
              (activityLoading || !aiConsent) && styles.disabled,
            ]}
            onPress={handleActivitySuggestion}
            disabled={activityLoading || !aiConsent}
          >
            {activityLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {aiConsent
                  ? "Get AI Suggestion"
                  : "AI Disabled (View Disclaimer)"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Re-Read Disclaimer Button — at very bottom */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => setShowDisclaimer(true)}>
            <Text style={styles.reviewText}>Review AI Disclaimer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AIDisclaimerModal
        visible={showDisclaimer}
        onClose={(consent) => {
          setAiConsent(consent);
          setShowDisclaimer(false);
        }}
      />
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
  section: { width: "100%", alignItems: "center" },
  outputBox: {
    width: "100%",
    minHeight: 100,
    borderRadius: 18,
    borderWidth: 1,    
    marginBottom: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  aiBox:{
    borderColor: "#a7bfe7ff",
    backgroundColor: "#e5efffff",
    padding: 16,
  },
  activityBox: {
    borderColor: "#F4C6C3",
    backgroundColor: "#FFF5F7",
    padding: 5,
  },
  planBox: {
    borderColor: "#98c9bdff",
    backgroundColor: "#f4fffcff",
    padding: 5,
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
  footer: {
    marginTop: 40,
    paddingBottom: 20,
    alignItems: "center",
    width: "100%",
  },
  reviewText: {
    color: "#6B7280",
    fontSize: 14,
    textDecorationLine: "underline",
    fontFamily: "Noto Sans HK",
  },
});
