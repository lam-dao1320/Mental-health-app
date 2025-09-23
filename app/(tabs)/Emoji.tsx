import MoodPicker from "@/components/emoji/MoodPicker";
import React from "react";
import { View } from "react-native";

export default function EmojiPage() {
  return (
    <View style={{ flex: 1 }}>
      <MoodPicker />
    </View>
  );
}
