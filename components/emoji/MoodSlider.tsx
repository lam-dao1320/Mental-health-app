// app/(tabs)/emoji.tsx

import { useUserContext } from "@/context/authContext";
import { calculateNewScore } from "@/lib/geminiAI_func";
import { addNewRecord, getRecordsByEmail } from "@/lib/mood_crud";
import { NewScoreData } from "@/lib/object_types";
import { supabase } from "@/lib/supabase";
import { updateUser } from "@/lib/user_crud";
import { AntDesign } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Slider from "@react-native-community/slider";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
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
import DateTimePickerPage from "../dateTimePicker";
import NewScoreDisplay from "./scoreDisplay";

type MoodEntry = {
  value: number;
  emoji: string;
  label: string;
  word: string;
  timestamp: string;
  displayDate: string;
  displayTime: string;
};

const mockScore = {"anxiety_score": 15, "depression_score": 18, "overall_score": 29, "summary": "The user is experiencing continued sadness and stress due to uncompleted tasks. Their emotional state shows a slight decline, with increased depression and anxiety contributing to a worsening of overall wellness."}

const MOODS = [
  { emoji: "😡", label: "angry", word: "ANGRY" },
  { emoji: "😢", label: "sad", word: "SAD" },
  { emoji: "😔", label: "low", word: "LOW" },
  { emoji: "😊", label: "okay", word: "OKAY" },
  { emoji: "😄", label: "great", word: "GREAT" },
];

const GRADIENTS: [string, string][] = [
  ["#F28B82", "#F49790"], // angry – warm coral red
  ["#A7C7E7", "#89ABE3"], // sad – soft blue
  ["#CDB4DB", "#B5838D"], // low – muted lavender
  ["#FEEA9A", "#FFD166"], // okay – light yellow-gold
  ["#B4E197", "#90EE90"], // great – fresh mint green
];

const CARD_HEIGHT = 360;
const INPUT_MAX = 200;
const MAX_LEN = 500;
const MIN_LEN = 0;

