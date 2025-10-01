"use client";

import { useUserContext } from "@/context/authContext";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

const emojiForMood = (text: string) => {
  const t = text.toLowerCase();
  if (t.includes("angry")) return " 😡";
  if (t.includes("sad")) return " 😢";
  if (t.includes("low")) return " 😔";
  if (t.includes("okay")) return " 😊";
  if (t.includes("great")) return " 😄";
  return " 😊";
};

export default function CardDetails() {
  const { id } = useLocalSearchParams();
  const { records } = useUserContext();

  // find the right record by id
  const record = useMemo(
    () => records.find((item) => item.id === String(id)),
    [id, records]
  );

  const dateFormat = (date?: string | null) => {
    if (!date) return "";
    const dateObj = new Date(date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString("en-US", { month: "short" });
    const year = dateObj.getFullYear();
    const weekday = dateObj.toLocaleString("en-US", { weekday: "short" });
    return `${day} ${month} ${year} (${weekday})`;
  };

  if (!record) {
    return (
      <View style={s.container}>
        <Text style={s.header}>You haven’t created any Mood Log yet.</Text>
      </View>
    );
  }

  const headerText = record.mood + emojiForMood(record.mood);

  // Use diary body if available, else fallback
  const diaryBody = record.diary?.body ?? "(no diary written)";
  const diaryDate = record.diary?.date ?? record.date;

  return (
    <View style={s.container}>
      <Text style={s.header}>{headerText}</Text>
      <Text style={s.date}>{dateFormat(diaryDate)}</Text>
      <Text style={s.body}>{diaryBody}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: "#F9F9FB",
    height: "100%",
    paddingHorizontal: 15,
  },
  header: {
    color: "black",
    fontFamily: "Noto Sans HK",
    fontWeight: "bold",
    fontSize: 35,
    marginVertical: 40,
    marginHorizontal: 15,
  },
  date: {
    color: "#333",
    fontSize: 18,
    marginHorizontal: 15,
    marginBottom: 15,
  },
  body: {
    color: "#444",
    fontSize: 16,
    lineHeight: 22,
    marginHorizontal: 15,
  },
});
