// app/(tabs)/emoji.tsx  OR  app/emoji.tsx
import Slider from "@react-native-community/slider";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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
  { emoji: "😡", label: "angry", word: "ANGRY" },
  { emoji: "😢", label: "sad", word: "SAD" },
  { emoji: "😔", label: "low", word: "BAD" },
  { emoji: "😊", label: "okay", word: "OKAY" },
  { emoji: "😄", label: "great", word: "GREAT" },
];

const GRADIENTS: [string, string][] = [
  // 0 angry — unchanged (warm strawberry → deep rose)
  ["#F49790", "#E06A6A"],

  // 1 sad — unchanged (mint → teal)
  ["#ACD1C9", "#7CB7AB"],

  // 2 low — solid F9F9FB (brand background)
  ["#d6ed81ff", "#d6ed81ff"],

  // 3 okay — unchanged (peach → coral)
  ["#F4CA90", "#F49790"],

  // 4 great — solid F49790 (salmon)
  ["#F49790", "#F49790"],
];

export default function EmojiPage() {
  const router = useRouter(); // inside component [web:83]

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

  const onSlide = (v: number) => {
    if (saved) setSaved(false);
    setContinuousValue(v);
  };
  const onSlideEnd = () => pulse();

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
    setSaved(true);
  };
  const handleHistory = () => {
    // TODO: navigate to history
  };
  const handleGoDiary = () => router.push("/diary"); // navigate [web:475]

  useFocusEffect(
    React.useCallback(() => {
      // bucket 3 ("okay") corresponds to 75 on the 0..100 scale
      setContinuousValue(75);
      setSaved(false);
      // no cleanup required
      return undefined;
    }, [])
  );

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

          {/* Slider high enough to clear all three pill rows */}
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

          {/* Bottom dock: set pointerEvents to avoid stealing touches above */}
          <View style={styles.bottomDock} pointerEvents="box-none">
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
              <Text style={styles.pillText}>log wit text</Text>
              <Pressable
                style={styles.pillBtn}
                onPress={handleGoDiary}
                hitSlop={8}
              >
                <Text style={styles.pillBtnText}>DIARY</Text>
              </Pressable>
            </View>

            <View style={styles.pillRow}>
              <Text style={styles.pillText}>{nowText}</Text>
              <Pressable
                style={styles.pillBtn}
                onPress={handleHistory}
                hitSlop={8}
              >
                <Text style={styles.pillBtnText}>HISTORY</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const BOTTOM_DOCK_ROWS = 3;
const DOCK_ROW_HEIGHT = 48; // approx row height including padding
const DOCK_GAP = 10; // gap between rows
const DOCK_PADDING = 12; // bottom padding

// Reserve enough vertical space above the dock for the slider:
const RESERVED_BOTTOM =
  BOTTOM_DOCK_ROWS * DOCK_ROW_HEIGHT +
  (BOTTOM_DOCK_ROWS - 1) * DOCK_GAP +
  DOCK_PADDING +
  20;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F5F2" },
  page: { flex: 1, justifyContent: "center", paddingHorizontal: 16 },

  card: {
    height: 520, // slightly taller to fit 3 rows
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

  // Slider lifted by RESERVED_BOTTOM to avoid overlap with all pill rows
  sliderZone: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: RESERVED_BOTTOM,
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
    gap: DOCK_GAP,
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
    minHeight: DOCK_ROW_HEIGHT,
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
