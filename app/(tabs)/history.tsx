import Card from "@/components/history/card";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

const GRADIENTS: [string, string][] = [
  // 0 angry — blush mist
  ["#FDE2DF", "#F8CFCF"],

  // 1 sad — mint haze
  ["#EAF6F2", "#DDEEE9"],

  // 2 low — lemon veil
  ["#F9F9FB", "#F9F9FB"],

  // 3 okay — peach cloud
  ["#FBECD7", "#FAD7D0"],

  // 4 great — salmon whisper
  ["#FCE1DC", "#FCE1DC"],
];

const EMOJI: Record<string, string> = {
  Angry: "😡",
  Sad: "😢",
  Low: "😔",
  Okay: "😊",
  Great: "😄",
};

const records = [
  {
    id: "1",
    mood: "Great",
    date: "23 Sep 2025 (Tue)",
    body: "Dear Mr. Diary,\n\nIt is a normal day, hanging out with a group of new friends ...",
  },
  {
    id: "2",
    mood: "Sad",
    date: "22 Sep 2025 (Mon)",
    body: "Dear Mr. Diary,\n\nIt is a normal day, hanging out with a group of new friends ...",
  },
  {
    id: "3",
    mood: "Okay",
    date: "21 Sep 2025 (Sun)",
    body: "Dear Mr. Diary,\n\nIt is a normal day, hanging out with a group of new friends ...",
  },
  {
    id: "4",
    mood: "Sad",
    date: "20 Sep 2025 (Sat)",
    body: "Dear Mr. Diary,\n\nIt is a normal day, hanging out with a group of new friends ...",
  },
  {
    id: "5",
    mood: "Okay",
    date: "19 Sep 2025 (Fri)",
    body: "Dear Mr. Diary,\n\nIt is a normal day, hanging out with a group of new friends ...",
  },
  {
    id: "6",
    mood: "Angry",
    date: "18 Sep 2025 (Thu)",
    body: "Dear Mr. Diary,\n\nIt is a normal day, hanging out with a group of new friends ...",
  },
];

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
  return (
    <View style={s.container}>
      <Text style={s.header}>My Mood Log</Text>

      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => {
          const idx = moodToIndex(item.mood);
          const gradient = GRADIENTS[idx];
          const emoji = EMOJI[item.mood as keyof typeof EMOJI] ?? "😊";
          return (
            <Card
              record={{
                id: item.id,
                moodText: `Mood: ${item.mood} ${emoji}`,
                dateText: item.date,
                bodyText: item.body,
              }}
              gradient={gradient} // let Card paint with LinearGradient
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
