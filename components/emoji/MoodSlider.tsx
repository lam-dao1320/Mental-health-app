// app/(tabs)/emoji.tsx  OR  app/emoji.tsx
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type MoodEntry = {
  value: number; // 0..4
  emoji: string;
  label: string;
  word: string;
  timestamp: string;
  displayDate: string;
  displayTime: string;
};

const MOODS = [
  { emoji: "😡", label: "angry", word: "ANGRY" }, // 0
  { emoji: "😢", label: "sad", word: "SAD" }, // 1
  { emoji: "😔", label: "low", word: "BAD" }, // 2
  { emoji: "😊", label: "okay", word: "OKAY" }, // 3
  { emoji: "😄", label: "great", word: "GREAT" }, // 4
];

const GRADIENTS: [string, string][] = [
  ["#FF2B2B", "#C01212"],
  ["#FF5151", "#D63031"],
  ["#FFA049", "#F07C1F"],
  ["#FFC95A", "#F2A34F"],
  ["#FF7EB3", "#FF6A88"],
];

export default function EmojiPage() {
  // Continuous 0..100 slider value
  const [continuousValue, setContinuousValue] = useState(75);
  const moodIndex = Math.min(4, Math.max(0, Math.round(continuousValue / 25)));
  const mood = useMemo(() => MOODS[moodIndex], [moodIndex]);
  const colors = GRADIENTS[moodIndex];

  // Emoji pulse on snap
  const scale = useRef(new Animated.Value(1)).current;
  const pulse = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.06,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 140,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Save button animation + state
  const [saved, setSaved] = useState(false);
  const btnScale = useRef(new Animated.Value(1)).current;
  const animateBtn = () => {
    Animated.sequence([
      Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }),
      Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const entryOf = (bucket: number): MoodEntry => {
    const now = new Date();
    const b = Math.min(4, Math.max(0, bucket));
    return {
      value: b,
      emoji: MOODS[b].emoji,
      label: MOODS[b].label,
      word: MOODS[b].word,
      timestamp: now.toISOString(),
      displayDate: now.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      displayTime: now.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }),
    };
  };

  // Smooth drag: update local only; reset saved label when user drags
  const onSlide = (v: number) => {
    if (saved) setSaved(false);
    setContinuousValue(v);
  };
  const onSlideEnd = (v: number) => {
    pulse();
    // Optional: notify store with entryOf(Math.round(v/25))
  };

  const nowText = (() => {
    const d = new Date();
    const date = d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const time = d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${date} • ${time}`;
  })();

  const handleSave = () => {
    animateBtn();
    // TODO: persist entryOf(moodIndex)
    setSaved(true);
  };
  const handleHistory = () => {
    // TODO: navigate to history
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.page}>
        <View style={[styles.card, styles.shadow]}>
          <LinearGradient
            colors={colors}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Large translucent word */}
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.bigWord}>
            {mood.word}
          </Text>

          {/* Huge emoji slightly overlapping the word */}
          <View style={styles.centerWrap} pointerEvents="none">
            <Animated.Text style={[styles.emoji, { transform: [{ scale }] }]}>
              {mood.emoji}
            </Animated.Text>
          </View>

          {/* Continuous slider above the dock */}
          <View style={styles.sliderZone}>
            <View style={styles.rail} pointerEvents="none">
              <View style={styles.railInner} />
            </View>
            <Slider
              minimumValue={0}
              maximumValue={100}
              value={continuousValue}
              onValueChange={onSlide}
              onSlidingComplete={onSlideEnd}
              minimumTrackTintColor="transparent"
              maximumTrackTintColor="transparent"
              thumbTintColor="#FFFFFF"
              style={styles.slider}
            />
          </View>

          {/* Bottom dock with two pill rows */}
          <View style={styles.bottomDock}>
            <View style={styles.pillRow}>
              <Text style={styles.pillText}>
                I’m feeling <Text style={styles.pillStrong}>{mood.label}</Text>
              </Text>

              <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                <Pressable
                  style={styles.pillBtn}
                  onPress={handleSave}
                  hitSlop={8}
                >
                  <Text style={styles.pillBtnText}>
                    {saved ? "SAVED" : "SAVE"}
                  </Text>
                </Pressable>
              </Animated.View>
            </View>

            <View style={styles.pillRow}>
              <Text style={styles.pillText}>{nowText}</Text>
              <Pressable
                style={styles.pillBtn}
                onPress={handleHistory}
                hitSlop={8}
              >
                <Text style={styles.pillBtnText}>VIEW HISTORY</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F5F2" },
  page: { flex: 1, justifyContent: "center", paddingHorizontal: 16 },

  card: {
    height: 480,
    borderRadius: 28,
    overflow: "hidden",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
  },
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },

  bigWord: {
    position: "absolute",
    top: 30,
    left: 24,
    right: 24,
    textAlign: "center",
    fontSize: 118,
    fontWeight: "900",
    letterSpacing: 2,
    color: "rgba(255,255,255,0.22)",
  },

  centerWrap: {
    position: "absolute",
    top: -120,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 220,
    textShadowColor: "rgba(0,0,0,0.18)",
    textShadowRadius: 18,
    textShadowOffset: { width: 0, height: 10 },
  },

  sliderZone: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 148,
    height: 60,
    justifyContent: "center",
    zIndex: 3,
    elevation: 3,
  },
  slider: { position: "absolute", left: 0, right: 0, height: 60 },

  rail: {
    position: "absolute",
    left: 6,
    right: 6,
    height: 22,
    justifyContent: "center",
  },
  railInner: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.35)",
  },

  bottomDock: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    gap: 10,
    zIndex: 1,
  },
  pillRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.14)",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  pillText: { flex: 1, color: "rgba(255,255,255,0.95)", fontSize: 16 },
  pillStrong: { color: "#FFEEA9", fontWeight: "800" },
  pillBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.28)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
  },
  pillBtnText: { color: "#FFFFFF", fontWeight: "900", letterSpacing: 1 },
});
