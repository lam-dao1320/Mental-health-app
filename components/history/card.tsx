"use client";

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type RecordType = {
  id: string;
  diary_id?: string | null;
  moodText: string;
  dateText: string;
  bodyText: string;
};

export default function Card({
  record,
  gradient,
}: {
  record: RecordType;
  gradient?: [string, string];
}) {
  const { id, moodText, dateText, bodyText } = record;
  const router = useRouter();

  const handleCardPress = () => {
    router.push(`/recordDetails/${record.diary_id ?? record.id}`);
  };

  const Wrapper = gradient ? LinearGradient : View;
  const wrapperProps = gradient
    ? {
        colors: gradient,
        start: { x: 0.1, y: 0 },
        end: { x: 0.9, y: 1 },
        style: s.gradientWrap,
      }
    : { style: [s.gradientWrap, { backgroundColor: "#E6F0FF" }] };

  return (
    <Pressable
      onPress={handleCardPress}
      style={({ pressed }) => [
        s.press,
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
      ]}
    >
      <Wrapper {...(wrapperProps as any)}>
        <View style={s.inner}>
          {/* Header */}
          <View style={s.cardHeader}>
            <Text style={s.moodText}>{moodText}</Text>
            <Text style={s.dateText}>{dateText}</Text>
          </View>

          <View style={s.divider} />

          {/* Body */}
          <View style={s.cardBody}>
            <Text style={s.bodyText} numberOfLines={4}>
              {bodyText}
            </Text>
          </View>
        </View>
      </Wrapper>
    </Pressable>
  );
}

const s = StyleSheet.create({
  press: {
    width: "100%",
    alignSelf: "center",
    marginVertical: 10,
  },
  gradientWrap: {
    width: "100%",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
    overflow: "hidden",
  },
  inner: {
    padding: 16,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  moodText: {
    fontWeight: "bold",
    fontSize: 17,
    color: "#1D1D1F",
    fontFamily: "Noto Sans HK",
  },
  dateText: {
    fontWeight: "600",
    fontSize: 13,
    color: "#374151",
    fontFamily: "Noto Sans HK",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginVertical: 8,
  },

  cardBody: {
    gap: 4,
  },
  bodyText: {
    color: "#111827",
    fontSize: 15,
    lineHeight: 21,
    fontFamily: "Noto Sans HK",
  },
});
