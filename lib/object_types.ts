export interface UserProfile {
    id?: string; // UUID as a string
    first_name: string;
    last_name: string;
    email: string;
    birth_date: Date;
    country: string;
}
