import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";

type Item = {
  id: string;
  text: string;
  scale: { label: string; value: number }[];
};

const SCALE = [
  { label: "None", value: 0 },
  { label: "Rarely", value: 1 },
  { label: "Sometimes", value: 2 },
  { label: "Often", value: 3 },
  { label: "Everyday", value: 4 },
];

const ITEMS: Item[] = [
  {
    id: "q1",
    text: "Little interest or pleasure in doing things",
    scale: SCALE,
  },
  { id: "q2", text: "Feeling down, depressed, or hopeless", scale: SCALE },
  {
    id: "q3",
    text: "Trouble falling or staying asleep, or sleeping too much",
    scale: SCALE,
  },
  { id: "q4", text: "Feeling tired or having little energy", scale: SCALE },
  { id: "q5", text: "Feeling nervous, anxious, or on edge", scale: SCALE },
  {
    id: "q6",
    text: "Not being able to stop or control worrying",
    scale: SCALE,
  },
  { id: "q7", text: "Poor appetite or overeating", scale: SCALE },
  {
    id: "q8",
    text: "Feeling bad about yourself or that you are a failure",
    scale: SCALE,
  },
  {
    id: "q9",
    text: "Being so restless that it's hard to sit still",
    scale: SCALE,
  },
  {
    id: "q10",
    text: "Trouble concentrating on things, such as reading or watching TV",
    scale: SCALE,
  },
];

export default function Question() {
  const { i, a } = useLocalSearchParams<{ i: string; a: string }>();
  const index = Number(i || 0);

  const [isBack, setIsBack] = useState(false);
  const [prevIndex, setPrevIndex] = useState(index);

  const answers = useMemo(() => {
    try {
      return JSON.parse(a || "[]") as { id: string; value: number }[];
    } catch {
      return [];
    }
  }, [a]);

  const item = ITEMS[index];
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  useEffect(() => {
    const prev = answers[index]?.value ?? null;
    setSelectedValue(prev);
    setIsBack(index < prevIndex);
    setPrevIndex(index);
  }, [index, a]);

  const onNext = () => {
    if (selectedValue == null) return;
    const nextAnswers = [...answers];
    nextAnswers[index] = { id: item.id, value: selectedValue };
    setIsBack(false);

    if (index < ITEMS.length - 1) {
      router.replace({
        pathname: "/(questionnaire)/q",
        params: { i: String(index + 1), a: JSON.stringify(nextAnswers) },
      });
    } else {
      router.replace({
        pathname: "/(questionnaire)/summary",
        params: { a: JSON.stringify(nextAnswers) },
      });
    }
  };

  const back = () => {
    const prev = Math.max(0, index - 1);
    setIsBack(true);
    router.replace({
      pathname: "/(questionnaire)/q",
      params: { i: String(prev), a: JSON.stringify(answers) },
    });
  };

  const entering = (isBack ? SlideInLeft : SlideInRight)
    .duration(260)
    .easing(Easing.out(Easing.cubic));
  const exiting = (isBack ? SlideOutRight : SlideOutLeft)
    .duration(220)
    .easing(Easing.in(Easing.cubic));

  return (
    <View style={styles.root}>
      <Animated.View
        key={index}
        entering={entering}
        exiting={exiting}
        style={styles.centerStage}
      >
        <View style={styles.card}>
          <Text style={styles.progressTiny}>
            {index + 1} / {ITEMS.length}
          </Text>

          <Text style={styles.kicker}>Over the last 2 weeks…</Text>
          <Text style={styles.question}>{item.text}</Text>

          <View style={{ width: "100%", marginTop: 6 }}>
            {item.scale.map((opt) => {
              const active = selectedValue === opt.value;
              return (
                <Animated.View
                  key={opt.value}
                  entering={ZoomIn.duration(140).easing(
                    Easing.out(Easing.ease)
                  )}
                  exiting={ZoomOut.duration(120)}
                  style={{ width: "100%" }}
                >
                  <TouchableOpacity
                    style={[styles.pill, active && styles.pillActive]}
                    onPress={() => setSelectedValue(opt.value)}
                    activeOpacity={0.9}
                  >
                    <Text
                      style={[styles.pillText, active && styles.pillTextActive]}
                    >
                      {opt.label}
                    </Text>
                    <Ionicons
                      name={active ? "heart" : "heart-outline"}
                      size={16}
                      color="#ACD1C9"
                    />
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          <View style={styles.bottomRow}>
            <TouchableOpacity
              onPress={back}
              disabled={index === 0}
              style={[styles.ghostBtn, index === 0 && { opacity: 0.4 }]}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={18} color="#6B7280" />
              <Text style={styles.ghostText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onNext}
              disabled={selectedValue == null}
              style={[
                styles.primaryBtn,
                selectedValue == null && styles.primaryBtnDisabled,
              ]}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryText}>
                {index === ITEMS.length - 1 ? "Submit" : "Next"}
              </Text>
              <Ionicons
                name={
                  index === ITEMS.length - 1 ? "checkmark" : "arrow-forward"
                }
                size={18}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FDFCFD" },
  centerStage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  progressTiny: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 12,
    color: "#9CA3AF",
  },
  kicker: {
    marginTop: 10,
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 6,
    textAlign: "center",
  },
  question: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1D1D1F",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 28,
    paddingHorizontal: 8,
  },
  pill: {
    width: "100%",
    backgroundColor: "#FCFAE1",
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pillActive: {
    backgroundColor: "#FDF6D2",
    borderWidth: 1,
    borderColor: "#F4CA90",
  },
  pillText: { fontSize: 16, color: "#1D1D1F" },
  pillTextActive: { color: "#1D1D1F", fontWeight: "600" },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 14,
    width: "100%",
  },
  ghostBtn: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  ghostText: { color: "#6B7280", fontSize: 16 },
  primaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#ACD1C9",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryBtnDisabled: { backgroundColor: "#CFE3DE" },
  primaryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
