import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function WeeklyBadges() {
  return (
    <View style={s.card}>
      <Text style={s.title}>Your Mood Badges 🏅</Text>

      <View style={s.row}>
        <View style={s.badge}>
          <View style={s.img} />
          <Text style={s.label}>First Log</Text>
        </View>

        <View style={s.badge}>
          <View style={s.img} />
          <Text style={s.label}>1-Week Streak</Text>
        </View>

        <View style={s.badge}>
          <View style={s.img} />
          <Text style={s.label}>Positive Vibes</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1D1D1F",
    marginBottom: 16,
    fontFamily: "Noto Sans HK",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  badge: {
    alignItems: "center",
  },
  img: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E8F0FE",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: "#374151",
    fontFamily: "Noto Sans HK",
  },
});
