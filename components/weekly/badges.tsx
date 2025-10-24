import { useUserContext } from "@/context/authContext";
import { fetchAllBadges } from "@/lib/log_crud";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View } from "react-native";

type BadgeType = "mood" | "questionnaire";
type BadgeLevel = "beginner" | "mid" | "advanced";

export default function WeeklyBadges() {
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useUserContext();

  useEffect(() => {
    if (!profile?.email) return;

    const email = profile?.email

    async function loadBadges() {
      setLoading(true);
      const data = await fetchAllBadges(email);
      setBadges(data?.filter((b: any) => b.badge_type === "mood") || []);
      setLoading(false);
    }

    loadBadges();
  }, [profile?.email]);

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
    return <Image source={icons[type][level]} style={s.img} />;
  }

  if (loading) {
    return (
      <View style={[s.card, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#555" />
        <Text>Loading badges...</Text>
      </View>
    );
  }

  return (
      <View style={s.card}>
        <Text style={s.title}>Your Mood Badges 🏅</Text>

        {badges.length === 0 ? (
          <Text style={{ marginTop: 20, color: "#374151" }}>No mood badges earned yet.</Text>
        ) : (
          <FlatList
            data={badges}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
            renderItem={({ item }) => (
              <View style={s.badge}>
                <BadgeIcon type={item.badge_type} level={item.level} />
                <Text style={s.label}>
                  {item.level === "beginner" ? "First Log" : item.level === "mid" ? "1-Week Streak" : "Advanced Streak"}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    );
  }

  const s = StyleSheet.create({
    card: {
      width: "100%",
      backgroundColor: "#FFFFFF",
      borderRadius: 18,
      padding: 18,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
      alignItems: "center",
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#1D1D1F",
      marginBottom: 16,
      fontFamily: "Noto Sans HK",
    },
    badge: {
      alignItems: "center",
      marginHorizontal: 10,
    },
    img: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "#E8F0FE",
      marginBottom: 8,
    },
    label: {
      fontSize: 14,
      color: "#374151",
      fontFamily: "Noto Sans HK",
      textAlign: "center",
    },
  });