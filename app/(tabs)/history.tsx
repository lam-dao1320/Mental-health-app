import Card from "@/components/history/card";
import { useUserContext } from "@/context/authContext";
import { getRecordsByEmail } from "@/lib/diary_crud";
import { DiaryRecord } from "@/lib/object_types";
import React, { useEffect, useState } from "react";
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
  const { profile } = useUserContext();
  const [records, setRecords] = useState<DiaryRecord[]>([]);

  console.log("Profile: ", profile);
  console.log("Record: ", records);

  useEffect(() => {
    const fetchRecords = async () => {
      if (profile)
        try {
          const data = await getRecordsByEmail(profile.email);
          setRecords(data);
        } catch (err) {
          console.error(err instanceof Error ? err.message : "Authentication failed");
        }
    };
    fetchRecords();
  }, []);

  const dateFormat = (date: Date) => {
    let dateText = "";
    if (date) {
      const dateObj = new Date(date);
      const day = dateObj.getDate();
      const month = dateObj.toLocaleString("en-US", { month: "short" });
      const year = dateObj.getFullYear();
      const weekday = dateObj.toLocaleString("en-US", { weekday: "short" });
      dateText = `${day} ${month} ${year} (${weekday})`;
    }
    return dateText;
  }
  
  return (
    <View style={s.container}>
      <Text style={s.header}>My Mood Log</Text>
      {records.length > 0 &&
      <FlatList
        data={records}
        keyExtractor={(item, index) => item.id ?? index.toString()}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => {
          const idx = moodToIndex(item.mood);
          const gradient = GRADIENTS[idx];
          const emoji = EMOJI[item.mood as keyof typeof EMOJI] ?? "😊";
          return (
            <Card
              record={{
                id: item.id ?? "",
                moodText: `Mood: ${item.mood} ${emoji}`,
                dateText: item.date ? dateFormat(item.date) : "",
                bodyText: item.body,
              }}
              gradient={gradient} // let Card paint with LinearGradient
            />
          );
        }}
      />
      }
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
