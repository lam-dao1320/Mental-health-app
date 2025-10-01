import { MoodRecord } from "./object_types";
import { supabase } from "./supabase";

export async function getRecordsByEmail(email: string) {
    const { data, error} = await supabase
        .from('mood_log')
        .select('*')
        .eq('user_email', email)
        .order('date', { ascending: false })
    if (error) {
        console.error(`Error fetching diary history with user email ${email}: `, error);
        throw error;
    }
    return data;
}

export async function addNewRecord(record: MoodRecord) {
    const { data, error } = await supabase
        .from('mood_log')
        .insert(record)
    if (error) {
        console.log("Error writing diary: ", error);
        throw error;
    }
    return data;
}