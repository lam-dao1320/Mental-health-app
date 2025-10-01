import Card from "@/components/history/card";
import { supabase } from "@/lib/supabase"; // adjust path
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

const GRADIENTS = [
  ["#FDE2DF", "#F8CFCF"], // angry
  ["#EAF6F2", "#DDEEE9"], // sad
  ["#F9F9FB", "#F9F9FB"], // low
  ["#FBECD7", "#FAD7D0"], // okay
  ["#FCE1DC", "#FCE1DC"], // great
];

const EMOJI = {
  Angry: "😡",
  Sad: "😢",
  Low: "😔",
  Okay: "😊",
  Great: "😄",
};

const moodToIndex = (m) => {
  const key = m.toLowerCase();
  if (key === "angry") return 0;
  if (key === "sad") return 1;
  if (key === "low") return 2;
  if (key === "okay") return 3;
  if (key === "great") return 4;
  return 3;
};

export default function HistoryPage() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("mood_log")
        .select(
          `
          id,
          mood,
          date,
          diary:diary_id (
            id,
            body,
            date
          )
        `
        )
        .order("date", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }
      setRecords(data || []);
    };

    load();
  }, []);

  const dateFormat = (date) => {
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
        keyExtractor={(item, index) => item.id ?? index.toString()}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => {
          const idx = moodToIndex(item.mood);
          const gradient = GRADIENTS[idx];
          const emoji = EMOJI[item.mood] ?? "😊";

          const bodyText = item.diary?.body ?? "(no diary written)";
          const dateText = item.diary?.date
            ? dateFormat(item.diary.date)
            : dateFormat(item.date);

          return (
            <Card
              record={{
                id: item.id ?? "",
                moodText: `Mood: ${item.mood} ${emoji}`,
                dateText,
                bodyText,
              }}
              gradient={gradient}
            />
          );
        }}
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
