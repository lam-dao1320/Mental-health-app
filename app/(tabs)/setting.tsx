// app/(tabs)/settings.tsx  or  app/settings.tsx
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const Colors = {
  lightBg: "#F9FAFB",
  card: "#FFFFFF",
  text: "#1D1D1F",
  subtext: "#6B7280",
  border: "rgba(0,0,0,0.06)",
  primary: "#4C8BF5",
  accent: "#FFD27F",
  icon: "#1B263B",
  divider: "rgba(0,0,0,0.08)",
};

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.lightBg }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.screen, { backgroundColor: Colors.lightBg }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SETTINGS</Text>
        </View>

        <View style={[styles.profileCard, styles.shadow]}>
          <Image
            source={{ uri: "https://i.pravatar.cc/200?img=3" }}
            style={styles.avatar}
          />
          <Text style={styles.name}>KhelWolf</Text>
          <Text style={styles.email}>mikaelonavarro@gmail.com</Text>
        </View>

        <View style={[styles.card, styles.shadow]}>
          <SectionRow
            icon="👤"
            label="Personal info"
            onPress={() => router.push("/")}
          />
        </View>

        <View style={[styles.card, styles.shadow]}>
          <SectionRow
            icon="🔑"
            label="Password and security"
            onPress={() => router.push("/")}
          />
          <Divider />
          <SectionRow
            icon="🧩"
            label="App and services"
            onPress={() => router.push("/")}
          />
          <Divider />
          <SectionRow
            icon="🔒"
            label="Privacy"
            onPress={() => router.push("/")}
          />
          <Divider />
          <SectionRow
            icon="🖥️"
            label="Devices"
            onPress={() => router.push("/")}
          />
        </View>

        <View style={[styles.card, styles.shadow]}>
          <SectionRow
            icon="🔔"
            label="Notifications"
            onPress={() => router.push("/")}
          />
          <Divider />
          <SectionRow icon="❓" label="Help" onPress={() => router.push("/")} />
          <Divider />
          <SectionRow
            icon="ℹ️"
            label="About"
            onPress={() => router.push("/")}
          />
        </View>
      </View>
    </ScrollView>
  );
}

function SectionRow({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [rowStyles.row, pressed && rowStyles.pressed]}
    >
      <Text style={rowStyles.icon}>{icon}</Text>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.chevron}>›</Text>
    </Pressable>
  );
}

function Divider() {
  return <View style={rowStyles.divider} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16 },
  header: {
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 13,
    letterSpacing: 1,
    color: Colors.icon,
    fontWeight: "700",
  },

  profileCard: {
    alignItems: "center",
    paddingVertical: 20,
    borderRadius: 20,
    backgroundColor: Colors.card,
    marginBottom: 16,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    color: Colors.text,
    fontWeight: "700",
  },
  email: {
    fontSize: 13,
    color: Colors.subtext,
    marginTop: 2,
  },

  card: {
    borderRadius: 20,
    backgroundColor: Colors.card,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sectionTitle: {
    fontSize: 13,
    color: Colors.subtext,
    marginBottom: 8,
    fontWeight: "600",
  },

  themeToggle: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  themeToggleText: {
    fontWeight: "700",
  },
  helper: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.subtext,
    textAlign: "center",
  },

  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  container: { paddingBottom: 32 },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  pressed: { opacity: 0.9 },
  icon: {
    width: 28,
    textAlign: "center",
    marginRight: 10,
    fontSize: 16,
  },
  label: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    fontWeight: "600",
  },
  chevron: {
    fontSize: 26,
    color: Colors.icon,
    marginLeft: 8,
    opacity: 0.5,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
    marginLeft: 46,
  },
});
