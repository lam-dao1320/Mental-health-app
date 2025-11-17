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
  ["#FBEAEA", "#F9DADA"],
  ["#E3ECFA", "#D8E5F4"],
  ["#F1E6F6", "#E7DDF1"],
  ["#FFFBE2", "#FFF4CC"],
  ["#E8FAEC", "#DFF8E4"],
];

const EMOJI: Record<string, string> = {
  angry: "😡",
  sad: "😢",
  low: "😔",
  okay: "😊",
  great: "😄",
};

const moodToIndex = (m: string) => {
  const key = m?.toLowerCase?.() || "";
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

        const { data: moods, error: moodErr } = await supabase
          .from("mood_log")
          .select(
            `
            id,
            user_email,
            mood,
            date,
            diary(id, body, date)
          `
          )
          .eq("user_email", profile.email)
          .order("date", { ascending: false });

        const { data: diaries, error: diaryErr } = await supabase
          .from("diary")
          .select("id, user_email, body, date")
          .eq("user_email", profile.email)
          .order("date", { ascending: false });

        if (moodErr) console.error("mood_log fetch error:", moodErr);
        if (diaryErr) console.error("diary fetch error:", diaryErr);

        const moodRecords =
          moods?.map((m: any) => ({
            id: m.id,
            mood: m.mood ?? "none",
            date: m.date,
            body: m.diary?.body ?? null,
            diary_id: m.diary?.id ?? null,
          })) ?? [];

        // make diary list but exclude ones already linked in mood_log
        const linkedDiaryIds = new Set(moodRecords.map((m) => m.diary_id));

        const diaryRecords =
          diaries
            ?.filter((d) => !linkedDiaryIds.has(d.id)) // ✅ exclude linked ones
            .map((d) => ({
              id: d.id,
              mood: null,
              date: d.date,
              body: d.body,
            })) ?? [];

        // merge and sort
        const merged = [...moodRecords, ...diaryRecords].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setRecords(merged);
      };

      load();
    }, [profile])
  );

  const dateFormat = (date: string | null | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getDate()} ${d.toLocaleString("en-US", {
      month: "short",
    })} ${d.getFullYear()} (${d.toLocaleString("en-US", {
      weekday: "short",
    })})`;
  };

  const filteredRecord = records.filter((r) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const moodMatch = r.mood?.toLowerCase?.().includes(q);
    const diaryMatch = r.body?.toLowerCase?.().includes(q);
    return moodMatch || diaryMatch;
  });

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.header}>My Mood Log</Text>

          <View style={styles.searchSection}>
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search moods or diary text…"
              placeholderTextColor="rgba(0,0,0,0.35)"
            />
          </View>

          <FlatList
            data={filteredRecord}
            keyExtractor={(item, index) => String(item.id ?? index)}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const idx = moodToIndex(item.mood || "");
              const gradient = GRADIENTS[idx];
              const emoji = EMOJI[item.mood?.toLowerCase?.()] ?? "📝";

              const bodyText = item.body || "No diary text available";
              const dateText = dateFormat(item.date);

              return (
                <Card
                  record={{
                    id: item.id,
                    diary_id: item.diary_id ?? null, // ✅ pass through
                    moodText: `${
                      item.mood
                        ? item.mood.charAt(0).toUpperCase() +
                          item.mood.slice(1).toLowerCase()
                        : "Diary"
                    } ${emoji}`,
                    dateText,
                    bodyText,
                  }}
                  gradient={gradient}
                />
              );
            }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Come back later — we can’t find your diary log.
              </Text>
            }
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F9F9FB" },
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 16 },
  header: {
    fontFamily: "Noto Sans HK",
    fontWeight: "bold",
    fontSize: 32,
    color: "#1D1D1F",
    marginBottom: 16,
    textAlign: "center",
  },
  searchSection: { marginBottom: 20 },
  searchInput: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    color: "#333",
    elevation: 2,
  },
  listContent: { paddingBottom: 40 },
  emptyText: {
    textAlign: "center",
    marginTop: 60,
    fontSize: 16,
    color: "#6B7280",
  },
});
