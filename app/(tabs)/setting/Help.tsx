// app/(tabs)/setting/Help.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import {
  Alert,
  Dimensions,
  Linking,
  Platform,
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

export default function HelpScreen() {
  const maxWidth = Math.min(Dimensions.get("window").width - 32, 560);

  const openUrl = async (url: string) => {
    const can = await Linking.canOpenURL(url);
    if (!can) {
      Alert.alert("Cannot open", url);
      return;
    }
    return Linking.openURL(url);
  };

  const email = "support@example.com";
  const subject = encodeURIComponent("MindLog — Support");
  const body = encodeURIComponent("Describe the issue or question here…");
  const mailto = `mailto:${email}?subject=${subject}&body=${body}`;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.titleWrap, { maxWidth }]}>
        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.subTitle}>
          Find quick answers or contact support.
        </Text>
      </View>

      {/* Quick help */}
      <View style={[styles.card, styles.shadow, { width: "100%", maxWidth }]}>
        <Row
          icon="help-circle-outline"
          title="FAQs"
          subtitle="Common questions about accounts, privacy, and data."
          onPress={() => openUrl("https://example.com/help/faq")}
        />
        <Divider />
        <Row
          icon="newspaper-outline"
          title="Guides"
          subtitle="Step‑by‑step guides for mood logging and diary."
          onPress={() => openUrl("https://example.com/help/guides")}
        />
      </View>

      {/* Contact */}
      <View style={[styles.card, styles.shadow, { width: "100%", maxWidth }]}>
        <Row
          icon="mail-outline"
          title="Email support"
          subtitle={email}
          onPress={() => openUrl(mailto)}
        />
        <Divider />
        <Row
          icon="chatbubbles-outline"
          title="Community"
          subtitle="Ask and share tips with others."
          onPress={() => openUrl("https://example.com/community")}
        />
      </View>

      {/* Device & app settings */}
      <View style={[styles.card, styles.shadow, { width: "100%", maxWidth }]}>
        <Row
          icon="settings-outline"
          title="Open app settings"
          subtitle="Manage permissions like notifications or location."
          onPress={() => {
            if (Linking.openSettings) Linking.openSettings();
            else
              openUrl(
                Platform.OS === "ios" ? "app-settings:" : "package:your.app.id"
              );
          }}
        />
        <Divider />
        <Row
          icon="shield-checkmark-outline"
          title="Privacy Policy"
          subtitle="How data is collected and used."
          onPress={() => openUrl("https://example.com/privacy")}
        />
        <Divider />
        <Row
          icon="document-text-outline"
          title="Terms of Service"
          subtitle="Legal terms for using the app."
          onPress={() => openUrl("https://example.com/terms")}
        />
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
  titleWrap: { width: "100%" },
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

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
    marginVertical: 8,
    marginLeft: 40,
  },
});
