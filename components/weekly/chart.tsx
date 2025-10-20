// app/components/WeeklyMoodMap.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface MoodLog {
  emoji: string;
  dayOfWeek: number; // 0=Sunday ... 6=Saturday
  hour: number; // 0–23
}

interface WeeklyMoodMapProps {
  data: MoodLog[];
}

export default function WeeklyMoodMap({ data }: WeeklyMoodMapProps) {
  const hourLabels = [0, 5, 10, 15, 20]; // label every 5 hours
  const xMargin = 5; // percentage margin on both sides

  return (
    <View style={s.card}>
      <Text style={s.title}>🌦️ Mood Moments This Week</Text>

      <View style={s.chart}>
        {/* Axis Lines */}
        <View style={s.vertLine} />
        <View style={s.horzLine} />

        {/* X-Axis Labels (spaced with margin) */}
        {hourLabels.map((h, i) => {
          const x = xMargin + (h / 24) * (100 - 2 * xMargin);
          return (
            <Text
              key={i}
              style={[
                s.timeLabel,
                { left: `${x}%`, transform: [{ translateX: -10 }] },
              ]}
            >
              {`${h}:00`}
            </Text>
          );
        })}

        {/* Y-Axis Labels */}
        <Text
          style={[
            s.axisLabel,
            { left: "50%", top: "4%", transform: [{ translateX: -30 }] },
          ]}
        >
          Saturday
        </Text>
        <Text
          style={[
            s.axisLabel,
            { left: "50%", bottom: "4%", transform: [{ translateX: -30 }] },
          ]}
        >
          Sunday
        </Text>

        {/* Plot all mood emojis */}
        {data.map((log, i) => {
          // map hours into inner range with margin
          const x = xMargin + (log.hour / 24) * (100 - 2 * xMargin);
          const y = ((log.dayOfWeek + 1) / 7) * 100;
          const jitterX = (Math.random() - 0.5) * 5;
          const jitterY = (Math.random() - 0.5) * 6;

          return (
            <View
              key={i}
              style={[
                s.emoji,
                {
                  left: `${x}%`,
                  bottom: `${y}%`,
                  transform: [
                    { translateX: jitterX },
                    { translateY: jitterY },
                    { scale: 0.85 },
                  ],
                },
              ]}
            >
              <Text style={s.moodEmoji}>{log.emoji}</Text>
            </View>
          );
        })}
      </View>

      <Text style={s.caption}>
        Each emoji represents one mood you logged — from early morning (left) to
        late night (right), Sunday to Saturday.
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    alignItems: "center",
    marginBottom: 24,
    width: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1D1D1F",
    fontFamily: "Noto Sans HK",
    marginBottom: 16,
  },
  chart: {
    width: "100%",
    height: 260,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    position: "relative",
    overflow: "hidden",
  },
  vertLine: {
    position: "absolute",
    left: "50%",
    top: 0,
    bottom: 0,
    width: 1.2,
    backgroundColor: "#E5E7EB",
  },
  horzLine: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 1.2,
    backgroundColor: "#E5E7EB",
  },
  emoji: {
    position: "absolute",
  },
  moodEmoji: {
    fontSize: 22,
  },
  axisLabel: {
    position: "absolute",
    color: "#9CA3AF",
    fontSize: 12,
    fontFamily: "Noto Sans HK",
  },
  timeLabel: {
    position: "absolute",
    bottom: "48%",
    color: "#9CA3AF",
    fontSize: 11,
    fontFamily: "Noto Sans HK",
    textAlign: "center",
  },
  caption: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 10,
    textAlign: "center",
    fontFamily: "Noto Sans HK",
  },
});
