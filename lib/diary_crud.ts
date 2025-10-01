import { DiaryRecord } from "./object_types";
import { supabase } from "./supabase";

export async function getDiaryByEmail(email: string) {
  const { data, error } = await supabase
    .from("diary")
    .select("id, date, body")
    .eq("user_email", email)
    .order("date", { ascending: false });

  if (error) throw error;
  return data;
}

export async function addNewDiary(record: DiaryRecord) {
  const { data, error } = await supabase
    .from("diary")
    .insert(record)
    .select()
    .single();

  if (error) throw error;
  return data;
}