export default function EmojiPage() {
  const { profile, setProfile, setRecords } = useUserContext();
  const router = useRouter();

  const [score, setScore] = useState<NewScoreData | null>(null);
  const [openScore, setOpenScore] = useState(false);
  const [loadingScore, setLoadingScore] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [textDiary, setTextDiary] = useState("");
  const [kbVisible, setKbVisible] = useState(false);

  const [continuousValue, setContinuousValue] = useState(75);
  const moodIndex = Math.min(4, Math.max(0, Math.round(continuousValue / 25)));
  const mood = useMemo(() => MOODS[moodIndex], [moodIndex]);
  const colors = GRADIENTS[moodIndex];

  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);

  // At the top inside EmojiPage component
  const [showPicker, setShowPicker] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());

  // Format the display date and time
  const formattedDate = dateTime.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = dateTime.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const nowText = `${formattedDate} • ${formattedTime}`;

  useFocusEffect(
    React.useCallback(() => {
      setDateTime(new Date()); // Reset to now
      setContinuousValue(75);
      setSaved(false);
      setCurrentRecordId(null);
      return undefined;
    }, [])
  );

  // animations
  const scale = useRef(new Animated.Value(1)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

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

  const animateBtn = () => {
    Animated.sequence([
      Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }),
      Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const [saved, setSaved] = useState(false);

  const onSlide = (v: number) => {
    if (saved) setSaved(false);
    setContinuousValue(v);
  };
  const onSlideEnd = () => pulse();

  // ✅ Save mood immediately
  const handleSave = async () => {
    animateBtn();
    setSaved(true);

    if (!profile) return;

    try {
      const newRecord = {
        user_email: profile.email,
        mood: mood.label,
        date: dateTime.toISOString(),
      };

      const savedMood = await addNewRecord(newRecord);
      setCurrentRecordId(savedMood.id); // SUCCESSFUL MOOD ID IS SAVED HERE
      fetchRecords();
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
    }
  };

  const fetchRecords = async () => {
    if (profile) {
      try {
        const data = await getRecordsByEmail(profile.email);
        setRecords(data);
      } catch (err) {
        console.error(err instanceof Error ? err.message : "Fetch failed");
      }
    }
  };

  const handleDiaryToggle = () => setIsOpen(!isOpen);

  // ✅ Save diary (and link only if an unlinked mood exists for the time OR if currentRecordId is set)
  const onSaveDiary = async () => {
    if (!profile) return;
    setIsOpen(false);
    setLoadingScore(true);
    setOpenScore(true);

    try {
      const cutoff = dateTime.toISOString();
      let moodToLink: { id: string; diary_id: string | null } | null = null;
      let moodAlreadyLinked = false;

      // PRIORITY 1: Check if a mood was saved THIS SESSION using the currentRecordId
      if (currentRecordId) {
        // Fetch the mood log by ID to ensure it exists and is unlinked
        const { data: currentMood, error: currentMoodErr } = await supabase
          .from("mood_log")
          .select("id, diary_id")
          .eq("id", currentRecordId)
          .single();

        if (currentMoodErr) throw currentMoodErr;

        if (currentMood.diary_id) {
          moodAlreadyLinked = true;
          Alert.alert(
            "Error",
            "The current mood entry already has a diary linked."
          );
          return;
        }

        moodToLink = currentMood;
      }

      // PRIORITY 2: Fallback check for any other unlinked mood at the current exact time
      if (!moodToLink) {
        const { data: fallbackMoods, error: fallbackMoodErr } = await supabase
          .from("mood_log")
          .select("id, diary_id")
          .eq("user_email", profile.email)
          .eq("date", cutoff)
          .is("diary_id", null)
          .limit(1);

        if (fallbackMoodErr) throw fallbackMoodErr;

        if (fallbackMoods && fallbackMoods.length > 0) {
          moodToLink = fallbackMoods[0];
        }
      }

      // 2. If mood is already linked (only happens if currentRecordId was set and the fetch failed/showed linked), exit
      if (moodAlreadyLinked) return;

      // 3. Create diary entry
      const { data: diary, error: diaryErr } = await supabase
        .from("diary")
        .insert({
          user_email: profile.email,
          body: textDiary,
          date: cutoff,
        })
        .select("id")
        .single();

      if (diaryErr || !diary) throw diaryErr ?? new Error("Diary not created");
      const newDiaryId = diary.id;

      // 4. Conditional Link to Mood Log
      if (moodToLink) {
        // Mood found (either current session or fallback) and is unlinked -> Perform the update/link
        const { error: updateErr } = await supabase
          .from("mood_log")
          .update({ diary_id: newDiaryId })
          .eq("id", moodToLink.id);

        if (updateErr) throw updateErr;

        console.log("✅ Diary saved and linked to existing mood:", {
          moodId: moodToLink.id,
          linkedDiaryId: newDiaryId,
        });
      } else {
        // No unlinked mood found. Diary is saved standalone.
        console.log("✅ Diary saved successfully (standalone entry).", {
          diaryId: newDiaryId,
        });
      }

      calculate();

      // Alert.alert("Success", "Diary Saved!");
      // Reset current mood ID after successful save/link
      setCurrentRecordId(null);
      fetchRecords();
      setTextDiary("");
      
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Something went wrong"
      );
      console.error(err);
    } finally {
      setLoadingScore(false);
    }
    setShowPicker(false);
  };

  const calculate = async () => {

    console.log("Profile: ", profile);
    console.log("Mood: ", mood);
    console.log("Diary: ", textDiary);
    let status = { emoji: mood.label, diary: textDiary };

    try {
      const resData = await calculateNewScore(profile, status);
      const res: NewScoreData = typeof resData === "string" ? JSON.parse(resData) : resData;
      // const res = mockScore;
      setScore(res);
      console.log("Score response: ", res);

    let updatedProfile = {
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      birth_date: profile?.birth_date || null,
      country: profile?.country || "",
      depression: res?.depression_score || 0,
      anxiety: res?.anxiety_score || 0,
      overall: res?.overall_score || 0,
      checked_in_at: new Date(),
      icon_name: profile?.icon_name || "",
    };

      await updateUser(updatedProfile);
      setProfile(updatedProfile);
    } catch (error) {
      console.log("Error calculate new mental score: ", error);
      setScore(mockScore);
    }
  }

  const handleClose = () => {
    Alert.alert(
      "Are you sure?",
      "Your diary is unsaved. Do you want to leave without saving?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => {
            setIsOpen(false);
            setTextDiary("");
          },
        },
      ],
      { cancelable: true }
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      setContinuousValue(75);
      setSaved(false);
      setCurrentRecordId(null);
      return undefined;
    }, [])
  );

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
  }, []);

  const placeholder =
    "Write a few lines about today...\n• What happened?\n• How did it feel?\n• Anything to remember tomorrow?";

  const remaining = Math.max(0, MAX_LEN - textDiary.length);
  const tooShort = textDiary.trim().length < MIN_LEN;
  const overMax = textDiary.length > MAX_LEN;
  const canSave = !tooShort && !overMax && textDiary.trim().length > 0;

  const handleHistory = () => router.push("/history");

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

          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.bigWord}>
            {mood.word}
          </Text>

          <View style={styles.centerWrap} pointerEvents="none">
            <Animated.Text style={[styles.emoji, { transform: [{ scale }] }]}>
              {mood.emoji}
            </Animated.Text>
          </View>

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

          <View style={styles.bottomDock} pointerEvents="box-none">
            <View style={styles.pillRow}>
              <Text style={styles.pillText}>
                {profile?.first_name
                  ? `${profile.first_name} is feeling`
                  : "I'm feeling"}{" "}
                <Text style={styles.pillStrong}>{mood.label}</Text>
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
              <Text style={styles.pillText}>Log with text</Text>
              <Pressable
                style={styles.pillBtn}
                onPress={handleDiaryToggle}
                hitSlop={8}
              >
                <Text style={styles.pillBtnText}>DIARY</Text>
              </Pressable>
            </View>

            {/* Diary Modal */}
            <Modal
              animationType="fade"
              transparent={true}
              visible={isOpen}
              onRequestClose={() => setIsOpen(false)}
            >
              <TouchableWithoutFeedback
                onPress={Keyboard.dismiss}
                accessible={false}
              >
                <Pressable
                  style={
                    kbVisible ? styles.modalOverlayTop : styles.modalOverlay
                  }
                  onPress={handleClose}
                >
                  <Pressable
                    style={styles.modalContainer}
                    onPress={(e) => e.stopPropagation()}
                  >
                    <ScrollView>
                      <KeyboardAvoidingView
                        style={{ flex: 1, backgroundColor: "#F9F9FB" }}
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
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
                              padding: 8,
                            }}
                          >
                            <TouchableOpacity onPress={handleClose}>
                              <AntDesign name="close" size={24} color="black" />
                            </TouchableOpacity>
                          </View>
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
                                  remaining <= 40 ? styles.counterLow : null,
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
                              onPress={onSaveDiary}
                              disabled={!canSave}
                              hitSlop={8}
                            >
                              <Text style={styles.btnPrimaryText}>
                                Save entry
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      </KeyboardAvoidingView>
                    </ScrollView>
                  </Pressable>
                </Pressable>
              </TouchableWithoutFeedback>
            </Modal>

            {/* Date Time Picker */}
            <View style={styles.pillRow}>
              <Text style={styles.pillText}>{nowText}</Text>
              <Pressable
                style={styles.pillBtn}
                onPress={() => setShowPicker(true)}
                hitSlop={8}
              >
                <Text style={styles.pillBtnText}>CHANGE</Text>
              </Pressable>
            </View>

            {/* iOS: use Modal */}
            {Platform.OS === "ios" && showPicker && (
              <Modal
                animationType="fade"
                transparent={true}
                visible={isOpen}
                onRequestClose={() => setIsOpen(false)}
              >
                <Pressable
                  style={styles.modalOverlay}
                  onPress={() => setShowPicker(false)}
                >
                  <DateTimePickerPage
                    dateTime={dateTime}
                    setDateTime={(newDate) => setDateTime(newDate)}
                    onClose={() => setShowPicker(false)}
                  />
                </Pressable>
              </Modal>
            )}

            {/* Android: render picker directly */}
            {Platform.OS === "android" && showPicker && (
              <DateTimePicker
                value={dateTime}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowPicker(false); // closes picker automatically
                  if (selectedDate) setDateTime(selectedDate);
                }}
              />
            )}

            {/* Weekly Tracking */}
            <View style={styles.pillRow}>
              <Text style={styles.pillText}>How Was Your Week</Text>
              <Pressable
                style={styles.pillBtn}
                onPress={() => router.push({ pathname: "/(tabs)/Weekly" })}
                hitSlop={8}
              >
                <Text style={styles.pillBtnText}>REPORT</Text>
              </Pressable>
            </View>

            {/* Score Modal */}
            {/* {loadingScore && <LoadingCircle />} */}

            <Modal
              animationType="fade"
              transparent={true}
              visible={openScore}
              onRequestClose={() => { setOpenScore(false); setScore(null); }}
            >              
              <View style={styles.modalOverlay}>  
                {score ? (
                  <NewScoreDisplay data={score} onClose={() => { setOpenScore(false); setScore(null); }} />
                ) : (
                  <ActivityIndicator color="#fff" />
                )}
              </View>
            </Modal>

          </View>
        </View>
      </View>
      
    </SafeAreaView>
  );
}

