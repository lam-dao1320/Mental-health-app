import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
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

export default function NotificationsScreen() {
  const maxWidth = Math.min(Dimensions.get("window").width - 32, 560);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [quietHours, setQuietHours] = useState({
    start: "22:00",
    end: "07:00",
  });
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [permGranted, setPermGranted] = useState<boolean | null>(null);

  const GRAY = "rgba(0,0,0,0.28)";
  const MINT = "#ACD1C9";
  const MINT_MED = "rgba(172, 209, 201, 0.75)";

  async function refreshPermissions() {
    const st = await Notifications.getPermissionsAsync();
    const allowed =
      st.granted ||
      st.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
    setPermGranted(Boolean(allowed));
  }

  async function requestPermissions() {
    const st = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    });
    const allowed =
      st.granted ||
      st.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
    setPermGranted(Boolean(allowed));
  }

  async function scheduleDailyReminder(selectedTime: Date) {
    try {
      const trigger = new Date(selectedTime);
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Daily check-in",
          body: "Log today’s mood and a few lines in the diary.",
          sound: soundsEnabled ? "default" : undefined,
        },
        trigger: {
          hour: trigger.getHours(),
          minute: trigger.getMinutes(),
          repeats: true,
        },
      });
    } catch (e) {
      console.warn("Failed to schedule:", e);
    }
  }

  useEffect(() => {
    refreshPermissions();
  }, []);

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setReminderTime(selectedTime);
      scheduleDailyReminder(selectedTime);
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.titleWrap, { maxWidth }]}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subTitle}>
          Manage push alerts, reminders, quiet hours, and sounds.
        </Text>
        <Text style={styles.perm}>
          Permission:{" "}
          {permGranted === null ? "…" : permGranted ? "Allowed" : "Not allowed"}
        </Text>
      </View>

      {/* Permissions */}
      <View style={[styles.card, styles.shadow, { width: "100%", maxWidth }]}>
        <View style={styles.row}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.rowTitle}>Allow push notifications</Text>
            <Text style={styles.rowSubtitle}>
              Enable app alerts for reminders and important updates.
            </Text>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: GRAY, true: MINT }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={GRAY}
          />
        </View>

        <View style={styles.btnRow}>
          <Pressable style={styles.ghostBtn} onPress={requestPermissions}>
            <Ionicons name="hand-left-outline" size={18} color={Colors.text} />
            <Text style={styles.ghostText}>Request permission</Text>
          </Pressable>
          <Pressable style={styles.ghostBtn} onPress={refreshPermissions}>
            <Ionicons name="refresh-outline" size={18} color={Colors.text} />
            <Text style={styles.ghostText}>Check status</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() =>
            Linking.openSettings
              ? Linking.openSettings()
              : Linking.openURL(
                  Platform.OS === "ios"
                    ? "app-settings:"
                    : "package:your.app.id"
                )
          }
          hitSlop={8}
          style={{ marginTop: 10, alignSelf: "center" }}
        >
          <Text style={styles.linkText}>Open device settings</Text>
        </Pressable>
      </View>

      {/* Reminders */}
      <View style={[styles.card, styles.shadow, { width: "100%", maxWidth }]}>
        <View style={styles.row}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.rowTitle}>Daily reminders</Text>
            <Text style={styles.rowSubtitle}>
              Nudges to log mood and diary entries.
            </Text>
          </View>
          <Switch
            value={remindersEnabled}
            onValueChange={(v) => {
              setRemindersEnabled(v);
              if (v) scheduleDailyReminder(reminderTime);
            }}
            trackColor={{ false: GRAY, true: MINT_MED }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={GRAY}
          />
        </View>

        <View style={styles.subRow}>
          <Text style={styles.rowSubtitle}>
            Reminder time: {formatTime(reminderTime)}
          </Text>

          {/* Change time button styled same as ghostBtn */}
          <View style={styles.btnRow}>
            <Pressable
              style={({ pressed }) => [
                styles.ghostBtn,
                pressed && { opacity: 0.95 },
              ]}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={18} color={Colors.text} />
              <Text style={styles.ghostText}>Change time</Text>
            </Pressable>
          </View>

          {showTimePicker && (
            <DateTimePicker
              value={reminderTime}
              mode="time"
              display="spinner"
              onChange={handleTimeChange}
            />
          )}
        </View>
      </View>
      {/* Sounds */}
      <View style={[styles.card, styles.shadow, { width: "100%", maxWidth }]}>
        <View style={styles.row}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.rowTitle}>Sounds</Text>
            <Text style={styles.rowSubtitle}>
              Play a sound with notifications.
            </Text>
          </View>
          <Switch
            value={soundsEnabled}
            onValueChange={setSoundsEnabled}
            trackColor={{ false: GRAY, true: MINT_MED }}
            thumbColor="#FFFFFF"
            ios_backgroundColor={GRAY}
          />
        </View>
      </View>
    </ScrollView>
  );
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
  perm: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.sub,
    textAlign: "center",
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
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  subRow: { marginTop: 8 },
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
    gap: 6,
    flexDirection: "row",
    justifyContent: "center",
  },
  ghostText: {
    color: Colors.text,
    fontWeight: "700",
    fontFamily: "Noto Sans HK",
  },
  timeBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  linkText: {
    color: Colors.sub,
    textDecorationLine: "underline",
    fontFamily: "Noto Sans HK",
  },
});
