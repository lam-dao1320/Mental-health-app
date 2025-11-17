import Card from "@/components/history/card";
import { useUserContext } from "@/context/authContext";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const GRADIENTS: [string, string][] = [
  ["#FBEAEA", "#F9DADA"], // angry – rose mist
  ["#E3ECFA", "#D8E5F4"], // sad – baby sky
  ["#F1E6F6", "#E7DDF1"], // low – pale lilac
  ["#FFFBE2", "#FFF4CC"], // okay – soft cream
  ["#E8FAEC", "#DFF8E4"], // great – mint cloud
];
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
  const { profile } = useUserContext();
  const [query, setQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        if (!profile?.email) return;

        // fetch both mood logs (with diary links) and standalone diaries
        const [moods, diaries] = await Promise.all([
          supabase
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
            .eq("user_email", profile.email)
            .order("date", { ascending: false }),
          supabase
            .from("diary")
            .select("id, user_email, body, date")
            .eq("user_email", profile.email)
            .order("date", { ascending: false }),
        ]);

        if (moods.error) console.error("mood_log fetch error:", moods.error);
        if (diaries.error) console.error("diary fetch error:", diaries.error);

        // merge and normalize shape
        const moodRecords =
          moods.data?.map((m) => ({
            id: m.id,
            mood: m.mood,
            date: m.date,
            diary: m.diary ? { body: m.diary.body, date: m.diary.date } : null,
          })) ?? [];

        const diaryRecords =
          diaries.data?.map((d) => ({
            id: d.id,
            mood: "No Moog Log",
            date: d.date,
            diary: { body: d.body, date: d.date },
          })) ?? [];

        const merged = [...moodRecords, ...diaryRecords].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setRecords(merged);
      };

      load();
    }, [profile])
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

  const filteredRecord = records.filter((record) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const moodMatch = record.mood?.toLowerCase().includes(q);
    const diaryMatch = record.diary?.body?.toLowerCase().includes(q);
    return moodMatch || diaryMatch;
  });

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          <Text style={styles.header}>My Mood Log</Text>

          <View style={styles.searchSection}>
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search moods or diary text…"
              placeholderTextColor="rgba(0,0,0,0.35)"
              autoCorrect
              autoCapitalize="sentences"
              returnKeyType="search"
            />
          </View>

          <FlatList
            data={filteredRecord}
            keyExtractor={(item, index) => String(item.id ?? index)}
            contentContainerStyle={styles.listContent}
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
                    moodText: `${
                      item.mood?.charAt(0).toUpperCase() +
                      item.mood?.slice(1).toLowerCase()
                    } ${emoji}`,
                    dateText,
                    bodyText,
                  }}
                  gradient={gradient}
                />
              );
            }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No mood history yet 🌱</Text>
            }
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F9F9FB",
  },
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: {
    fontFamily: "Noto Sans HK",
    fontWeight: "bold",
    fontSize: 32,
    color: "#1D1D1F",
    marginBottom: 16,
    textAlign: "center",
  },
  searchSection: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    color: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 60,
    fontSize: 16,
    color: "#6B7280",
  },
});