const BOTTOM_DOCK_ROWS = 4;
const DOCK_ROW_HEIGHT = 48;
const DOCK_GAP = 10;
const DOCK_PADDING = 12;
const RESERVED_BOTTOM =
  BOTTOM_DOCK_ROWS * DOCK_ROW_HEIGHT +
  (BOTTOM_DOCK_ROWS - 1) * DOCK_GAP +
  DOCK_PADDING +
  20;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F5F2" },
  page: { flex: 1, justifyContent: "center", paddingHorizontal: 16 },
  card: {
    height: 550,
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
    top: 10,
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
    top: -250,
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
    bottom: RESERVED_BOTTOM,
    height: 80,
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
  modalOverlayTop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
    paddingTop: 100,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    padding: 10,
    backgroundColor: "#F9F9FB",
    borderRadius: 10,
    elevation: 10,
  },
  container: { flex: 1 },
  containerCenter: {
    justifyContent: "center",
    alignItems: "center",
  },
  containerTop: {
    justifyContent: "flex-start",
    alignItems: "center",
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
    height: 200,
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
  scoreCard: {
    backgroundColor: "#F9F9FB",
    padding: 45,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8, // Android shadow
    maxWidth: 700,
    width: Dimensions.get('window').width * 0.9, // Adjust width for mobile screen
    marginVertical: 20,
    alignSelf: 'center',
    alignItems: 'center',
    position: 'relative',
  },
});
