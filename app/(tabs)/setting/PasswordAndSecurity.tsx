// app/(tabs)/setting/PasswordAndSecurity.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
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
  danger: "#DC2626",
};

export default function PasswordAndSecurityScreen() {
  const router = useRouter();
  const maxWidth = Math.min(Dimensions.get("window").width - 32, 560);

  // Mock editable state
  const [currentPwd, setCurrentPwd] = useState("••••••••");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [twoFA, setTwoFA] = useState(true); // mock 2FA enabled

  const canSave = newPwd.length >= 8 && newPwd === confirmPwd;

  const MINT = "#ACD1C9"; // brand mint
  const MINT_MED = "rgba(172, 209, 201, 0.75)"; // medium
  const GRAY_MED = "rgba(0,0,0,0.28)";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.titleWrap, { maxWidth }]}>
        <Text style={styles.title}>Password and Security</Text>
      </View>

      {/* Change password */}
      <View style={[styles.card, styles.shadow, { width: "100%", maxWidth }]}>
        <Field label="Current password">
          <TextInput
            value={currentPwd}
            onChangeText={setCurrentPwd}
            placeholder="Enter current password"
            placeholderTextColor="rgba(0,0,0,0.35)"
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
            returnKeyType="next"
          />
        </Field>

        <Divider />

        <Field label="New password">
          <TextInput
            value={newPwd}
            onChangeText={setNewPwd}
            placeholder="At least 8 characters"
            placeholderTextColor="rgba(0,0,0,0.35)"
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
            returnKeyType="next"
          />
        </Field>

        <Divider />

        <Field label="Confirm new password">
          <TextInput
            value={confirmPwd}
            onChangeText={setConfirmPwd}
            placeholder="Re-enter new password"
            placeholderTextColor="rgba(0,0,0,0.35)"
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
            returnKeyType="done"
          />
        </Field>

        {newPwd.length > 0 && newPwd.length < 8 ? (
          <Text style={styles.hint}>Use at least 8 characters.</Text>
        ) : null}
        {confirmPwd.length > 0 && newPwd !== confirmPwd ? (
          <Text style={[styles.hint, { color: Colors.danger }]}>
            Passwords do not match.
          </Text>
        ) : null}
      </View>

      {/* Two-factor auth mock */}
      <View style={[styles.card, styles.shadow, { width: "100%", maxWidth }]}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.sectionTitle}>Two‑factor authentication</Text>
            <Text style={styles.subText}>
              Add an extra step at sign‑in with an authenticator app or backup
              codes.
            </Text>
          </View>
          <Switch
            value={twoFA}
            onValueChange={setTwoFA}
            trackColor={{ false: GRAY_MED, true: MINT_MED }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={GRAY_MED}
          />
        </View>

        <View style={styles.btnRow}>
          <Pressable
            style={({ pressed }) => [
              styles.ghostBtn,
              pressed && { opacity: 0.95 },
            ]}
            onPress={() => {}}
          >
            <Text style={styles.ghostText}>Manage methods</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.ghostBtn,
              pressed && { opacity: 0.95 },
            ]}
            onPress={() => {}}
          >
            <Text style={styles.ghostText}>Recovery codes</Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.saveBtn,
          !canSave && styles.saveDisabled,
          pressed && { opacity: 0.95 },
        ]}
        onPress={() => router.back()}
        disabled={!canSave}
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
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 16,
  },
  titleWrap: { width: "100%" },
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
    marginVertical: 6,
  },
  hint: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.sub,
    fontFamily: "Noto Sans HK",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
    fontFamily: "Noto Sans HK",
  },
  subText: {
    fontSize: 13,
    color: Colors.sub,
    fontFamily: "Noto Sans HK",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  ghostBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  ghostText: {
    color: Colors.text,
    fontWeight: "700",
    fontFamily: "Noto Sans HK",
  },

  // Medium-width, centered Save button
  saveBtn: {
    minWidth: 200,
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
  saveDisabled: { backgroundColor: "rgba(172, 209, 201, 0.55)" },
  saveText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    fontFamily: "Noto Sans HK",
  },
});
