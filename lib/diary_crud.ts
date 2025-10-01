import { DiaryRecord } from "./object_types";
import { supabase } from "./supabase";

export async function getDiaryByEmail(email: string) {
    const { data, error} = await supabase
        .from('diary')
        .select('*')
        .eq('user_email', email)
        .order('date', { ascending: false })
    if (error) {
        console.error(`Error fetching diary history with user email ${email}: `, error);
        throw error;
    }
    console.log(data);
    return data;
}

export async function addNewDiary(record: DiaryRecord) {
    const { data, error } = await supabase
        .from('diary')
        .insert(record)
    if (error) {
        console.log("Error writing diary: ", error);
        throw error;
    }
    return data;
}