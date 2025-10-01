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
  const record = useMemo(
    () => records.find((item) => item.id === String(id)),
    [id]
  );

  const dateFormat = (date: Date) => {
    let dateText = "";
    if (date) {
      const dateObj = new Date(date);
      const day = dateObj.getDate();
      const month = dateObj.toLocaleString("en-US", { month: "short" });
      const year = dateObj.getFullYear();
      const weekday = dateObj.toLocaleString("en-US", { weekday: "short" });
      dateText = `${day} ${month} ${year} (${weekday})`;
    }
    return dateText;
  }

  if (!record) {
    return (
      <View style={s.container}>
        <Text style={s.header}>You haven’t created any Mood Log yet.</Text>
      </View>
    );
  }

  const headerText = record.mood + emojiForMood(record.mood);

  return (
    <View style={s.container}>
      <Text style={s.header}>{headerText}</Text>
      <Text style={s.date}>{record?.date ? dateFormat(record.date) : ""}</Text>
      <Text style={s.body}>{record.body}</Text>
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
