// [id].tsx

import DateTimePickerPage from "@/components/dateTimePicker";
import { useUserContext } from "@/context/authContext";
import { getRecordsByEmail } from "@/lib/mood_crud";
import { supabase } from "@/lib/supabase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const GRADIENTS: [string, string][] = [
  ["#FBEAEA", "#F9DADA"], // angry – rose mist (0)
  ["#E3ECFA", "#D8E5F4"], // sad – baby sky (1)
  ["#F1E6F6", "#E7DDF1"], // low – pale lilac (2)
  ["#FFFBE2", "#FFF4CC"], // okay – soft cream (3)
  ["#E8FAEC", "#e6f7e9ff"], // great – mint cloud (4)
];
const RAINBOW_GRADIENT: [string, string] = ["#f0edd6ff", "#bed8ebff"]; // Standalone Diary: Gold to Hot Pink

const emojiForMood = (text: string) => {
  const t = text.toLowerCase();
  if (t.includes("angry")) return " 😡";
  if (t.includes("sad")) return " 😢";
  if (t.includes("low")) return " 😔";
  if (t.includes("okay")) return " 😊";
  if (t.includes("great")) return " 😄";
  return " 😶";
};

const moodToIndex = (m: string | null) => {
  if (!m) return 3;
  const key = m.toLowerCase();
  if (key.includes("angry")) return 0;
  if (key.includes("sad")) return 1;
  if (key.includes("low")) return 2;
  if (key.includes("okay")) return 3;
  if (key.includes("great")) return 4;
  return 3;
};

