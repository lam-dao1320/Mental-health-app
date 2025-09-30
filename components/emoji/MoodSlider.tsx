// app/(tabs)/emoji.tsx  OR  app/emoji.tsx
import { useUserContext } from "@/context/authContext";
import { addDiary } from "@/lib/diary_crud";
import { AntDesign } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
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

const CARD_HEIGHT = 360;
const INPUT_MAX = 200;
const MAX_LEN = 500;
const MIN_LEN = 0;

export default function EmojiPage() {
  const { profile } = useUserContext();
  // console.log(profile);
  const router = useRouter(); // inside component [web:83]

  // toggle for text diary
  const [isOpen, setIsOpen] = useState(false);
  const [textDiary, setTextDiary] = useState("");
  const [kbVisible, setKbVisible] = useState(false);

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
  const handleHistory = () => router.push("/history"); // TODO: navigate to history

  useFocusEffect(
    React.useCallback(() => {
      // bucket 3 ("okay") corresponds to 75 on the 0..100 scale
      setContinuousValue(75);
      setSaved(false);
      // no cleanup required
      return undefined;
    }, [])
  );

  //
  const handleDiaryToggle = () => {
    if (!isOpen) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Detect keyboard open/close
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setKbVisible(true)
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKbVisible(false)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []); // keyboard listeners [web:585][web:396]

  const remaining = useMemo(
    () =>
      typeof MAX_LEN === "number"
        ? Math.max(0, MAX_LEN - textDiary.length)
        : undefined,
    [textDiary]
  );
  const tooShort = textDiary.trim().length < MIN_LEN;
  const overMax = typeof MAX_LEN === "number" && textDiary.length > MAX_LEN;
  const canSave = !tooShort && !overMax && textDiary.trim().length > 0;

  const placeholder =
    "Write a few lines about today...\n• What happened?\n• How did it feel?\n• Anything to remember tomorrow?";

  const onSave = async () => {
    if (!canSave) return;
    // TODO: persist entry
    const newRecord = {
      user_email: profile?.email || "",
      mood: mood.label,
      body: textDiary,
    };
    try {
      await addDiary(newRecord);
      console.log(newRecord);
      setTextDiary("");
      setIsOpen(false);
    } catch (err) {
      console.error(err instanceof Error ? err.message : "Authentication failed");
    }
    Keyboard.dismiss();
  };

  // handle close window
  const handleClose = () => {
    Alert.alert(
      "Are you sure?",
      "Your diary is unsaved. Do you want to leave without saving?",
      [
        {
          text: "Cancel",
          style: "cancel", // iOS-style bold cancel
          onPress: () => {}, // Do nothing
        },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => setIsOpen(false), // Close modal
        },
      ],
      { cancelable: true }
    );
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
                {profile?.first_name ? `${profile.first_name} is feeling` : "I'm feeling"} <Text style={styles.pillStrong}>{mood.label}</Text>
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
              <Text style={styles.pillText}>log with text</Text>
              <Pressable
                style={styles.pillBtn}
                onPress={handleDiaryToggle}
                hitSlop={8}
              >
                <Text style={styles.pillBtnText}>DIARY</Text>
              </Pressable>
            </View>

            <Modal
              animationType="fade"
              transparent={true}
              visible={isOpen}
              onRequestClose={() => setIsOpen(false)} // Android back button
            >
              <Pressable style={styles.modalOverlay} onPress={handleClose}>
                <Pressable
                  style={styles.modalContainer}
                  onPress={(e) => e.stopPropagation()}
                >
                  <ScrollView>
                    <KeyboardAvoidingView
                      style={{ flex: 1, backgroundColor: "#F9F9FB" }}
                      behavior={Platform.OS === "ios" ? "padding" : undefined}
                    >
                      <TouchableWithoutFeedback
                        onPress={Keyboard.dismiss}
                        accessible={false}
                      >
                        <View
                          style={[
                            styles.container,
                            kbVisible
                              ? styles.containerTop
                              : styles.containerCenter,
                          ]}
                        >
                          <View
                            style={{
                              width: "100%",
                              flexDirection: "row",
                              justifyContent: "flex-end",
                              alignItems: "flex-end",
                              padding: 10,
                            }}
                          >
                            <TouchableOpacity onPress={handleClose}>
                              <AntDesign name="close" size={24} color="black" />
                            </TouchableOpacity>
                          </View>
                          {/* <Button title="Close" onPress={() => setIsOpen(false)} /> */}
                          <Text style={styles.header}>Diary</Text>

                          <View style={[styles.diaryCard, styles.diaryShadow]}>
                            <TextInput
                              style={styles.input}
                              multiline
                              scrollEnabled
                              value={textDiary}
                              onChangeText={setTextDiary}
                              placeholder={placeholder}
                              placeholderTextColor="rgba(0,0,0,0.35)"
                              textAlignVertical="top"
                              maxLength={MAX_LEN}
                              autoCorrect
                              autoCapitalize="sentences"
                              returnKeyType="default"
                            />

                            <View style={styles.helperRow}>
                              <Text
                                style={[styles.helper, tooShort && styles.warn]}
                              >
                                {tooShort
                                  ? `Add at least ${MIN_LEN} characters.`
                                  : "Tip: Just write freely, don't worry about grammar."}
                              </Text>

                              <Text
                                style={[
                                  styles.counter,
                                  remaining !== undefined && remaining <= 40
                                    ? styles.counterLow
                                    : null,
                                ]}
                              >
                                {textDiary.length}/{MAX_LEN}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.actions}>
                            <Pressable
                              style={[styles.btn, styles.btnGhost]}
                              onPress={() => {
                                setTextDiary("");
                                Keyboard.dismiss();
                              }}
                              hitSlop={8}
                            >
                              <Text style={styles.btnGhostText}>Clear</Text>
                            </Pressable>

                            <Pressable
                              style={({ pressed }) => [
                                styles.btn,
                                canSave
                                  ? styles.btnPrimary
                                  : styles.btnDisabled,
                                pressed && { opacity: 0.9 },
                              ]}
                              onPress={onSave}
                              disabled={!canSave}
                              hitSlop={8}
                            >
                              <Text style={styles.btnPrimaryText}>
                                Save entry
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                  </ScrollView>
                </Pressable>
              </Pressable>
            </Modal>

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
  // pop up window
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // semi-transparent background
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    padding: 10,
    backgroundColor: "#F9F9FB",
    borderRadius: 10,
    elevation: 10, // Android shadow
  },
  modalText: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
  },
  //Text diary
  container: {
    flex: 1,
  },
  // Center everything when keyboard is closed
  containerCenter: {
    justifyContent: "center",
    alignItems: "center",
  },
  // Push to top when keyboard opens
  containerTop: {
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 24,
  },

  header: {
    color: "black",
    fontFamily: "Noto Sans HK",
    fontWeight: "bold",
    fontSize: 35,
    marginBottom: 12,
    alignSelf: "stretch",
    textAlign: "left",
    marginLeft: 15,
  },

  diaryCard: {
    height: CARD_HEIGHT,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    paddingVertical: 12,
    flexDirection: "column",
    alignSelf: "stretch",
    marginBottom: 20,
  },
  diaryShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  input: {
    flexGrow: 0,
    maxHeight: INPUT_MAX,
    minHeight: 110,
    fontSize: 16,
    color: "#1D1D1F",
    padding: 12,
    borderRadius: 12,
    fontFamily: "Noto Sans HK",
  },

  helperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    paddingBottom: 4,
    marginTop: "auto", // anchor to bottom inside card
  },
  helper: { fontSize: 12, color: "#6B7280", fontFamily: "Noto Sans HK" },
  warn: { color: "#DC2626" },
  counter: { fontSize: 12, color: "#6B7280", fontFamily: "Noto Sans HK" },
  counterLow: { color: "#EF4444" },

  actions: {
    flexDirection: "row",
    gap: 10,
    alignSelf: "stretch",
    marginBottom: 12,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  btnPrimary: { backgroundColor: "#ACD1C9", borderColor: "#ACD1C9" },
  btnDisabled: { backgroundColor: "#acd1c985", borderColor: "#acd1c985" },
  btnPrimaryText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontFamily: "Noto Sans HK",
  },

  btnGhost: { backgroundColor: "#FFFFFF", borderColor: "rgba(0,0,0,0.08)" },
  btnGhostText: {
    color: "#1D1D1F",
    fontWeight: "700",
    fontFamily: "Noto Sans HK",
  },
});
