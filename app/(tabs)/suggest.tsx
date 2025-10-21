import PlanSuggestion from "@/components/suggestion/plan";
import { useUserContext } from "@/context/authContext";
import { suggestActivities, suggestPlans } from "@/lib/geminiAI_func";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import ActivitySuggestion from "../../components/suggestion/activity";
import { getRecordsByEmail } from "../../lib/mood_crud";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function SuggestPage() {

  const { profile } = useUserContext();

  const [data, setData] = useState<any>(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activitySuggestion, setActivitySuggestion] = useState<any | null>(null);
  const [planSuggestion, setPlanSuggestion] = useState<any | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (profile) {
        try {
          const loadData = async () => {
            const moodData = await getRecordsByEmail(profile.email);
            // console.log("Loaded mood records for suggestion page:", moodData);
            setData(moodData[0]); // get the latest record
          };
          loadData();
        } catch (error) {
          setError("Error loading mood records:" + error);
        }
      }
    }, [])
  )

  const handleActivitySuggestion = async () => {
    setActivityLoading(true);
    setError(null);
    setPlanSuggestion(null);
    if (!data) {
      setError("Must track of your mood");
      setActivityLoading(false);
      return;
    }
    try {
      const aiResponse = await suggestActivities(status(data));
      setActivitySuggestion(JSON.parse(aiResponse));
      // console.log("AI Suggested Activities:", aiResponse);
      // You can update the UI with AI suggestions here
    } catch (error) {
      setError("Error fetching AI suggestions: " + error);
    } finally {
      setActivityLoading(false);
    }
  }

  const handlePlanSuggestion = async () => {
    setPlanLoading(true);
    setError(null);
    setActivitySuggestion(null);
    if (!profile) {
      setError("Must sign in to access");
      setPlanLoading(false);
      return;
    }
    if (!profile.depression || !profile.anxiety || !profile.overall) {
      setError("Must check-in mental wellness");
      setPlanLoading(false);
      return;
    }
    try {
      const aiResponse = await suggestPlans(profile);
      // console.log("AI Suggested Plans:", aiResponse);
      setPlanSuggestion(JSON.parse(aiResponse));
    } catch (error) {
      setError("Error fetching AI suggestions: " + error);
    } finally {
      setPlanLoading(false);
    }
  }

  const status = (data: any) => {
    if (!data) return "";
    let status = "Now, I live in Canada.";
    if (profile?.country) status += ` I'm from ${profile.country}.`;
    const d = new Date(data.date);
    let recordDate = d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    if (data.diary) 
      return status + ` I'm feeling ${data.mood} (Recorded on ${recordDate}) because ${data.diary.body}`;
    else 
      return status + ` I'm feeling ${data.mood} (Recorded on ${recordDate})`;
  }

  const press = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: press.value }],
    opacity: press.value ** 4,
  }));

  return (
    <Animated.View style={styles.container}>
      <Text style={styles.title}>Try Something Now</Text>
      {error && <Text style={styles.error}>{error}</Text>}

      {activitySuggestion && <ActivitySuggestion data={activitySuggestion} /> }
      {planSuggestion &&  <PlanSuggestion data={planSuggestion} /> }  

      <Animated.View style={{ flexDirection: "row", marginTop: 30 }}>
        <AnimatedPressable
          onPressIn={() => (press.value = withSpring(0.96))}
          onPressOut={() => (press.value = withSpring(1))}
          onPress={handleActivitySuggestion}
          style={[styles.button, animStyle, { flex: 1, marginHorizontal: 8, backgroundColor: "#F49790" }]}
          android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
          disabled={planLoading || activityLoading}
        >
          {activityLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Get Activity Suggestion</Text>
          )}
        </AnimatedPressable>

        <AnimatedPressable
          onPressIn={() => (press.value = withSpring(0.96))}
          onPressOut={() => (press.value = withSpring(1))}
          onPress={handlePlanSuggestion}
          style={[styles.button, animStyle, { flex: 1, marginHorizontal: 8 }]}
          android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
          disabled={activityLoading || planLoading}
        >
          {planLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Get Plan Suggestion</Text>
          )}
        </AnimatedPressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9FB",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
    fontFamily: "Noto Sans HK",
    textAlign: "center",
    alignSelf: "center",
  },
  suggestionBox: {
    backgroundColor: "#FCFAE1",
    height: 120,
    width: 320,
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  suggestionText: {
    fontSize: 18,
    color: "#333",
    lineHeight: 28,
    fontFamily: "Noto Sans HK",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#ACD1C9",
    marginTop: 30,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  error: { color: "#F49790", textAlign: "center", marginBottom: 12 },
});
