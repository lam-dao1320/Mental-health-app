// app/(tabs)/setting/About.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Application from "expo-application";
import React from "react";
import {
  Dimensions,
  Image,
  Linking,
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
  mint: "#ACD1C9",
  divider: "rgba(0,0,0,0.08)",
};

export default function AboutScreen() {
  const maxWidth = Math.min(Dimensions.get("window").width - 32, 560);

  const appName = Application.applicationName ?? "MindLog";
  const version = Application.nativeApplicationVersion ?? "1.0.0";
  const build = Application.nativeBuildVersion ?? "1";
  // Cross‑platform app id/bundle id (don’t use androidId on iOS)
  const bundleId = Application.applicationId ?? "com.example.mindlog";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* App identity */}
      <View
        style={[
          styles.card,
          styles.shadow,
          { width: "100%", maxWidth, alignItems: "center" },
        ]}
      >
        <Image
          source={require("@/assets/images/mindLog_icon.png")}
          style={{ width: 72, height: 72, borderRadius: 16, marginBottom: 10 }}
        />
        <Text style={styles.title}>{appName}</Text>
        <Text style={styles.subTitle}>
          Version {version} · Build {build}
        </Text>
        <Text style={styles.subtle}>{bundleId}</Text>
      </View>

      {/* Links */}
      <View style={[styles.card, styles.shadow, { width: "100%", maxWidth }]}>
        <Row
          icon="globe-outline"
          title="Website"
          subtitle="mindlog.example.com"
          onPress={() => Linking.openURL("https://example.com")}
        />
        <Divider />
        <Row
          icon="shield-checkmark-outline"
          title="Privacy Policy"
          subtitle="How data is collected and used"
          onPress={() => Linking.openURL("https://example.com/privacy")}
        />
        <Divider />
        <Row
          icon="document-text-outline"
          title="Terms of Service"
          subtitle="Legal terms for using the app"
          onPress={() => Linking.openURL("https://example.com/terms")}
        />
        <Divider />
        <Row
          icon="code-slash-outline"
          title="Open source licenses"
          subtitle="Third‑party packages and licenses"
          onPress={() => Linking.openURL("https://example.com/licenses")}
        />
      </View>

      {/* Credits */}
      <View style={[styles.card, styles.shadow, { width: "100%", maxWidth }]}>
        <Text style={styles.sectionTitle}>Credits</Text>
        <Text style={styles.body}>
          Built with Expo, React Native, and Expo Router. Icons by Ionicons.
          Fonts by Noto Sans.
        </Text>
      </View>
    </ScrollView>
  );
}

function Row({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.95 }]}
    >
      <View style={styles.iconChip}>
        <Ionicons name={icon} size={18} color={Colors.mint} />
      </View>
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={22} color="rgba(0,0,0,0.35)" />
    </Pressable>
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
  card: {
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
    fontFamily: "Noto Sans HK",
  },
  subTitle: {
    fontSize: 13,
    color: Colors.sub,
    textAlign: "center",
    marginTop: 4,
    fontFamily: "Noto Sans HK",
  },
  subtle: {
    fontSize: 12,
    color: Colors.sub,
    textAlign: "center",
    marginTop: 4,
    fontFamily: "Noto Sans HK",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  iconChip: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EAF6F2",
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 2,
    fontFamily: "Noto Sans HK",
  },
  rowSubtitle: {
    fontSize: 13,
    color: Colors.sub,
    fontFamily: "Noto Sans HK",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 6,
    fontFamily: "Noto Sans HK",
  },
  body: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: "Noto Sans HK",
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
    marginVertical: 8,
    marginLeft: 40,
  },
});
