// "use client";

import DateTimePickerPage from "@/components/dateTimePicker";
import { useUserContext } from "@/context/authContext";
import { getRecordsByEmail } from "@/lib/mood_crud";
import { supabase } from "@/lib/supabase";
import DateTimePicker from "@react-native-community/datetimepicker";
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

const emojiForMood = (text: string) => {
  const t = text.toLowerCase();
  if (t.includes("angry")) return " 😡";
  if (t.includes("sad")) return " 😢";
  if (t.includes("low")) return " 😔";
  if (t.includes("okay")) return " 😊";
  if (t.includes("great")) return " 😄";
  return " 😊";
};

export default function CardDetails() {
  const { id } = useLocalSearchParams();
  const { profile, records, setRecords } = useUserContext();
  const [text, setText] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());
  const [missingRecord, setMissingRecord] = useState<any>(null);

  const MAX_LEN = 500;
  const MIN_LEN = 0;

  const remaining = useMemo(() => Math.max(0, MAX_LEN - text.length), [text]);

  const canSave = text.trim().length > MIN_LEN && text.length <= MAX_LEN;

  const placeholder =
    "Write a few lines about today...\n• What happened?\n• How did it feel?\n• Anything to remember tomorrow?";

  // ---- Fetch records from context or Supabase ----
  const fetchDiary = async () => {
    if (!profile?.email) return;
    try {
      const updatedRecords = await getRecordsByEmail(profile.email);
      setRecords(updatedRecords);
      console.log("Fetched latest diary records:", updatedRecords);
      return updatedRecords;
    } catch (err: any) {
      console.error("Error fetching diary:", err);
      Alert.alert("Error", err.message || "Failed to fetch diary records.");
    }
  };

  // console.log("🧩 All records:", records);
  // console.log("🔍 Looking for id:", id);

  // ---- Find record in context ----
  const record: any = useMemo(() => {
    return records.find(
      (item: any) =>
        String(item.id) === String(id) || String(item.diary_id) === String(id)
    );
  }, [id, records]);

  // ---- Fetch standalone diary if not found ----
  useEffect(() => {
    const fetchMissing = async () => {
      if (!record && id) {
        // fetch the diary
        const { data, error } = await supabase
          .from("diary")
          .select("id, user_email, body, date")
          .eq("id", id)
          .single();

        if (error || !data) return;

        // fetch mood linked to that diary
        const { data: moodData } = await supabase
          .from("mood_log")
          .select("mood")
          .eq("diary_id", data.id)
          .single();

        setMissingRecord({
          ...data,
          mood: moodData?.mood ?? null,
        });
      }
    };
    fetchMissing();
  }, [record, id]);

  const activeRecord = record ?? missingRecord;
  const isLoading = !activeRecord;

  const headerText = activeRecord?.mood
    ? `Mood: ${
        activeRecord.mood.charAt(0).toUpperCase() +
        activeRecord.mood.slice(1).toLowerCase()
      } ${emojiForMood(activeRecord.mood)}`
    : "Diary";

  const dateFormat = (date?: string | null) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getDate()} ${d.toLocaleString("en-US", {
      month: "short",
    })} ${d.getFullYear()} (${d.toLocaleString("en-US", {
      weekday: "short",
    })})`;
  };

  // ---- Populate state when record loads ----
  useEffect(() => {
    if (!activeRecord) return;

    const diaryBody =
      (activeRecord as any).diary?.body ||
      activeRecord.body ||
      "(no diary written)";
    const diaryDate =
      (activeRecord as any).diary?.date || activeRecord.date || new Date();

    setText(diaryBody);
    setDateTime(new Date(diaryDate));
  }, [activeRecord]);

  // ---- Save / Update ----
  const onSave = async () => {
    if (!canSave || !profile || !activeRecord) return;

    try {
      // Update diary
      if (activeRecord.diary?.id) {
        const { error: diaryErr } = await supabase
          .from("diary")
          .update({
            body: text,
            date: dateTime.toISOString(),
            user_email: profile.email,
          })
          .eq("id", activeRecord.diary.id);
        if (diaryErr) throw diaryErr;
      } else if (text.trim().length > 0) {
        // Create new diary
        const { data: newDiary, error: newDiaryErr } = await supabase
          .from("diary")
          .insert({
            user_email: profile.email,
            body: text,
            date: dateTime.toISOString(),
          })
          .select("id")
          .single();
        if (newDiaryErr) throw newDiaryErr;

        // Link mood_log to new diary
        await supabase
          .from("mood_log")
          .update({ diary_id: newDiary.id })
          .eq("id", activeRecord.id);
      }

      // Update mood_log if applicable
      if (activeRecord.mood) {
        await supabase
          .from("mood_log")
          .update({
            mood: activeRecord.mood,
            date: dateTime.toISOString(),
            user_email: profile.email,
          })
          .eq("id", activeRecord.id);
      }

      Alert.alert("Success", "Diary and mood log updated.");
      setShowPicker(false);
      await fetchDiary();
      router.back();
    } catch (err: any) {
      console.error("Update failed:", err);
      Alert.alert("Error", err.message || "Failed to update record.");
    }
  };

  // ---- Delete ----
  const onDelete = async () => {
    if (!activeRecord) return;
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this mood log and diary (if exists)?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await supabase
                .from("mood_log")
                .delete()
                .eq("id", activeRecord.id);
              if (activeRecord.diary?.id) {
                await supabase
                  .from("diary")
                  .delete()
                  .eq("id", activeRecord.diary.id);
              }
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

  // ---- UI ----
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F9F9FB" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback
        onPress={() => setShowPicker(false)}
        accessible={false}
      >
        {isLoading ? (
          <View style={s.container}>
            <Text style={s.header}>Come back later!</Text>
            <Text style={s.body}>We can't find your diary log.</Text>
          </View>
        ) : (
          <View style={s.container}>
            <Text style={s.header}>{headerText}</Text>

            {/* Date section */}
            <View style={s.dateTimeContainer}>
              <Text style={s.date}>{dateFormat(dateTime.toISOString())}</Text>
              <Pressable
                style={s.pillBtn}
                onPress={() => setShowPicker(true)}
                hitSlop={8}
              >
                <Text style={s.pillBtnText}>CHANGE</Text>
              </Pressable>

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

            {/* Text area */}
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
              />
              <View style={s.helperRow}>
                <Text
                  style={[s.counter, remaining <= 40 ? s.counterLow : null]}
                >
                  {text.length}/{MAX_LEN}
                </Text>
              </View>
            </View>

            {/* Buttons */}
            <View style={s.actions}>
              <Pressable
                style={[s.btn, s.btnGhost]}
                onPress={() => {
                  setText("");
                  setShowPicker(false);
                }}
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
              >
                <Text style={s.btnPrimaryText}>Save entry</Text>
              </Pressable>
            </View>

            <View style={s.actions}>
              <Pressable style={[s.btn, s.btnDanger]} onPress={onDelete}>
                <Text style={s.btnDangerText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: "#F9F9FB",
    height: "100%",
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
  bodyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    padding: 12,
    height: "40%",
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  date: { color: "#333", fontSize: 18, marginLeft: 10 },
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
    justifyContent: "flex-end",
    paddingHorizontal: 6,
    paddingBottom: 4,
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
  btnDanger: { backgroundColor: "#F87171", borderColor: "#F87171" },
  btnDangerText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontFamily: "Noto Sans HK",
  },
});
