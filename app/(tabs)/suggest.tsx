import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import QuickActivitySuggestion from "../../components/suggestion/quickActivity";
import { suggestQuickActivities } from "../../lib/geminiAI_func";

const suggestions = [
  "Take a 10-minute walk outside.",
  "Try deep breathing exercises.",
  "Listen to your favorite song.",
  "Write down three things you're grateful for.",
  "Do a quick body stretch.",
  "Drink a glass of water.",
  "Practice mindfulness for 5 minutes.",
  "Call or text a friend.",
  "Try a new hobby or craft.",
  "Read a page of a book.",
  "Watch a funny video.",
  "Declutter your workspace.",
  "Meditate for 5 minutes.",
  "Spend time with a pet or nature.",
  "Plan a small goal for the day.",
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function SuggestPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSuggestion, setCurrentSuggestion] = useState(
    suggestions[Math.floor(Math.random() * suggestions.length)]
  );

  const handleNewSuggestion = () => {
    let nextSuggestion;
    do {
      nextSuggestion =
        suggestions[Math.floor(Math.random() * suggestions.length)];
    } while (nextSuggestion === currentSuggestion);
    setCurrentSuggestion(nextSuggestion);
  };

  const handleAISuggestion = async () => {
    setLoading(true);
    setError(null);
    try {
      const aiResponse = await suggestQuickActivities("stressed with assignment deadlines");
      setData(JSON.parse(aiResponse));
      console.log("AI Suggested Activities:", aiResponse);
      // You can update the UI with AI suggestions here
    } catch (error) {
      setError("Error fetching AI suggestions: " + error);
    } finally {
      setLoading(false);
    }
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

      {data ? <QuickActivitySuggestion data={data} /> : (

      <Animated.View style={styles.suggestionBox}>
        <Text style={styles.suggestionText}>{currentSuggestion}</Text>
      </Animated.View>
      )}

      <AnimatedPressable
        onPressIn={() => (press.value = withSpring(0.96))}
        onPressOut={() => (press.value = withSpring(1))}
        onPress={handleAISuggestion}
        style={[styles.button, animStyle]}
        android_ripple={{ color: "rgba(0,0,0,0.08)", borderless: false }}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Get New Suggestion</Text>
        )}
      </AnimatedPressable>
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
    marginBottom: 40,
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
    paddingVertical: 14,
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
