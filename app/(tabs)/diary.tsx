// app/(tabs)/diary.tsx  OR  app/diary.tsx
import React, { useMemo, useState } from "react";
import {
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

const MAX_LEN = 500; // set undefined to remove hard cap [web:380]
const MIN_LEN = 0; // basic minimum for validation

export default function DiaryPage() {
  const [text, setText] = useState("");

  const remaining = useMemo(() => {
    if (typeof MAX_LEN !== "number") return undefined;
    return Math.max(0, MAX_LEN - text.length);
  }, [text]);

  const tooShort = text.trim().length < MIN_LEN;
  const overMax = typeof MAX_LEN === "number" && text.length > MAX_LEN;
  const canSave = !tooShort && !overMax && text.trim().length > 0;

  const placeholder =
    "Write a few lines about today...\n• What happened?\n• How did it feel?\n• Anything to remember tomorrow?";

  const onSave = () => {
    if (!canSave) return;
    const entry = {
      text: text.trim(),
      createdAt: new Date().toISOString(),
      length: text.trim().length,
    };
    // TODO: persist entry (AsyncStorage/DB), then clear/navigate
    setText("");
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined} // keep buttons visible on iOS [web:388]
    >
      {/* Tap anywhere outside the input to dismiss the keyboard */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={s.container}>
          <Text style={s.title}>Diary</Text>

          <View style={[s.card, s.shadow]}>
            <TextInput
              style={s.input}
              multiline
              value={text}
              onChangeText={setText}
              placeholder={placeholder}
              placeholderTextColor="rgba(0,0,0,0.35)"
              textAlignVertical="top" // top-align on Android too [web:373]
              maxLength={typeof MAX_LEN === "number" ? MAX_LEN : undefined} // hard limit [web:380]
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

              {typeof MAX_LEN === "number" && (
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
              )}
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
              style={[s.btn, canSave ? s.btnPrimary : s.btnDisabled]}
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

const Colors = {
  bg: "#F6F5F2",
  card: "#FFFFFF",
  text: "#1D1D1F",
  sub: "#6B7280",
  border: "rgba(0,0,0,0.08)",
  primary: "#4C8BF5",
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg }, // safe areas [web:388]
  container: { flex: 1, padding: 16 },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 12,
  },

  card: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
  },
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    padding: 12,
    borderRadius: 12,
  },

  helperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    paddingBottom: 4,
  },
  helper: { fontSize: 12, color: Colors.sub },
  warn: { color: "#DC2626" },

  counter: { fontSize: 12, color: Colors.sub },
  counterLow: { color: "#EF4444" },

  actions: { flexDirection: "row", gap: 10, marginTop: 12 },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  btnPrimary: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  btnDisabled: { backgroundColor: "#C7D2FE", borderColor: "#C7D2FE" },
  btnPrimaryText: { color: "#FFFFFF", fontWeight: "800" },

  btnGhost: { backgroundColor: Colors.card, borderColor: Colors.border },
  btnGhostText: { color: Colors.text, fontWeight: "700" },
});
