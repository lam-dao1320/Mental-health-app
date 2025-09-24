import MoodSlider from "@/components/emoji/MoodSlider";
import React from "react";
import { View } from "react-native";

console.log("MoodSlider is", typeof MoodSlider); // should be "function"

export default function EmojiPage() {
  return (
    <View style={{ flex: 1 }}>
      <MoodSlider />
    </View>
  );
}
