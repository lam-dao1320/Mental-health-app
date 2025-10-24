"use client";

import DateTimePickerPage from "@/components/dateTimePicker";
import { useUserContext } from "@/context/authContext";
import { getRecordsByEmail } from "@/lib/mood_crud";
import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";

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

  const [diaryRecord, setDiaryRecords] = useState({id: '', date: dateTime, user_email:  profile?.email, body: text})
  const [moodRecord, setMoodRecord] = useState({id: '', date: dateTime, user_email: profile?.email, mood: '', diary_id: diaryRecord.id});

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

  // Fetch the latest records
  const fetchDiary = async () => {
    if (!profile?.email) return;

    try {
      const updatedRecords = await getRecordsByEmail(profile.email);

      // Optional: if you store records in context and want to update them:
      setRecords(updatedRecords);

      console.log("Fetched latest diary records:", updatedRecords);
      return updatedRecords;
    } catch (err: any) {
      console.error("Error fetching diary:", err);
      Alert.alert("Error", err.message || "Failed to fetch diary records.");
      return [];
    }
  };

  // find the right record by id
  const record = useMemo(
    () => records.find((item) => String(item.id) === String(id)),
    [id, records]
  );


  const dateFormat = (date?: Date | null) => {
    if (!date) return "";
    const dateObj = new Date(date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString("en-US", { month: "short" });
    const year = dateObj.getFullYear();
    const weekday = dateObj.toLocaleString("en-US", { weekday: "short" });
    // console.log(dateObj.toISOString());
    return `${day} ${month} ${year} (${weekday})`;
  };

  if (!record) {
    return (
      <View style={s.container}>
        <Text style={s.header}>Come back later!</Text>
        <Text style={s.body}>We can't find your diary log.</Text>
      </View>
    );
  }

  const headerText = record.mood
  ? record.mood + emojiForMood(record.mood)
  : "No mood selected 😶";

  // Use diary body if available, else fallback
  useEffect(() => {
    if (record) {
      setText(record.diary?.body ?? "(no diary written)");

      const dateValue = record.diary?.date ?? record.date;
      // only set if it's valid
      if (dateValue && !isNaN(new Date(dateValue).getTime())) {
        setDateTime(new Date(dateValue));
      } else {
        setDateTime(new Date()); // fallback to today
      }

      setDiaryRecords({id: record.diary?.id, date: record.date, duser_email: profile?.email, body: record.diary?.body});
      setMoodRecord({id: record.id, date: dateTime, user_email: profile?.email, mood: record.mood, diary_id: record.diary?.id});
    }
  }, [record]);

 // ✅ Save or update record safely (supports null diary)
  const onSave = async () => {
    if (!canSave) return;
    if (!profile || !record) return;

    try {
      // --- 1️⃣ If the diary exists, update it ---
      if (record.diary?.id) {
        const updatedDiary = {
          body: text,
          date: dateTime.toISOString(),
          user_email: profile.email,
        };

        const { error: diaryErr } = await supabase
          .from("diary")
          .update(updatedDiary)
          .eq("id", record.diary.id);

        if (diaryErr) throw diaryErr;
      } 
      // --- 2️⃣ If no diary exists but text is present, create one ---
      else if (text.trim().length > 0) {
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

        // update mood_log to link to new diary
        await supabase
          .from("mood_log")
          .update({ diary_id: newDiary.id })
          .eq("id", record.id);
      }

      // --- 3️⃣ Update the mood_log itself (always safe) ---
      const updatedMoodLog = {
        mood: record.mood,
        date: dateTime.toISOString(),
        user_email: profile.email,
      };

      const { error: moodErr } = await supabase
        .from("mood_log")
        .update(updatedMoodLog)
        .eq("id", record.id);

      if (moodErr) throw moodErr;

      Alert.alert("Success", "Diary and mood log updated.");
      Keyboard.dismiss();

      await fetchDiary(); // 🔄 refresh
    } catch (err: any) {
      console.error("Update failed:", err);
      Alert.alert("Error", err.message || "Failed to update record.");
    }
  };



  // ✅ Delete function that safely handles null diary
  const onDelete = async () => {
    if (!record) return;

    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this mood log and diary (if exists)? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // 1️⃣ Delete mood_log first
              const { error: moodErr } = await supabase
                .from("mood_log")
                .delete()
                .eq("id", record.id);
              if (moodErr) throw moodErr;

              // 2️⃣ Delete diary only if exists
              if (record.diary?.id) {
                const { error: diaryErr } = await supabase
                  .from("diary")
                  .delete()
                  .eq("id", record.diary.id);
                if (diaryErr) throw diaryErr;
              }

              // Safe navigate
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
      style={{ flex: 1, backgroundColor: "#F9F9FB" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss?.()} accessible={false}>

        <View style={s.container}>
          <Text style={s.header}>Mood: {headerText}</Text>

          {/* Date Time */}
          <View style={s.dateTimeContainer}>
            <Text style={s.date}>{dateFormat(dateTime)}</Text>
            <Pressable
              style={s.pillBtn}
              onPress={() => setShowPicker(true)}
              hitSlop={8}
            >
              <Text 
              style={s.pillBtnText}
              >CHANGE</Text>
            </Pressable>

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
              returnKeyType="default"/>
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
                Keyboard.dismiss();
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
    height: '40%',
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
    marginTop: "auto", // anchor to bottom inside card
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
