import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function WeeklySummary({ summary }: { summary: any }) {
  if (!summary) return null;

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
        Your best day was <Text style={s.highlight}>{summary.topDay}</Text>.
      </Text>

      <Text style={s.line}>
        You kept a <Text style={s.highlight}>{summary.streak}-day</Text> streak
        of positive moods
      </Text>
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
