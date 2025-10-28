import { UserProfile } from "./object_types";
import { supabase } from "./supabase";

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("email", email)
    .maybeSingle();
  if (error) {
    console.error(`Error fetching user with email ${email}: `, error);
    throw error;
  }
  return data;
}

export async function addUser(user: UserProfile) {
  const { data, error } = await supabase.from("user_profiles").insert(user);
  if (error) {
    // console.error("Error registering user: ", error);
    throw error;
  }
  return data;
}

export async function updateUser(user: UserProfile) {
  const { data, error } = await supabase
    .from("user_profiles")
    .update(user)
    .eq("email", user.email);
  if (error) {
    throw error;
  }
  return data;
}
