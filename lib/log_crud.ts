import { QuestionnaireLog } from "./object_types";
import { supabase } from "./supabase";

export async function addQuestionnaireLog(newRecord: QuestionnaireLog) {
    const { data, error } = await supabase
            .from('questionnaire_log')
            .insert(newRecord)
        if (error) {
            throw error;
        }
        return data;
}

export async function fetchAllBadges(email: String) {
    const { data, error } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_email", email)
        .order("earned_date", { ascending: true });

    if (error) {
        console.error("Error fetching badges:", error);
    }
    return data;
}

export async function grantBadge(userEmail: string, type: string, level: string) {
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

export function getStreak(dateStrings: string[]): number {
  const dates = dateStrings.map((d) => new Date(d)).sort((a, b) => +b - +a);
  let streak = 1;

  for (let i = 0; i < dates.length - 1; i++) {
    const diff = (dates[i].getTime() - dates[i + 1].getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

export async function checkMoodBadges(userEmail: string) {
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

  await grantBadge(userEmail, "mood", "beginner");

  const uniqueDates = Array.from(new Set(moods.map((m) => new Date(m.date).toDateString())));
  const streak = getStreak(uniqueDates);

  if (streak >= 7) await grantBadge(userEmail, "mood", "mid");
  if (streak >= 30) await grantBadge(userEmail, "mood", "advanced");
}

export async function checkQuestionnaireBadges(userEmail: string) {
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

  await grantBadge(userEmail, "questionnaire", "beginner");

  const uniqueDates = Array.from(
    new Set(questionnaires.map((q) => new Date(q.date).toDateString()))
  );

  const streak = getStreak(uniqueDates);
  if (streak >= 7) await grantBadge(userEmail, "questionnaire", "mid");
  if (streak >= 30) await grantBadge(userEmail, "questionnaire", "advanced");
}