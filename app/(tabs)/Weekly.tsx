// app/(tabs)/Weekly.tsx
import WeeklyBadges from "@/components/weekly/badges";
import WeeklyMoodMap from "@/components/weekly/chart";
import WeeklySummary from "@/components/weekly/summary";
import { useUserContext } from "@/context/authContext";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text } from "react-native";

const screenWidth = Dimensions.get("window").width;

export default function WeeklyPage() {
  const { profile } = useUserContext();
  const [summary, setSummary] = useState<any>(null);
  const [moodLogs, setMoodLogs] = useState<any[]>([]);

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

        // map all logs to emoji points
        const mapped = data.map((entry) => {
          const d = new Date(entry.date);
          const dayOfWeek = d.getDay(); // 0=Sun ... 6=Sat
          const hour = d.getHours(); // 0–23
          const mood = entry.mood?.toLowerCase();
          const emoji = MOOD_EMOJI[mood] ?? "😊";
          return { emoji, dayOfWeek, hour };
        });

        setMoodLogs(mapped);

        // get top mood summary
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
      };

      fetchMoodData();
    }, [profile])
  );

  return (
    <ScrollView
      style={{ backgroundColor: "#F9F9FB" }}
      contentContainerStyle={s.container}
    >
      <Text style={s.header}>Weekly Mood Reflection</Text>

      <WeeklySummary summary={summary} />
      <WeeklyMoodMap data={moodLogs} />
      <WeeklyBadges />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1D1D1F",
    marginBottom: 20,
    fontFamily: "Noto Sans HK",
    textAlign: "center",
  },
});
