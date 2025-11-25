import WeeklyMoodMap from "@/components/weekly/chart";
import WeeklySummary from "@/components/weekly/summary";
import { useUserContext } from "@/context/authContext";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const screenWidth = Dimensions.get("window").width;

export default function WeeklyPage() {
  const { profile } = useUserContext();
  const [summary, setSummary] = useState<any>(null);
  const [moodLogs, setMoodLogs] = useState<any[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const MOOD_EMOJI: Record<string, string> = {
    angry: "😡",
    sad: "😢",
    low: "😔",
    okay: "😊",
    great: "😄",
  };

  useFocusEffect(
    useCallback(() => {
      const fetchMoodData = async () => {
        if (!profile) return;

        const { data, error } = await supabase
          .from("mood_log")
          .select(
            `
              id,
              mood,
              date,
              diary:diary!fk_diary (
                id,
                body,
                date
              )
            `
          )
          .eq("user_email", profile.email)
          .gte(
            "date",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          )
          .order("date", { ascending: true });

        if (error) {
          console.error("Error fetching weekly mood:", error);
          return;
        }

        const mapped = data.map((entry) => {
          const d = new Date(entry.date);
          const dayOfWeek = d.getDay();
          const hour = d.getHours();
          const mood = entry.mood?.toLowerCase();
          const emoji = MOOD_EMOJI[mood] ?? "😊";
          return { emoji, dayOfWeek, hour };
        });

        setMoodLogs(mapped);

        if (data.length > 0) {
          const freq: Record<string, number> = {};
          data.forEach((e) => {
            const m = e.mood?.toLowerCase();
            if (m) freq[m] = (freq[m] || 0) + 1;
          });
          const topMood = Object.keys(freq).reduce((a, b) =>
            freq[a] > freq[b] ? a : b
          );
          setSummary({
            topMood,
            emoji: MOOD_EMOJI[topMood] ?? "😊",
            topDay: "This Week",
            streak: 4,
          });
        }

        // Fade-in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
      };

      fetchMoodData();
    }, [profile])
  );

  return (
    <ScrollView
      style={{ backgroundColor: "#F0F3FF" }}
      contentContainerStyle={s.container}
    >
      <View style={s.headerContainer}>
        <Text style={s.header}>Weekly Mood Reflection</Text>
        <Text style={s.subheader}>Here’s a gentle look back at your week</Text>
      </View>

      <Animated.View style={{ opacity: fadeAnim, width: "100%" }}>
        {moodLogs.length > 0 ? (
          <>
            <WeeklySummary summary={summary} />
            <WeeklyMoodMap data={moodLogs} />
          </>
        ) : (
          <View style={s.emptyContainer}>
            <Text style={s.emptyText}>No mood logs this week yet.</Text>
            <Text style={s.emptySubtext}>
              Try adding a mood to start tracking your reflections.
            </Text>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 24,
  },
  headerContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 30,
    borderRadius: 20,
    backgroundColor: "linear-gradient(180deg, #B4C8FF 0%, #EAF2FF 100%)",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1D1D1F",
    fontFamily: "Noto Sans HK",
  },
  subheader: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 8,
    fontFamily: "Noto Sans HK",
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
    fontFamily: "Noto Sans HK",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    fontFamily: "Noto Sans HK",
  },
});
