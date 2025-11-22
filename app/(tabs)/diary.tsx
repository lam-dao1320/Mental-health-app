// app/diary.tsx
import { useUserContext } from "@/context/authContext";
import { getDiaryByEmail } from "@/lib/diary_crud";
import { getRecordsByEmail } from "@/lib/mood_crud";
import { supabase } from "@/lib/supabase";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const CARD_HEIGHT = 360;
const INPUT_MAX = 200;
const MAX_LEN = 500;
const MIN_LEN = 0;

export default function DiaryPage() {
  const { profile, setRecords, setDiaryRecords } = useUserContext();
  const [text, setText] = useState("");
  const [kbVisible, setKbVisible] = useState(false);

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
        ? Math.max(0, MAX_LEN - text.length)
        : undefined,
    [text]
  );
  const tooShort = text.trim().length < MIN_LEN;
  const overMax = typeof MAX_LEN === "number" && text.length > MAX_LEN;
  const canSave = !tooShort && !overMax && text.trim().length > 0;

  const placeholder =
    "Write a few lines about today...\n• What happened?\n• How did it feel?\n• Anything to remember tomorrow?";

  const fetchDiary = async () => {
    if (profile) {
      try {
        const data = await getDiaryByEmail(profile.email);
        const updatedRecords = await getRecordsByEmail(profile.email);
        // console.log(data);
        setDiaryRecords(data);
        setRecords(updatedRecords);
      } catch (err: any) {
        Alert.alert("Error", "Registration failed");
        console.error(
          err instanceof Error ? err.message : "Resetting password failed"
        );
      }
    }
  };

  const onSave = async () => {
    if (!canSave) return;
    if (!profile) return;

    const newDiaryRecord = {
      user_email: profile.email,
      body: text,
    };

    console.log("Saving new diary record:", newDiaryRecord);

    try {
      // Insert diary and get inserted diary id
      const { data: diary, error: diaryErr } = await supabase
        .from("diary")
        .insert(newDiaryRecord)
        .select("id")
        .single();

      if (diaryErr || !diary)
        throw diaryErr ?? new Error("Failed to create diary");

      // Insert mood_log with mood=null and diary_id set to the new diary's id
      const { error: moodErr } = await supabase.from("mood_log").insert({
        user_email: profile.email,
        mood: null,
        diary_id: diary.id,
        date: new Date().toISOString(),
      });

      if (moodErr) throw moodErr;

      Alert.alert("Success", "Diary and mood log saved.");
      fetchDiary();
      setText("");
    } catch (err: any) {
      if (err.message?.toLowerCase().includes("duplicate")) {
        Alert.alert("Error", "Entry already exists.");
      } else {
        Alert.alert("Error", err.message || "Save failed");
      }
      console.error(err);
    }

    Keyboard.dismiss();
  };

  // const onSave = async () => {
  //   if (!canSave) return;
  //   // Add new Diary Record to database
  //   let newDiaryRecord = {
  //     user_email: profile?.email || "",
  //     body: text,
  //   }
  //   try {
  //     await addNewDiary(newDiaryRecord);
  //     fetchDiary();
  //     Alert.alert("Success", "Diary is saved");
  //   } catch (err: any) {
  //     if (err.message.toLowerCase().includes("duplicate")) {
  //       Alert.alert("Error", "Date is existed");
  //     } else Alert.alert("Error", "Registration failed");
  //   }
  //   // TODO: persist entry
  //   setText("");
  //   Keyboard.dismiss();
  // };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F9F9FB" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View
          style={[s.container, kbVisible ? s.containerTop : s.containerCenter]}
        >
          {/* Hide the big title when keyboard is visible */}
          <Text style={s.header}>Diary</Text>

          <View style={[s.card, s.shadow]}>
            <TextInput
              style={s.input}
              multiline
              scrollEnabled
              value={text}
              onChangeText={(val) => {
                if (val.length > MAX_LEN) val = val.slice(0, MAX_LEN);
                setText(val);
              }}
              placeholder={placeholder}
              placeholderTextColor="rgba(0,0,0,0.35)"
              textAlignVertical="top"
              maxLength={MAX_LEN}
              autoCorrect
              autoCapitalize="sentences"
              returnKeyType="default"
              blurOnSubmit={false}
            />

            <View style={s.helperRow}>
              <Text style={[s.helper, tooShort && s.warn]}>
                {tooShort
                  ? `Add at least ${MIN_LEN} characters.`
                  : "Tip: Just write freely, don't worry about grammar."}
              </Text>

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
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9FB",
    paddingHorizontal: 15,
    gap: 16,
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

  card: {
    height: CARD_HEIGHT,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    padding: 12,
    flexDirection: "column",
    alignSelf: "stretch",
  },
  shadow: {
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
