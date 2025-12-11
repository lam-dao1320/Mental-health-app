import { useUserContext } from "@/context/authContext";
import {
  checkMoodBadges,
  checkQuestionnaireBadges,
  fetchAllBadges,
} from "@/lib/log_crud";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
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
  overlay: "rgba(255,255,255,0.6)",
  gray: "#D1D5DB",
};

export default function BadgesPage() {
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useUserContext();

  useEffect(() => {
    if (!profile?.email) return;

    const email = profile.email;

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

  const hasBadge = (type: string, level: string) =>
    badges.some((b) => b.badge_type === type && b.level === level);

  type BadgeType = "mood" | "questionnaire";
  type BadgeLevel = "beginner" | "mid" | "advanced";

  const badgeIcons: Record<BadgeType, Record<BadgeLevel, any>> = {
    mood: {
      beginner: require("@/assets/images/mood/beginner.png"),
      mid: require("@/assets/images/mood/mid.png"),
      advanced: require("@/assets/images/mood/advanced.png"),
    },
    questionnaire: {
      beginner: require("@/assets/images/questionnaire/beginner.png"),
      mid: require("@/assets/images/questionnaire/mid.png"),
      advanced: require("@/assets/images/questionnaire/advanced.png"),
    },
  };

  const badgeLabels: Record<BadgeLevel, string> = {
    beginner: "First Log",
    mid: "1-Week Streak",
    advanced: "30-Day Streak",
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#555" />
        <Text>Loading badges...</Text>
      </View>
    );
  }

  const renderBadgeRow = (
    type: BadgeType,
    title: string,
    description: string
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDesc}>{description}</Text>

      <View style={styles.badgeRow}>
        {(["beginner", "mid", "advanced"] as BadgeLevel[]).map((level) => {
          const earned = hasBadge(type, level);

          return (
            <View key={`${type}-${level}`} style={styles.badgeContainer}>
              <View style={styles.badgeWrapper}>
                <Image
                  source={badgeIcons[type][level]}
                  style={[styles.badgeImage, !earned && { opacity: 0.5 }]}
                />
                {!earned && (
                  <View style={styles.grayOverlay} pointerEvents="none" />
                )}
              </View>

              <Text
                style={[styles.badgeLabel, !earned && { color: Colors.sub }]}
              >
                {badgeLabels[level]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderOneTimeSection = () => {
    // --- Logic to check status ---
    // 1. First Login: If they are on this page, they are logged in.
    const hasLogin = true;

    // 2. First Mood: We check if they have the 'beginner' mood badge (which is "First Log")
    const hasMoodEntry = hasBadge("mood", "beginner");

    // 3. First Badge: If the badges array has any length, they have earned at least one badge.
    const hasAnyBadge = badges.length > 0;

    // 4. First Diary: Check if a 'diary' type badge exists in the DB response
    // (Make sure your backend saves this badge type when they edit a diary!)
    const hasDiaryEntry = badges.some((b) => b.badge_type === "diary");

    // 5. Define the 12 Tasks
    const oneTimeTasks = [
      // --- Row 1: Flowers ---
      {
        label: "First Login",
        icon: require("@/assets/images/otherBadge/flower/1.png"),
        earned: hasLogin,
      },
      {
        label: "First Mood Entry",
        icon: require("@/assets/images/otherBadge/flower/2.png"),
        earned: hasMoodEntry,
      },
      {
        label: "First Suggestion",
        icon: require("@/assets/images/otherBadge/flower/3.png"),
        earned: false, // TODO: Add logic
      },
      {
        label: "First Diary Edit",
        icon: require("@/assets/images/otherBadge/flower/4.png"),
        earned: hasDiaryEntry,
      },
      {
        label: "First Download",
        icon: require("@/assets/images/otherBadge/flower/5.png"),
        earned: false, // TODO: Add logic
      },
      {
        label: "First Badge",
        // Note: .jpg for nature folder
        icon: require("@/assets/images/otherBadge/nature/1.png"),
        earned: hasAnyBadge,
      },

      // --- Row 2: Nature & Placeholders ---
      {
        label: "3-Day Streak",
        // Using unused Nature 2
        icon: require("@/assets/images/otherBadge/nature/2.png"),
        earned: false,
      },
      {
        label: "Weekly Review",
        // Using unused Nature 3
        icon: require("@/assets/images/otherBadge/nature/3.png"),
        earned: false,
      },
      // --- Tasks with NO images (Grey Circles) ---
      { label: "Monthly Goal", icon: null, earned: false },
      { label: "Perfect Month", icon: null, earned: false },
      { label: "Year in Review", icon: null, earned: false },
      { label: "Social Share", icon: null, earned: false },
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>One-Time Tasks</Text>
        <Text style={styles.sectionDesc}>
          Preview of unique achievements. These will unlock as you use the app.
        </Text>

        <View style={styles.badgeRow}>
          {oneTimeTasks.map((task, index) => (
            <View key={index} style={styles.badgeContainer}>
              {/* If icon exists, render Image. If null, render Grey Circle */}
              {task.icon ? (
                <View style={styles.badgeWrapper}>
                  <Image
                    source={task.icon}
                    style={[
                      styles.badgeImage,
                      !task.earned && { opacity: 0.5 },
                    ]}
                  />
                  {!task.earned && (
                    <View style={styles.grayOverlay} pointerEvents="none" />
                  )}
                </View>
              ) : (
                // The Grey Circle Placeholder
                <View style={styles.circlePlaceholder} />
              )}

              <Text
                style={[
                  styles.badgeLabel,
                  !task.earned && { color: Colors.sub },
                ]}
              >
                {task.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <Text style={styles.title}>Your Badges</Text>
      {renderBadgeRow(
        "mood",
        "Mood Tracker Badges",
        "Earn badges for consistently logging your moods!"
      )}
      <View style={styles.divider} />
      {renderBadgeRow(
        "questionnaire",
        "Questionnaire Badges",
        "Track your growth through daily reflections!"
      )}
      <View style={styles.divider} />
      {renderOneTimeSection()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
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
    flexWrap: "wrap",
    justifyContent: "space-around",
    rowGap: 18,
  },
  badgeContainer: {
    alignItems: "center",
    width: 90,
  },
  badgeWrapper: {
    position: "relative",
    width: 70,
    height: 70,
  },
  badgeImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  grayOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
    borderRadius: 8,
  },
  badgeLabel: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: "Noto Sans HK",
    textAlign: "center",
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 15,
  },
  circlePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 6,
    backgroundColor: Colors.gray,
  },
});