export default function CardDetails() {
  const { id } = useLocalSearchParams();
  const { profile, setRecords } = useUserContext();

  const [text, setText] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());

  const [currentRecord, setCurrentRecord] = useState<any>(null);

  const MAX_LEN = 500;
  const MIN_LEN = 0;
  const remaining = useMemo(
    () =>
      typeof MAX_LEN === "number"
        ? Math.max(0, MAX_LEN - text.length)
        : undefined,
    [text]
  );
  const tooShort = text.trim().length < MIN_LEN;
  const overMax = typeof MAX_LEN === "number" && text.length > MAX_LEN;
  const canSave = !tooShort && !overMax && text.trim().length > 0;

  const placeholder =
    "Write a few lines about today...\n• What happened?\n• How did it feel?\n• Anything to remember tomorrow?";

  const fetchRecords = async () => {
    if (!profile?.email) return;

    try {
      const updatedRecords = await getRecordsByEmail(profile.email);
      setRecords(updatedRecords);
      return updatedRecords;
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to fetch record context.");
      return [];
    }
  };

  const fetchSingleRecord = async () => {
    if (!profile?.email || !id) return;
    const recordId = String(id);

    // 1. Try fetching it as a Mood Log entry
    const { data: moodData } = await supabase
      .from("mood_log")
      .select(`id, user_email, mood, date, diary ( id, body, date )`)
      .eq("user_email", profile.email)
      .eq("id", recordId)
      .limit(1)
      .single();

    if (moodData) {
      setCurrentRecord(moodData);
      return;
    }

    // 2. If not found as Mood Log ID, try fetching it as a Standalone Diary ID
    const { data: diaryData } = await supabase
      .from("diary")
      .select(`id, body, date`)
      .eq("user_email", profile.email)
      .eq("id", recordId)
      .limit(1)
      .single();

    if (diaryData) {
      setCurrentRecord({
        id: diaryData.id,
        mood: null,
        date: diaryData.date,
        diary: diaryData,
        user_email: profile.email,
      });
      return;
    }

    setCurrentRecord(null);
  };

  // Fetch data on load/ID change
  useEffect(() => {
    fetchSingleRecord();
    fetchRecords();
  }, [id, profile]);

  // Initialize component state when currentRecord changes
  useEffect(() => {
    if (currentRecord) {
      const diaryBody = currentRecord.diary?.body ?? "";
      const dateValue = currentRecord.date;

      setText(diaryBody);

      if (dateValue && !isNaN(new Date(dateValue).getTime())) {
        setDateTime(new Date(dateValue));
      } else {
        setDateTime(new Date());
      }
    }
  }, [currentRecord]);

  const dateFormat = (date?: Date | null) => {
    if (!date) return "";
    const dateObj = new Date(date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString("en-US", { month: "short" });
    const year = dateObj.getFullYear();
    const weekday = dateObj.toLocaleString("en-US", { weekday: "short" });
    return `${day} ${month} ${year} (${weekday})`;
  };

  if (!currentRecord) {
    return (
      <View style={s.container}>
        <Text style={s.header}>Come back later!</Text>
        <Text style={s.body}>We can't find your diary log. (ID: {id})</Text>
      </View>
    );
  }

  const moodLogId = currentRecord.mood ? currentRecord.id : null;
  const diaryId = currentRecord.diary?.id ?? currentRecord.id;

  const headerText = currentRecord.mood
    ? currentRecord.mood + emojiForMood(currentRecord.mood)
    : "Diary Entry 📝";

  // Determine Background Colors
  const isStandaloneDiary = currentRecord.mood === null;
  const moodColors = isStandaloneDiary
    ? RAINBOW_GRADIENT
    : GRADIENTS[moodToIndex(currentRecord.mood)];

  // ✅ Save or update record safely
  const onSave = async () => {
    if (!canSave || !profile || !currentRecord) return;

    try {
      const entryDateIso = dateTime.toISOString();

      // --- 1️⃣ Update the Diary Table (Always required) ---
      if (diaryId) {
        const updatedDiary = {
          body: text,
          date: entryDateIso,
          user_email: profile.email,
        };

        const { error: diaryErr } = await supabase
          .from("diary")
          .update(updatedDiary)
          .eq("id", diaryId);

        if (diaryErr) throw diaryErr;
      } else {
        throw new Error("Cannot save: Missing diary reference ID.");
      }

      // --- 2️⃣ Update the Mood Log Table (Conditional) ---
      if (moodLogId) {
        const updatedMoodLog = {
          mood: currentRecord.mood,
          date: entryDateIso,
          user_email: profile.email,
          diary_id: diaryId,
        };

        const { error: moodErr } = await supabase
          .from("mood_log")
          .update(updatedMoodLog)
          .eq("id", moodLogId);

        if (moodErr) throw moodErr;
      }

      Alert.alert("Success", "Record updated.");
      setShowPicker(false);

      await fetchRecords();
      router.back();
    } catch (err: any) {
      console.error("Update failed:", err);
      Alert.alert("Error", err.message || "Failed to update record.");
    }
  };

  // ✅ Delete function that safely handles both types
  const onDelete = async () => {
    if (!currentRecord) return;

    const moodIdToDelete = moodLogId;
    const diaryIdToDelete = diaryId;

    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this entry? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // 1️⃣ Delete MOOD LOG (if it exists)
              if (moodIdToDelete) {
                const { error: moodErr } = await supabase
                  .from("mood_log")
                  .delete()
                  .eq("id", moodIdToDelete);
                if (moodErr) throw moodErr;
              }

              // 2️⃣ Delete DIARY (always required since this page is driven by a diary or linked mood)
              const { error: diaryErr } = await supabase
                .from("diary")
                .delete()
                .eq("id", diaryIdToDelete);
              if (diaryErr) throw diaryErr;

              await fetchRecords();
              router.back();
            } catch (err: any) {
              console.error("Delete failed:", err);
              Alert.alert("Error", err.message || "Failed to delete record.");
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }} // KAV takes up full screen
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback
        onPress={() => setShowPicker(false)}
        accessible={false}
      >
        <LinearGradient
          colors={moodColors} // Use the two colors here
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.gradientFill} // Ensure this style covers the whole KAV area
        >
          <View style={s.container}>
            <Text style={s.header}>{headerText}</Text>

            {/* Date Time */}
            <View style={s.dateTimeContainer}>
              <Text style={s.date}>{dateFormat(dateTime)}</Text>
              <Pressable
                style={s.pillBtn}
                onPress={() => setShowPicker(true)}
                hitSlop={8}
              >
                <Text style={s.pillBtnText}>CHANGE</Text>
              </Pressable>

              {/* iOS: use Modal */}
              {Platform.OS === "ios" && showPicker && (
                <Modal
                  animationType="fade"
                  transparent={true}
                  visible={showPicker}
                  onRequestClose={() => setShowPicker(false)}
                >
                  <Pressable
                    style={s.modalOverlay}
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
                    setShowPicker(false);
                    if (selectedDate) setDateTime(selectedDate);
                  }}
                />
              )}
            </View>

            {/* Text */}
            <View style={s.bodyContainer}>
              <TextInput
                style={s.body}
                multiline
                scrollEnabled
                value={text}
                onChangeText={setText}
                placeholder={placeholder}
                placeholderTextColor="rgba(0,0,0,0.35)"
                textAlignVertical="top"
                autoCorrect
                autoCapitalize="sentences"
                returnKeyType="default"
              />
              <View style={s.helperRow}>
                <Text
                  style={[
                    s.counter,
                    remaining !== undefined && remaining <= 40
                      ? s.counterLow
                      : null,
                  ]}
                >
                  {text.length}/{MAX_LEN}
                </Text>
              </View>
            </View>

            <View style={s.actions}>
              <Pressable
                style={[s.btn, s.btnGhost]}
                onPress={() => {
                  setText("");
                  setShowPicker(false);
                }}
                hitSlop={8}
              >
                <Text style={s.btnGhostText}>Clear</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  s.btn,
                  canSave ? s.btnPrimary : s.btnDisabled,
                  pressed && { opacity: 0.9 },
                ]}
                onPress={onSave}
                disabled={!canSave}
                hitSlop={8}
              >
                <Text style={s.btnPrimaryText}>Save entry</Text>
              </Pressable>
            </View>

            {/* 🗑️ Delete Button */}
            <View style={s.actions}>
              <Pressable
                style={[s.btn, s.btnDanger]}
                onPress={onDelete}
                hitSlop={8}
              >
                <Text style={s.btnDangerText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  gradientFill: {
    flex: 1, // Crucial: Makes the gradient fill the entire KAV area
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
  header: {
    color: "black",
    fontFamily: "Noto Sans HK",
    fontWeight: "bold",
    fontSize: 35,
    marginTop: 40,
    marginBottom: 10,
    marginHorizontal: 15,
  },
  body: {
    color: "#444",
    fontSize: 16,
    lineHeight: 22,
    marginHorizontal: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "#444",
    marginVertical: 8,
  },
  bodyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    padding: 12,
    flexDirection: "column",
    alignSelf: "stretch",
    height: "40%",
    paddingVertical: 12,
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  date: {
    color: "#333",
    fontSize: 18,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  pillBtn: {
    borderRadius: 999,
    backgroundColor: "rgba(150, 236, 251, 0.28)",
    borderWidth: 1,
    borderColor: "rgba(82, 89, 91, 0.28)",
  },
  pillBtnText: {
    color: "#000",
    fontWeight: "900",
    letterSpacing: 1,
    margin: 10,
  },
  helperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    paddingBottom: 4,
    marginTop: "auto",
  },
  counter: { fontSize: 12, color: "#6B7280", fontFamily: "Noto Sans HK" },
  counterLow: { color: "#EF4444" },
  actions: {
    flexDirection: "row",
    gap: 10,
    alignSelf: "stretch",
    marginVertical: 12,
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
  btnDanger: {
    backgroundColor: "#F87171",
    borderColor: "#F87171",
  },
  btnDangerText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontFamily: "Noto Sans HK",
  },
});
