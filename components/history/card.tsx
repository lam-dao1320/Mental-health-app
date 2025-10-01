"use client";

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type RecordType = {
  id: string;
  moodText: string; // e.g., "Mood: Okay 😊"
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
    router.push({ pathname: "/recordDetails/[id]", params: { id } });
  };

  const Wrapper = gradient ? LinearGradient : View;
  const wrapperProps = gradient
    ? {
        colors: gradient,
        start: { x: 0.15, y: 0 },
        end: { x: 0.85, y: 1 },
        style: s.gradientWrap,
      }
    : { style: [s.gradientWrap, { backgroundColor: "#F4CA90" }] };

  return (
    <Pressable onPress={handleCardPress} style={s.press}>
      <Wrapper {...(wrapperProps as any)}>
        <View style={s.inner}>
          <View style={s.cardHeader}>
            <Text style={s.moodText}>{moodText}</Text>
            <Text style={s.dateText}>{dateText}</Text>
          </View>

          <View style={s.divider} />

          <View style={s.cardBody}>
            <Text style={s.bodyText} numberOfLines={3}>
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
    marginHorizontal: 15,
    marginVertical: 10,
  },
  gradientWrap: {
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  inner: {
    padding: 15,
    backgroundColor: "transparent",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  moodText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#1D1D1F",
    lineHeight: 20, // helps emoji align in-line
  },
  dateText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#1D1D1F",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.55)",
    marginVertical: 8,
  },

  cardBody: { gap: 6 },
  bodyText: { color: "#000", fontSize: 15, lineHeight: 20 },
});
