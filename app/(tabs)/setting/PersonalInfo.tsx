import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const Colors = {
  bg: "#F9F9FB",
  card: "#FFFFFF",
  text: "#1D1D1F",
  sub: "#6B7280",
  border: "rgba(0,0,0,0.06)",
  mint: "#ACD1C9",
  divider: "rgba(0,0,0,0.08)",
};

const MAX_WIDTH = 560;

export default function PersonalInfoScreen() {
  const router = useRouter();
  const maxWidth = Math.min(Dimensions.get("window").width - 32, 560);

  // Mock data with editable state
  const [fullName, setFullName] = useState("KhelWolf");
  const [email, setEmail] = useState("mikaelonavarro@gmail.com");
  const [phone, setPhone] = useState("5550005555");
  const [perferedName, setPerferedName] = useState("Mikael");

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      contentContainerStyle={{
        flexGrow: 1, // ensures container takes full height
        alignItems: "center", // horizontal center
        justifyContent: "center", // vertical center
        padding: 16,
        gap: 16,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ width: "100%", maxWidth: MAX_WIDTH }}>
        <Text style={styles.title}>Personal Info</Text>
      </View>
      {/* Form */}
      <View
        style={[
          styles.card,
          styles.shadow,
          { width: "100%", maxWidth: MAX_WIDTH },
        ]}
      >
        <Field label="Full name">
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter full name"
            placeholderTextColor="rgba(0,0,0,0.35)"
            style={styles.input}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </Field>
        <Field label="Perfered name">
          <TextInput
            value={perferedName}
            onChangeText={setFullName}
            placeholder="Enter full name"
            placeholderTextColor="rgba(0,0,0,0.35)"
            style={styles.input}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </Field>

        <Divider />

        <Field label="Email">
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="name@example.com"
            placeholderTextColor="rgba(0,0,0,0.35)"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
          />
        </Field>

        <Field label="Phone">
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+1 (555) 000-0000"
            placeholderTextColor="rgba(0,0,0,0.35)"
            style={styles.input}
            keyboardType="phone-pad"
            returnKeyType="done"
          />
        </Field>
      </View>

      <Pressable
        style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.95 }]}
        onPress={() => router.back()}
        hitSlop={8}
      >
        <Ionicons name="checkmark" size={18} color="#fff" />
        <Text style={styles.saveText}>Save changes</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32, gap: 16 },
  titleWrap: { marginTop: 6, marginBottom: 2 },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
    fontFamily: "Noto Sans HK",
  },

  card: {
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  fieldRow: { paddingVertical: 10 },
  fieldLabel: {
    fontSize: 14,
    color: Colors.sub,
    marginBottom: 6,
    fontFamily: "Noto Sans HK",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.text,
    fontFamily: "Noto Sans HK",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
    marginVertical: 4,
  },

  // Medium-width, centered Save button
  saveBtn: {
    minWidth: 180,
    alignSelf: "center",
    backgroundColor: Colors.mint,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  saveText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    fontFamily: "Noto Sans HK",
  },
});
