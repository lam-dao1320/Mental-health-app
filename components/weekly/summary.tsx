import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface MoodLog {
  emoji: string;
  mood_score?: number; // numeric score from Supabase (e.g. -2 to +2)
  overall?: number; // if your table uses 'overall' instead of 'mood_score'
  dayOfWeek: number; // 0 = Sunday ... 6 = Saturday
  created_at?: string; // date from Supabase
}

interface WeeklySummaryProps {
  summary: {
    topMood: string;
    emoji: string;
    topDay?: string;
    streak?: number;
    data?: MoodLog[];
  };
}

export default function WeeklySummary({ summary }: WeeklySummaryProps) {
  if (!summary) return null;

  const { data } = summary;

  // compute happiest day using numeric mood score from Supabase
  const getHappiestDay = () => {
    if (!data || data.length === 0) return summary.topDay || "No data";

    const moodScores: Record<number, { total: number; date: string }> = {};

    data.forEach((log) => {
      const score = log.mood_score ?? log.overall ?? 0;
      const dayKey = log.dayOfWeek;

      const date = log.created_at ? new Date(log.created_at) : new Date();
      const formattedDate = date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      }); // e.g. Monday, Nov 4, 2025

      if (!moodScores[dayKey]) {
        moodScores[dayKey] = { total: score, date: formattedDate };
      } else {
        moodScores[dayKey].total += score;
      }
    });

    const bestDay = Object.entries(moodScores).sort(
      (a, b) => b[1].total - a[1].total
    )[0];

    if (!bestDay) return summary.topDay || "No data";
    return moodScores[parseInt(bestDay[0])].date;
  };

  // 🟢 FIX: call the function so it actually runs
  const happiestDay = getHappiestDay();

  return (
    <View style={s.card}>
      <Text style={s.line}>
        You were mostly feeling{" "}
        <Text style={s.highlight}>
          {summary.topMood} {summary.emoji}
        </Text>{" "}
        this week.
      </Text>

      <Text style={s.line}>
        Your happiest day was <Text style={s.highlight}>{happiestDay}</Text>.
      </Text>

      {summary.streak && (
        <Text style={s.line}>
          You kept a <Text style={s.highlight}>{summary.streak}-day</Text>{" "}
          streak of positive moods.
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  line: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    textAlign: "center",
    fontFamily: "Noto Sans HK",
    marginBottom: 6,
  },
  highlight: {
    fontWeight: "bold",
    color: "#84B4FF",
  },
});
