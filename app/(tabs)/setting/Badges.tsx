import { useUserContext } from "@/context/authContext"; // to get logged-in user
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";

export default function BadgesPage() {
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useUserContext(); // assumes you have profile?.email available

  useEffect(() => {
    if (!profile?.email) return; // guard against undefined

    const email = profile.email; // now TypeScript knows it's a string

    async function loadBadges() {
    setLoading(true);

    // Award new badges from both systems
    await checkMoodBadges(email);
    await checkQuestionnaireBadges(email);

    // Then fetch all badges
    const { data, error } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_email", email)
        .order("earned_date", { ascending: true });

    if (error) console.error("Error fetching badges:", error);
    else setBadges(data || []);

    setLoading(false);
    }

    loadBadges();
    }, [profile?.email]);


  // ✅ Your badge awarding logic
  async function checkMoodBadges(userEmail: string) {
    const { data: moods, error } = await supabase
      .from("mood_log")
      .select("date")
      .eq("user_email", userEmail)
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching moods:", error);
      return;
    }

    if (!moods?.length) return;

    // Badge 1: First mood log
    await grantBadge(userEmail, "mood", "beginner");

    // Badge 2: Streaks
    const uniqueDates = Array.from(
      new Set(moods.map((m) => new Date(m.date).toDateString()))
    );

    const streak = getStreak(uniqueDates);
    if (streak >= 7) await grantBadge(userEmail, "mood", "mid");
    if (streak >= 30) await grantBadge(userEmail, "mood", "advanced");
  }

  function getStreak(dateStrings: string[]): number {
    const dates = dateStrings.map((d) => new Date(d)).sort((a, b) => +b - +a);
    let streak = 1;

    for (let i = 0; i < dates.length - 1; i++) {
      const diff =
        (dates[i].getTime() - dates[i + 1].getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) streak++;
      else break; // streak broken
    }

    return streak;
  }


  async function checkQuestionnaireBadges(userEmail: string) {
    const { data: questionnaires, error } = await supabase
        .from("questionnaire_log")
        .select("date")
        .eq("user_email", userEmail)
        .order("date", { ascending: true });

    if (error) {
        console.error("Error fetching questionnaire logs:", error);
        return;
    }

    if (!questionnaires?.length) return;

    // ✅ Beginner – First check-in
    await grantBadge(userEmail, "questionnaire", "beginner");

    // ✅ Convert to unique day strings (avoid duplicates)
    const uniqueDates = Array.from(
        new Set(questionnaires.map((q) => new Date(q.date).toDateString()))
    );

    const streak = getStreak(uniqueDates);

    // ✅ Mid-Level – 7-day streak
    if (streak >= 7) await grantBadge(userEmail, "questionnaire", "mid");

    // ✅ Advanced – 30-day streak
    if (streak >= 30) await grantBadge(userEmail, "questionnaire", "advanced");
    }


  async function grantBadge(userEmail: string, type: string, level: string) {
    const { data: existing } = await supabase
      .from("user_badges")
      .select("*")
      .eq("user_email", userEmail)
      .eq("badge_type", type)
      .eq("level", level)
      .maybeSingle();

    if (existing) return; // already earned

    await supabase.from("user_badges").insert({
      user_email: userEmail,
      badge_type: type,
      level,
      earned_date: new Date().toISOString(),
    });

    console.log(`🎉 Badge earned: ${type} - ${level}`);
  }

  type BadgeLevel = "beginner" | "mid" | "advanced";

  function BadgeIcon({ level }: { level: BadgeLevel }) {
    const icons = {
      beginner: require("@/assets/images/mindLog_icon.png"),
      mid: require("@/assets/images/mindLog_icon.png"),
      advanced: require("@/assets/images/mindLog_icon.png"),
    };

    return <Image source={icons[level]} style={{ width: 60, height: 60 }} />;
  }

  // ✅ Loading state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#555" />
        <Text>Loading badges...</Text>
      </View>
    );
  }

  // ✅ Render the earned badges
  return (
    <FlatList
      data={badges}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 20 }}
      ListEmptyComponent={
        <Text style={{ textAlign: "center", marginTop: 40 }}>
          No badges earned yet
        </Text>
      }
      renderItem={({ item }) => (
        <View style={{ alignItems: "center", margin: 10 }}>
          <BadgeIcon level={item.level} />
          <Text>{item.badge_type} – {item.level}</Text>
        </View>
      )}
    />
  );
}
