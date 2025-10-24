export interface UserProfile {
  id?: string; // UUID as a string
  first_name: string;
  last_name: string;
  email: string;
  birth_date: Date | null;
  country: string;
  phone: string;
  depression: number | null;
  anxiety: number | null;
  overall: number | null;
  checked_in_at: Date | null;
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
  name: string;
  description: string;
  link: string;
}

export interface ActivityCategory {
  activities: Activity[];
}

export interface Plan {
  name: string;
  type: string;
  details: string;
  rationale: string;
}

export interface PlanActivities {
  plan_activities: Plan[];
}

export interface QuestionnaireLog{
  user_email?: string;
  date: Date | null;
}
