// app/(tabs)/setting/Privacy.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
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
  danger: "#DC2626",
};

export default function PrivacyScreen() {
  const router = useRouter();
  const maxWidth = Math.min(Dimensions.get("window").width - 32, 560);

  // Mock toggles
  const [shareUsage, setShareUsage] = useState(true);
  const [personalized, setPersonalized] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [preciseLocation, setPreciseLocation] = useState(false);

  const GRAY = "rgba(0,0,0,0.28)";
  const MINT = "#ACD1C9"; // active track color
  const MINT_MED = "rgba(172, 209, 201, 0.75)";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.titleWrap, { maxWidth }]}>
        <Text style={styles.title}>Privacy</Text>
        <Text style={styles.subTitle}>
          Control how data is used for features like suggestions and analytics.
        </Text>
      </View>

      {/* Data sharing */}
      <View style={[styles.card, styles.shadow, { width: "100%", maxWidth }]}>
        <Row
          title="Share anonymized usage"
          subtitle="Help improve reliability by sending crash and performance data."
          value={shareUsage}
          onChange={setShareUsage}
          track={{ false: GRAY, true: MINT_MED }}
          iosBg={GRAY}
        />

        <Divider />

        <Row
          title="Personalized suggestions"
          subtitle="Use activity to tailor suggestions like tips or reminders."
          value={personalized}
          onChange={setPersonalized}
          track={{ false: GRAY, true: MINT }}
          iosBg={GRAY}
        />

        <Divider />

        <Row
          title="Analytics"
          subtitle="Collect aggregate analytics about feature usage."
          value={analytics}
          onChange={setAnalytics}
          track={{ false: GRAY, true: MINT_MED }}
          iosBg={GRAY}
        />
      </View>

      {/* Location */}
      <View style={[styles.card, styles.shadow, { width: "100%", maxWidth }]}>
        <Row
          title="Precise location"
          subtitle="Use precise GPS for features that need exact position; otherwise approximate location is used."
          value={preciseLocation}
          onChange={setPreciseLocation}
          track={{ false: GRAY, true: MINT_MED }}
          iosBg={GRAY}
        />
        <Text style={styles.note}>
          Location access is also controlled by the device’s Settings.
          Permissions like camera, mic, and location can be reviewed there at
          any time.
        </Text>
      </View>

      {/* Data controls */}
      <View style={[styles.card, styles.shadow, { width: "100%", maxWidth }]}>
        <Text style={styles.sectionTitle}>Data controls</Text>
        <View style={styles.btnRow}>
          <Pressable
            style={({ pressed }) => [
              styles.ghostBtn,
              pressed && { opacity: 0.95 },
            ]}
            onPress={() => {}}
          >
            <Ionicons name="download-outline" size={18} color={Colors.text} />
            <Text style={styles.ghostText}>Download data</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.ghostBtn,
              pressed && { opacity: 0.95 },
            ]}
            onPress={() => {}}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.text} />
            <Text style={styles.ghostText}>Delete account</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => Linking.openURL("https://example.com/privacy")}
          hitSlop={8}
          style={{ marginTop: 10, alignSelf: "center" }}
        >
          <Text style={styles.linkText}>View Privacy Policy</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Row({
  title,
  subtitle,
  value,
  onChange,
  track,
  iosBg,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (v: boolean) => void;
  track: { false: string; true: string };
  iosBg: string;
}) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <View pointerEvents="box-none">
        <SwitchLike
          value={value}
          onChange={onChange}
          track={track}
          iosBg={iosBg}
        />
      </View>
    </View>
  );
}

function SwitchLike({
  value,
  onChange,
  track,
  iosBg,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  track: { false: string; true: string };
  iosBg: string;
}) {
  return (
    <View>
      {/* Inline import to avoid clutter at top-level: */}
      {React.createElement(require("react-native").Switch, {
        value,
        onValueChange: onChange,
        trackColor: track,
        thumbColor: "#FFFFFF",
        ios_backgroundColor: iosBg,
      })}
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
  subTitle: {
    fontSize: 13,
    color: Colors.sub,
    textAlign: "center",
    marginTop: 4,
    fontFamily: "Noto Sans HK",
  },
  note: {
    fontSize: 12,
    color: Colors.sub,
    marginTop: 8,
    fontFamily: "Noto Sans HK",
    textAlign: "left",
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
    marginBottom: 8,
    fontFamily: "Noto Sans HK",
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
  },
  ghostBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    gap: 6,
    flexDirection: "row",
    justifyContent: "center",
  },
  ghostText: {
    color: Colors.text,
    fontWeight: "700",
    fontFamily: "Noto Sans HK",
  },
  linkText: {
    color: Colors.sub,
    textDecorationLine: "underline",
    fontFamily: "Noto Sans HK",
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
    marginVertical: 10,
  },
});
