import { useUserContext } from "@/context/authContext";
import { checkMoodBadges, checkQuestionnaireBadges, fetchAllBadges } from "@/lib/log_crud";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";

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

  type BadgeType = "mood" | "questionnaire";
  type BadgeLevel = "beginner" | "mid" | "advanced";

  function BadgeIcon({ type, level }: { type: BadgeType; level: BadgeLevel }) {
    const icons: Record<BadgeType, Record<BadgeLevel, any>> = {
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
    return <Image source={icons[type][level]} style={{ width: 60, height: 60 }} />;
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#555" />
        <Text>Loading badges...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={badges}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 20 }}
      ListEmptyComponent={
        <Text style={{ textAlign: "center", marginTop: 40 }}>No badges earned yet</Text>
      }
      renderItem={({ item }) => (
        <View style={{ alignItems: "center", margin: 10 }}>
          <BadgeIcon type={item.badge_type} level={item.level} />
          <Text>
            {item.badge_type} – {item.level}
          </Text>
        </View>
      )}
    />
  );
}
