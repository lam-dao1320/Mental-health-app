import Card from "@/components/history/card";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

const GRADIENTS: [string, string][] = [
  ["#FDE2DF", "#F8CFCF"], // angry
  ["#EAF6F2", "#DDEEE9"], // sad
  ["#F9F9FB", "#F9F9FB"], // low
  ["#FBECD7", "#FAD7D0"], // okay
  ["#FCE1DC", "#FCE1DC"], // great
];

// store keys in lowercase so we don’t have case mismatch
const EMOJI: Record<string, string> = {
  angry: "😡",
  sad: "😢",
  low: "😔",
  okay: "😊",
  great: "😄",
};

const moodToIndex = (m: string) => {
  const key = m.toLowerCase();
  if (key === "angry") return 0;
  if (key === "sad") return 1;
  if (key === "low") return 2;
  if (key === "okay") return 3;
  if (key === "great") return 4;
  return 3;
};

export default function HistoryPage() {
  const [records, setRecords] = useState<any[]>([]);

  // load data whenever page is focused
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const { data, error } = await supabase
          .from("mood_log")
          .select(
            `
              id,
              user_email,
              mood,
              date,
              diary:diary!fk_diary (
                id,
                body,
                date
              )
            `
          )
          .order("date", { ascending: false });

        if (error) {
          console.error("Error fetching history:", error);
          return;
        }

        setRecords(data || []);
      };

      load();
    }, [])
  );

  const dateFormat = (date: string | null | undefined) => {
    if (!date) return "";
    const dateObj = new Date(date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString("en-US", { month: "short" });
    const year = dateObj.getFullYear();
    const weekday = dateObj.toLocaleString("en-US", { weekday: "short" });
    return `${day} ${month} ${year} (${weekday})`;
  };

  return (
    <View style={s.container}>
      <Text style={s.header}>My Mood Log</Text>

      <FlatList
        data={records}
        keyExtractor={(item, index) => String(item.id ?? index)}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => {
          const idx = moodToIndex(item.mood || "");
          const gradient = GRADIENTS[idx];
          const emoji = EMOJI[item.mood?.toLowerCase()] ?? "😊";

          const bodyText = item.diary?.body ?? "(no diary written)";
          const dateText = item.diary?.date
            ? dateFormat(item.diary.date)
            : dateFormat(item.date);

          return (
            <Card
              record={{
                id: item.id,
                moodText: `Mood: ${item.mood} ${emoji}`,
                dateText,
                bodyText,
              }}
              gradient={gradient}
            />
          );
        }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 40 }}>
            No mood history yet
          </Text>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: "#F9F9FB",
    flex: 1,
    paddingHorizontal: 15,
  },
  header: {
    color: "black",
    fontFamily: "Noto Sans HK",
    fontWeight: "bold",
    fontSize: 35,
    marginVertical: 40,
    marginHorizontal: 15,
  },
});
