import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import {
  Dimensions,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";

const Colors = {
  bg: "#F9F9FB",
  card: "#FFFFFF",
  text: "#1D1D1F",
  sub: "#6B7280",
  border: "rgba(0,0,0,0.06)",
  divider: "rgba(0,0,0,0.08)",
  mint: "#ACD1C9",
  yellow: "#F4CA90",
  pink: "#F49790",
  blue: "#84B4FF",
  purple: "#BCAEF2",
  gray: "#A3A3A3",
};

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HelpScreen() {
  const maxWidth = Math.min(Dimensions.get("window").width - 32, 560);
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleSection = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(expanded === key ? null : key);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.titleWrap, { maxWidth }]}>
        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.subTitle}>
          Tap a section to learn more or view details.
        </Text>
      </View>

      {/* Quick help */}
      <View style={[styles.card, styles.shadow, { width: "100%", maxWidth }]}>
        <Row
          icon="help-circle-outline"
          iconColor={Colors.mint}
          title="FAQs"
          subtitle="Common questions about accounts, privacy, and data."
          expanded={expanded === "faq"}
          onPress={() => toggleSection("faq")}
        />
        {expanded === "faq" && (
          <View
            style={[
              styles.expandArea,
              { backgroundColor: "#F5FBFA" }, // lighter mint
            ]}
          >
            <Text style={[styles.expandText, { color: "#2E554F" }]}>
              • How do I log my mood?{"\n"}Go to the Home tab and tap “Log
              Mood.”
              {"\n\n"}• Is my data private?{"\n"}Yes. MindLog stores your
              entries securely in your account only.{"\n\n"}• Can I edit an
              entry?{"\n"}Yes. Go to History, tap the entry, and update your
              notes.
            </Text>
          </View>
        )}

        <Divider />

        <Row
          icon="newspaper-outline"
          iconColor={Colors.yellow}
          title="Guides"
          subtitle="Step-by-step guides for mood logging and diary."
          expanded={expanded === "guides"}
          onPress={() => toggleSection("guides")}
        />
        {expanded === "guides" && (
          <View
            style={[
              styles.expandArea,
              { backgroundColor: "#FFFDF6" }, // lighter yellow
            ]}
          >
            <Text style={[styles.expandText, { color: "#6B4E1E" }]}>
              1. Tap “Log Mood” to record how you feel.{"\n"}2. Add a short
              diary entry to reflect.{"\n"}3. Use “AI Suggestions” for
              personalized content.{"\n"}4. Check “History” for weekly mood
              reports.
            </Text>
          </View>
        )}
      </View>

      {/* Contact */}
      <View style={[styles.card, styles.shadow, { width: "100%", maxWidth }]}>
        <Row
          icon="mail-outline"
          iconColor={Colors.pink}
          title="Email Support"
          subtitle="support@mindlog.app"
          expanded={expanded === "email"}
          onPress={() => toggleSection("email")}
        />
        {expanded === "email" && (
          <View
            style={[
              styles.expandArea,
              { backgroundColor: "#FFF8F9" }, // lighter pink
            ]}
          >
            <Text style={[styles.expandText, { color: "#703539" }]}>
              If you encounter issues, email us at{" "}
              <Text style={{ fontWeight: "700" }}>support@mindlog.app</Text>.
              {"\n"}We typically respond within 24 hours.
            </Text>
          </View>
        )}

        <Divider />

        <Row
          icon="chatbubbles-outline"
          iconColor={Colors.blue}
          title="Community"
          subtitle="Ask and share tips with others."
          expanded={expanded === "community"}
          onPress={() => toggleSection("community")}
        />
        {expanded === "community" && (
          <View
            style={[
              styles.expandArea,
              { backgroundColor: "#F6FAFF" }, // lighter blue
            ]}
          >
            <Text style={[styles.expandText, { color: "#263C6D" }]}>
              Join the MindLog community to discuss self-care, journaling, and
              tips from other users. {"\n"}Community features are coming soon in
              the next update.
            </Text>
          </View>
        )}
      </View>

      {/* Device & app settings */}
      <View style={[styles.card, styles.shadow, { width: "100%", maxWidth }]}>
        <Row
          icon="settings-outline"
          iconColor={Colors.purple}
          title="App Settings"
          subtitle="Manage permissions like notifications or location."
          expanded={expanded === "settings"}
          onPress={() => toggleSection("settings")}
        />
        {expanded === "settings" && (
          <View
            style={[
              styles.expandArea,
              { backgroundColor: "#F9F8FF" }, // lighter purple
            ]}
          >
            <Text style={[styles.expandText, { color: "#4B3E73" }]}>
              To adjust notifications or data preferences, open Settings → App →
              Permissions. {"\n"}You can control notification time and sound
              options there.
            </Text>
          </View>
        )}

        <Divider />

        <Row
          icon="shield-checkmark-outline"
          iconColor={Colors.mint}
          title="Privacy Policy"
          subtitle="How data is collected and used."
          expanded={expanded === "privacy"}
          onPress={() => toggleSection("privacy")}
        />
        {expanded === "privacy" && (
          <View
            style={[
              styles.expandArea,
              { backgroundColor: "#F5FBFA" }, // lighter mint
            ]}
          >
            <Text style={[styles.expandText, { color: "#2E554F" }]}>
              We collect only the data you log for personal reflection. {"\n"}
              No ads. No third-party sharing. {"\n"}You can delete all records
              anytime from Settings → Privacy.
            </Text>
          </View>
        )}

        <Divider />

        <Row
          icon="document-text-outline"
          iconColor={Colors.gray}
          title="Terms of Service"
          subtitle="Legal terms for using the app."
          expanded={expanded === "terms"}
          onPress={() => toggleSection("terms")}
        />
        {expanded === "terms" && (
          <View
            style={[
              styles.expandArea,
              { backgroundColor: "#F9FAFB" }, // lighter neutral gray
            ]}
          >
            <Text style={[styles.expandText, { color: "#374151" }]}>
              Using MindLog means agreeing to our commitment to a safe and
              respectful environment. {"\n"}You can review full terms anytime in
              the app’s Settings page.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function Row({
  icon,
  iconColor,
  title,
  subtitle,
  onPress,
  expanded,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconColor: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  expanded?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.9 }]}
    >
      <View style={[styles.iconChip, { backgroundColor: `${iconColor}25` }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons
        name={expanded ? "chevron-up" : "chevron-down"}
        size={22}
        color="rgba(0,0,0,0.35)"
      />
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
  expandArea: {
    borderRadius: 10,
    marginTop: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  expandText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Noto Sans HK",
  },
});
