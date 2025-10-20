export interface UserProfile {
  id?: string; // UUID as a string
  first_name: string;
  last_name: string;
  email: string;
  birth_date: Date | null;
  country: string;
  phone: string;
  phq: number;
  gad: number;
}

export type MoodRecord = {
  id?: number;
  user_email?: string;
  mood: string;
  date?: string;
  diary_id?: number | null;
};

export type DiaryRecord = {
  id?: number;
  user_email?: string;
  body: string;
  date?: string;
};

// --- TYPES ---
export interface Activity {
  description: string;
  link: string;
}

export interface ActivityCategory {
  name: string;
  activities: Activity[];
}
