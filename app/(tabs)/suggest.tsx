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

  // State Management
  const [data, setData] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true); // Loading state for initial data
  const [activityLoading, setActivityLoading] = useState(false); // Loading state for AI
  const [error, setError] = useState<string | null>(null);

  // AI Results
  const [activitySuggestion, setActivitySuggestion] = useState<any | null>(
    null
  );
  const [planSuggestion, setPlanSuggestion] = useState<any | null>(null);

  // Consent
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [aiConsent, setAiConsent] = useState<boolean | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        if (profile) {
          try {
            const moodData = await getRecordsByEmail(profile.email);
            const diaryData = await getDiaryByEmail(profile.email);
            // console.log("Fetched diary records:", diaryData);
            // console.log("Fetched mood records:", moodData);

            // Safely extract diary IDs from moodData
            let diaryIds = new Set(
              moodData
              ?.map((m: any) => m.diary?.id)
              .filter((id: any) => id != null)
            );
            
            // Filter diary entries that do NOT exist in moodData
            const filteredDiary = diaryData?.filter(
              (d: any) => !diaryIds.has(d.id)
            );
            // console.log("Filtered diary records (unlinked):", filteredDiary);

            // Merge and sort
            let data = [...moodData, ...filteredDiary].sort(
              (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            // console.log("Merged and sorted records:", data);
            setData(data);
          } catch (error) {
            setError("Error loading mood records: " + error);
          }
        setError(null)};

        if (!profile || !profile.email) {
          return; // Profile not loaded yet, wait.
        }

        try {
          setIsLoadingHistory(true);

          // 1. Fetch Data
          const moodData = await getRecordsByEmail(profile.email);
          const diaryData = await getDiaryByEmail(profile.email);

          // 2. Safety Checks (Handle null/undefined responses)
          const safeMoods = moodData || [];
          const safeDiaries = diaryData || [];

          // 3. THE FIX: Safely extract Diary IDs
          // We filter for moods that actually HAVE a diary (m.diary) before asking for the ID
          const linkedDiaryIds = new Set(
            safeMoods
              .filter((m: any) => m.diary != null) // Only look at moods with diaries
              .map((m: any) => m.diary.id)
          );

          // 4. Filter unlinked diaries
          const filteredDiary = safeDiaries.filter(
            (d: any) => !linkedDiaryIds.has(d.id)
          );

          // 5. Merge and Sort
          const mergedData = [...safeMoods, ...filteredDiary].sort(
            (a: any, b: any) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          setData(mergedData);
        } catch (error) {
          console.error(error);
          setError("Error loading records: " + error);
        } finally {
          setIsLoadingHistory(false);
        }
      };

      loadData();

      const checkConsent = async () => {
        const savedConsent = await AsyncStorage.getItem("ai_consent");
        if (savedConsent === null) setShowDisclaimer(true);
        else setAiConsent(savedConsent === "true");
      };
      checkConsent();
    }, [profile])
  );

  const status = (data: Array<any>) => {
    if (!data || data.length === 0) return "";
    let status = "Now, I live in Canada.";
    if (profile?.country) status += ` I'm from ${profile.country}.`;

    let history = "";
    // Limit to recent 5 entries to prevent AI overload
    data.slice(0, 5).forEach((entry) => {
      const d = new Date(entry.date);
      const recordDate = d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      // Safe checks for properties
      if (entry.diary && entry.diary.body) {
        history += `On ${recordDate}, I'm feeling ${entry.mood} because ${entry.diary.body}. `;
      } else if (entry.mood) {
        history += `On ${recordDate}, I'm feeling ${entry.mood}. `;
      } else if (entry.body) {
        history += `On ${recordDate}, I wrote a diary entry (${entry.body}). `;
      }
    });

    return status + " " + history;
  };

  const handleActivitySuggestion = async () => {
    if (!aiConsent) {
      setError("AI suggestions are disabled until you consent.");
      return;
    }

    if (!data || data.length === 0) {
      setError("Please log your mood first!");
      return;
    }

    setActivityLoading(true);
    setError(null);

    try {
      const currentStatus = status(data);

      const aiActivityResponse = await suggestActivities(currentStatus);
      setActivitySuggestion(aiActivityResponse);

      const aiPlanResponse = await suggestPlans(profile);
      setPlanSuggestion(aiPlanResponse);
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
          {activitySuggestion && (
            <View style={[styles.outputBox, styles.activityBox]}>
              <ActivitySuggestion data={activitySuggestion} />
            </View>
          )}
          {planSuggestion && (
            <View style={[styles.outputBox, styles.planBox]}>
              <PlanSuggestion data={planSuggestion} />
            </View>
          )}

          {/* Loading Indicator for Data Fetching */}
          {isLoadingHistory ? (
            <View style={{ marginTop: 20 }}>
              <ActivityIndicator color="#84B4FF" />
              <Text style={{ color: "#aaa", marginTop: 5 }}>
                Loading History...
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: aiConsent ? "#84B4FF" : "#BDBDBD" },
                (activityLoading || !aiConsent || data.length === 0) &&
                  styles.disabled,
              ]}
              onPress={handleActivitySuggestion}
              disabled={activityLoading || !aiConsent || data.length === 0}
            >
              {activityLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {data.length === 0
                    ? "No Moods Found"
                    : aiConsent
                    ? "Get AI Suggestion"
                    : "AI Disabled"}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

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
    paddingHorizontal: 10,
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
  aiBox: {
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
