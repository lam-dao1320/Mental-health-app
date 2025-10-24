import { useUserContext } from "@/context/authContext";
import { checkMoodBadges, checkQuestionnaireBadges, fetchAllBadges } from "@/lib/log_crud";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";

const Colors = {
  bg: "#F9F9FB",
  card: "#FFFFFF",
  text: "#1D1D1F",
  sub: "#6B7280",
  border: "rgba(0,0,0,0.06)",
  mint: "#ACD1C9",
  divider: "rgba(0,0,0,0.08)",
  gray: "#D1D5DB", // 🆕 Added gray color for disabled badges
};

export default function BadgesPage() {
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useUserContext();

  useEffect(() => {
    if (!profile?.email) return;

    const email = profile?.email;

    async function loadBadges() {
      setLoading(true);

      await checkMoodBadges(email);
      await checkQuestionnaireBadges(email);

      const data = await fetchAllBadges(email);
      setBadges(data || []);

      setLoading(false);
    }

    loadBadges();
  }, [profile?.email]);

  // 🆕 Helper function to check if a user owns a specific badge
  const hasBadge = (type: string, level: string) =>
    badges.some((b) => b.badge_type === type && b.level === level);

  type BadgeType = "mood" | "questionnaire";
  type BadgeLevel = "beginner" | "mid" | "advanced";

  // 🆕 Moved icons into one centralized object
  const badgeIcons: Record<BadgeType, Record<BadgeLevel, any>> = {
    mood: {
      beginner: require("@/assets/images/mood/beginner.png"),
      mid: require("@/assets/images/mindLog_icon.png"),
      advanced: require("@/assets/images/mindLog_icon.png"),
    },
    questionnaire: {
      beginner: require("@/assets/images/mindLog_icon.png"),
      mid: require("@/assets/images/mindLog_icon.png"),
      advanced: require("@/assets/images/mindLog_icon.png"),
    },
  };

  // 🆕 User-friendly labels for each badge level
  const badgeLabels: Record<BadgeLevel, string> = {
    beginner: "First Log",
    mid: "1-Week Streak",
    advanced: "30-Day Streak",
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#555" />
        <Text>Loading badges...</Text>
      </View>
    );
  }

  // 🆕 Reusable section renderer (used for Mood + Questionnaire)
  const renderBadgeRow = (type: BadgeType, title: string, description: string) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDesc}>{description}</Text>

      {/* 🆕 New layout for badges — always show all 3, dim if not earned */}
      <View style={styles.badgeRow}>
        {(["beginner", "mid", "advanced"] as BadgeLevel[]).map((level) => {
          const earned = hasBadge(type, level);
          return (
            <View key={`${type}-${level}`} style={styles.badgeContainer}>
              <Image
                source={badgeIcons[type][level]}
                style={[
                  styles.badgeImage,
                  !earned && { opacity: 0.3, tintColor: Colors.gray }, // 🆕 Disabled style
                ]}
              />
              <Text
                style={[
                  styles.badgeLabel,
                  !earned && { color: Colors.sub }, // 🆕 Gray label when not earned
                ]}
              >
                {badgeLabels[level]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    // 🆕 ScrollView instead of FlatList, vertical stacking for two sections
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Badges 🏅</Text>

      {/* 🆕 Section 1 – Mood badges */}
      {renderBadgeRow(
        "mood",
        "Mood Tracker Badges",
        "Earn badges for consistently logging your moods!"
      )}

      {/* 🆕 Divider between sections */}
      <View style={styles.divider} />

      {/* 🆕 Section 2 – Questionnaire badges */}
      {renderBadgeRow(
        "questionnaire",
        "Questionnaire Badges",
        "Track your growth through daily reflections!"
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // 🆕 Updated layout & styling for the new card-style sections
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    padding: 16,
    paddingVertical: 32,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 24,
    fontFamily: "Noto Sans HK",
    marginTop: 6,
    paddingTop: 10,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 6,
    fontFamily: "Noto Sans HK",
  },
  sectionDesc: {
    fontSize: 14,
    color: Colors.sub,
    marginBottom: 16,
    fontFamily: "Noto Sans HK",
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  badgeContainer: {
    alignItems: "center",
  },
  badgeImage: {
    width: 70,
    height: 70,
    marginBottom: 8,
  },
  badgeLabel: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: "Noto Sans HK",
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 8,
  },
});