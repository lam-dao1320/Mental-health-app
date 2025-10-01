export interface UserProfile {
    id?: string; // UUID as a string
    first_name: string;
    last_name: string;
    email: string;
    birth_date: Date;
    country: string;
}

export interface MoodRecord {
    id?: string;
    user_email: string;
    mood: string;
    date?: Date;
    body: string;
}

export interface DiaryRecord {
    id?: string;
    user_email: string;
    date?: Date;
    body: string;
}