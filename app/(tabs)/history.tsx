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
  ["#FBEAEA", "#F9DADA"], // angry – rose mist (0)
  ["#E3ECFA", "#D8E5F4"], // sad – baby sky (1)
  ["#F1E6F6", "#E7DDF1"], // low – pale lilac (2)
  ["#FFFBE2", "#FFF4CC"], // okay – soft cream (3)
  ["#E8FAEC", "#DFF8E4"], // great – mint cloud (4)
];
const RAINBOW_GRADIENT: [string, string] = ["#f1e8b1ff", "#b1d6f0ff"]; // Standalone Diary: Gold to Hot Pink

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

        // 1. Fetch Mood Logs and their linked Diaries
        const { data: moodData, error: moodError } = await supabase
          .from("mood_log")
          .select(
            `
            id,
            user_email,
            mood,
            date,
            diary ( 
              id,
              body,
              date
            )
          `
          )
          .eq("user_email", profile.email)
          .order("date", { ascending: false });

        if (moodError) {
          console.error("Error fetching mood logs:", moodError);
          return;
        }

        // 2. Fetch ALL Diary entries
        const { data: diaryData, error: diaryError } = await supabase
          .from("diary")
          .select(`id, body, date`)
          .eq("user_email", profile.email);

        if (diaryError) {
          console.error("Error fetching diary entries:", diaryError);
          return;
        }

        // --- MERGE LOGIC ---

        // Map to store unique entries, prioritized by date/timestamp.
        const allEntriesMap = new Map();

        // 3. Add Mood Log entries (Moods with linked diaries)
        // These are prioritized if they exist for a given date.
        moodData.forEach((entry) => {
          // If the entry has a mood, it's a primary mood log record
          allEntriesMap.set(entry.date, {
            id: entry.id,
            mood: entry.mood,
            date: entry.date,
            diary: entry.diary,
          });
        });

        // 4. Add Standalone Diary entries
        diaryData.forEach((diaryEntry) => {
          const dateKey = diaryEntry.date;

          // If an entry for this exact date doesn't exist yet (meaning there's no mood logged for this time)
          if (!allEntriesMap.has(dateKey)) {
            allEntriesMap.set(dateKey, {
              id: diaryEntry.id,
              mood: null, // Indicates a standalone diary
              date: dateKey,
              diary: {
                id: diaryEntry.id,
                body: diaryEntry.body,
                date: diaryEntry.date,
              },
            });
          } else {
            // Optional: If an unlinked mood exists (mood !== null, diary === null),
            // this existing mood record will be prioritized over the standalone diary,
            // but the diary content will be available through the linked entry if the
            // linking was done correctly in the emoji screen.
            // Since the merge logic is strictly prioritized by moodData first, we trust
            // the mood log to be the source of truth if it exists.
          }
        });

        // 5. Sort and Set
        const combinedRecords = Array.from(allEntriesMap.values()).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setRecords(combinedRecords || []);
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

    // Check if mood exists for searching
    const moodMatch = record.mood?.toLowerCase().includes(q);

    // Check if diary body exists for searching
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
            keyExtractor={(item, index) => String(item.id ?? index) + item.date}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isStandaloneDiary = item.mood === null;

              const moodLabel = item.mood ? item.mood.toLowerCase() : "okay";
              let gradient, emoji;

              if (isStandaloneDiary) {
                gradient = RAINBOW_GRADIENT; // Apply rainbow gradient
                emoji = "📝";
              } else {
                // Use standard mood values
                const idx = moodToIndex(moodLabel);
                gradient = GRADIENTS[idx];
                emoji = EMOJI[moodLabel];
              }

              const bodyText = item.diary?.body ?? "(no diary written)";
              const dateText = dateFormat(item.date);

              return (
                <Card
                  record={{
                    id: item.id,
                    moodText: item.mood
                      ? `${
                          item.mood.charAt(0).toUpperCase() +
                          item.mood.slice(1).toLowerCase()
                        } ${emoji}`
                      : `Diary Entry ${emoji}`, // Label for standalone diary
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
