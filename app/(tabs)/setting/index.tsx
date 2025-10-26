// app/(tabs)/settings.tsx  or  app/settings.tsx
import { avatarMap, defaultAvatar } from "@/constants/avatars";
import { useUserContext } from "@/context/authContext";
import Ionicons from "@expo/vector-icons/Ionicons";
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
  bg: "#F9F9FB",
  card: "#FFFFFF",
  text: "#1D1D1F",
  sub: "#6B7280",
  border: "rgba(0,0,0,0.06)",
  // brand accents
  mint: "#ACD1C9",
  peach: "#F4CA90",
  salmon: "#F49790",
  vanilla: "#FCFAE1",
  divider: "rgba(0,0,0,0.08)",
};

export default function SettingsScreen() {
  const { profile } = useUserContext();
  const router = useRouter();

  const [imageError, setImageError] = React.useState(false);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.screen}>
        <View style={[styles.profileCard, styles.shadow]}>
          <Image
            source={avatarMap[profile?.icon_name || ""] || defaultAvatar}
            style={styles.avatar}
            onError={() => setImageError(true)}
          />
          <Text style={styles.name}>
            {profile?.first_name} {profile?.last_name}
          </Text>
          <Text style={styles.email}>{profile?.email}</Text>
        </View>

        <View style={[styles.card, styles.shadow]}>
          <SectionRow
            chipBg="#EAF6F2"
            iconColor={Colors.mint}
            icon="person-circle"
            label="Personal info"
            onPress={() => router.push("/setting/PersonalInfo")}
          />
          <SectionRow
            chipBg="#FFF7E9"
            iconColor={Colors.peach}
            icon="trophy"
            label="My Badges"
            onPress={() => router.push("/setting/Badges")}
          />
        </View>

        <View style={[styles.card, styles.shadow]}>
          <SectionRow
            chipBg="#FFF7E9"
            iconColor={Colors.peach}
            icon="key"
            label="Password and security"
            onPress={() => router.push("/setting/PasswordAndSecurity")}
          />
          <Divider />
          {/* <SectionRow
            chipBg="#FFF3F1"
            iconColor={Colors.salmon}
            icon="apps"
            label="App and services"
            onPress={() => router.push("/")}
          /> */}
          <Divider />
          <SectionRow
            chipBg="#EAF6F2"
            iconColor={Colors.mint}
            icon="shield-checkmark"
            label="Privacy"
            onPress={() => router.push("/setting/Privacy")}
          />
          {/* <SectionRow
            chipBg="#FCFAE1"
            iconColor={Colors.peach}
            icon="phone-portrait"
            label="Devices"
            onPress={() => router.push("/")}
          /> */}
        </View>

        <View style={[styles.card, styles.shadow]}>
          <SectionRow
            chipBg="#FFF7E9"
            iconColor={Colors.peach}
            icon="notifications"
            label="Notifications"
            onPress={() => router.push("/setting/Notification")}
          />
          <Divider />
          <SectionRow
            chipBg="#FFF3F1"
            iconColor={Colors.salmon}
            icon="help-circle"
            label="Help"
            onPress={() => router.push("/setting/Help")}
          />
          <Divider />
          <SectionRow
            chipBg="#EAF6F2"
            iconColor={Colors.mint}
            icon="information-circle"
            label="About"
            onPress={() => router.push("/setting/About")}
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
  chipBg,
  iconColor,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
  chipBg: string;
  iconColor: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [rowStyles.row, pressed && rowStyles.pressed]}
    >
      <View style={[rowStyles.iconChip, { backgroundColor: chipBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={rowStyles.label}>{label}</Text>
      <Ionicons name="chevron-forward" size={22} color="rgba(0,0,0,0.35)" />
    </Pressable>
  );
}

function Divider() {
  return <View style={rowStyles.divider} />;
}

const styles = StyleSheet.create({
  container: { paddingBottom: 32 },
  screen: { flex: 1, padding: 16, backgroundColor: Colors.bg },

  profileCard: {
    alignItems: "center",
    paddingVertical: 22,
    borderRadius: 20,
    backgroundColor: Colors.card,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: { width: 104, height: 104, borderRadius: 52, marginBottom: 10 },
  name: {
    fontSize: 20,
    color: Colors.text,
    fontWeight: "700",
    fontFamily: "Noto Sans HK",
  },
  email: {
    fontSize: 13,
    color: Colors.sub,
    marginTop: 2,
    fontFamily: "Noto Sans HK",
  },

  card: {
    borderRadius: 20,
    backgroundColor: Colors.card,
    marginBottom: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  pressed: { opacity: 0.95 },
  iconChip: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  label: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    fontWeight: "600",
    fontFamily: "Noto Sans HK",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
    marginLeft: 48,
  },
});
