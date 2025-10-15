// app/(tabs)/Weekly.tsx
import { useUserContext } from "@/context/authContext";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function WeeklyPage() {
  const { profile } = useUserContext();
  const [chartData, setChartData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [showInfo, setShowInfo] = useState(false);

  const MOOD_SCORE: Record<string, number> = {
    angry: 1,
    sad: 2,
    low: 3,
    okay: 4,
    great: 5,
  };

  const MOOD_EMOJI: Record<string, string> = {
    angry: "😡",
    sad: "😢",
    low: "😔",
    okay: "😊",
    great: "😄",
  };

  useFocusEffect(
    useCallback(() => {
      const fetchWeeklyMood = async () => {
        if (!profile) return;
        const { data, error } = await supabase
          .from("mood_log")
          .select("mood, date")
          .eq("user_email", profile.email)
          .gte(
            "date",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          )
          .order("date", { ascending: true });

        if (error) {
          console.error(error);
          return;
        }

        const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const buckets = weekDays.map((d) => ({
          day: d,
          values: [] as number[],
        }));

        data?.forEach((entry) => {
          const d = new Date(entry.date);
          const idx = d.getDay();
          const mood = entry.mood.toLowerCase();
          if (MOOD_SCORE[mood]) {
            buckets[idx].values.push(MOOD_SCORE[mood]);
          }
        });

        const filled = buckets.map((b) => {
          if (b.values.length > 0) {
            const avg = b.values.reduce((a, c) => a + c, 0) / b.values.length;
            const moodKey =
              Object.keys(MOOD_SCORE).find(
                (k) => MOOD_SCORE[k] === Math.round(avg)
              ) || "okay";
            return {
              day: b.day,
              avg: avg,
              mood: moodKey,
              emoji: MOOD_EMOJI[moodKey],
            };
          }
          return { day: b.day, avg: 0, mood: "no entry", emoji: "💤" }; //🙈
        });

        const avgWeek =
          filled.reduce((sum, f) => sum + f.avg, 0) /
          filled.filter((f) => f.avg > 0).length;

        const topDay = filled.reduce(
          (best, cur) => (cur.avg > best.avg ? cur : best),
          { day: "", avg: 0, mood: "", emoji: "—" }
        );

        const fullDayNames: Record<string, string> = {
          Sun: "Sunday",
          Mon: "Monday",
          Tue: "Tuesday",
          Wed: "Wednesday",
          Thu: "Thursday",
          Fri: "Friday",
          Sat: "Saturday",
        };

        setChartData(filled);
        setSummary({
          avgMood: avgWeek.toFixed(1),
          topDay: fullDayNames[topDay.day] || topDay.day,
          topMood: topDay.mood,
          emoji: topDay.emoji,
          streak: 4, // dummy
        });
      };

      fetchWeeklyMood();
    }, [profile])
  );

  return (
    <ScrollView
      style={{ backgroundColor: "#F9F9FB" }}
      contentContainerStyle={s.container}
    >
      <Text style={s.header}>Weekly Mood Reflection</Text>
      {summary && (
        <View style={s.summaryCard}>
          <Text style={s.summaryLine}>
            You were mostly feeling{" "}
            <Text style={s.highlight}>
              {summary.topMood} {summary.emoji}
            </Text>{" "}
            this week.
          </Text>

          <Text style={s.summaryLine}>
            Your best day was <Text style={s.highlight}>{summary.topDay}</Text>.
          </Text>

          <Text style={s.summaryLine}>
            Your average mood score was{" "}
            <Text onPress={() => setShowInfo(true)}>
              <Text style={s.highlight}>{summary.avgMood}/5</Text>
              <Text
                style={[
                  s.infoIcon,
                  {
                    backgroundColor: "rgba(132,180,255,0.15)",
                    borderRadius: 10,
                    paddingHorizontal: 5,
                  },
                ]}
              >
                ?
              </Text>{" "}
            </Text>
            .
          </Text>

          <Text style={s.summaryLine}>
            You kept a <Text style={s.highlight}>{summary.streak}-day</Text>{" "}
            streak of positive moods
          </Text>
        </View>
      )}
      {chartData.length > 0 && (
        <View style={s.chartBox}>
          <LineChart
            data={{
              labels: chartData.map((d) => d.day),
              datasets: [{ data: chartData.map((d) => d.avg || 0) }],
            }}
            width={screenWidth - 50}
            height={250}
            yAxisInterval={1}
            fromZero
            chartConfig={{
              backgroundColor: "#FFFFFF",
              backgroundGradientFrom: "#F5F3FF",
              backgroundGradientTo: "#FFFFFF",
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(132, 180, 255, ${opacity})`,
              labelColor: () => "#6B7280",
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: "#84B4FF",
              },
              style: { borderRadius: 18 },
            }}
            bezier
            style={{
              borderRadius: 18,
              alignSelf: "center",
            }}
          />
          <View style={s.emojiRow}>
            {chartData.map((d, idx) => (
              <Text key={idx} style={s.emoji}>
                {d.emoji}
              </Text>
            ))}
          </View>
        </View>
      )}
      <View style={s.badgeSection}>
        <Text style={s.sectionTitle}>Your Mood Badges 🏅</Text>

        <View style={s.badgeRow}>
          <View style={s.badgeCard}>
            <View style={s.badgeImage} />
            <Text style={s.badgeLabel}>First Log</Text>
          </View>

          <View style={s.badgeCard}>
            <View style={s.badgeImage} />
            <Text style={s.badgeLabel}>1-Week Streak</Text>
          </View>

          <View style={s.badgeCard}>
            <View style={s.badgeImage} />
            <Text style={s.badgeLabel}>Positive Vibes</Text>
          </View>
        </View>
      </View>
      {showInfo && (
        <Pressable style={s.overlay} onPress={() => setShowInfo(false)}>
          <Pressable style={s.popup} onPress={(e) => e.stopPropagation()}>
            <Text style={s.popupTitle}>How is this score calculated?</Text>
            <Text style={s.popupText}>
              Each mood you log (😡–😄) is converted to a score from 1 to 5:
              {"\n\n"}
              😡 Angry = 1{"\n"}
              😢 Sad = 2{"\n"}
              😔 Low = 3{"\n"}
              😊 Okay = 4{"\n"}
              😄 Great = 5{"\n\n"}
              The weekly average is based on your daily average moods from
              Sunday to Saturday.
            </Text>
          </Pressable>
        </Pressable>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F9F9FB",
    flexGrow: 1,
    alignItems: "center",
    minHeight: "100%",
    padding: 24,
    alignItems: "center",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1D1D1F",
    marginBottom: 20,
    fontFamily: "Noto Sans HK",
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  summaryText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 22,
    textAlign: "center",
    fontFamily: "Noto Sans HK",
  },
  highlight: {
    fontWeight: "bold",
    color: "#84B4FF",
  },
  chartBox: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    alignItems: "center",
  },
  emojiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginTop: 10,
  },
  emoji: {
    fontSize: 20,
  },
  summaryLine: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    textAlign: "center",
    fontFamily: "Noto Sans HK",
    marginBottom: 6,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 10,
  },
  popup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    width: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1D1D1F",
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "Noto Sans HK",
  },
  popupText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    fontFamily: "Noto Sans HK",
    textAlign: "left",
  },
  infoIcon: {
    fontSize: 17,
    color: "#5AA0FF",
    fontWeight: "900",
    marginLeft: 4,
    textAlignVertical: "center",
  },
  badgeSection: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginTop: 24,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1D1D1F",
    marginBottom: 16,
    fontFamily: "Noto Sans HK",
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  badgeCard: {
    alignItems: "center",
  },
  badgeImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E8F0FE", // dummy placeholder color
    marginBottom: 8,
  },
  badgeLabel: {
    fontSize: 14,
    color: "#374151",
    fontFamily: "Noto Sans HK",
  },
});
