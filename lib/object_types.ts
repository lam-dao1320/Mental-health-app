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