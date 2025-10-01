import { getDiaryByEmail } from "@/lib/diary_crud";
import { getRecordsByEmail } from "@/lib/mood_crud";
import { DiaryRecord, MoodRecord, UserProfile } from "@/lib/object_types";
import { supabase } from "@/lib/supabase";
import { getUserByEmail } from "@/lib/user_crud";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

interface UserContextType {
    session: Session | null;
    profile: UserProfile | null;
    records: MoodRecord[];
    diaryRecords: DiaryRecord[];
    isLoading: boolean;
    setRecords: (data: MoodRecord[]) => void;
    setDiaryRecords: (data: DiaryRecord[]) => void;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;  
    setProfile: (profile: UserProfile) => void; 
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const router = useRouter();

export const useUserContext = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        Alert.alert("Session expired", "Please sign in again.");
        router.push('/sign_in');
        throw new Error("");
    }
    return context;
}

interface UserContextProviderProps { children: ReactNode }

export const UserContextProvider = ({ children } : UserContextProviderProps) => {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [records, setRecords] = useState<MoodRecord[]>([]);
    const [diaryRecords, setDiaryRecords] = useState<DiaryRecord[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const router = useRouter();

    useEffect(() => {
        const initializeAuth = async () => {
            setIsLoading(true);
            const {data : {session}} = await supabase.auth.getSession();
            setSession(session);
            if (session?.user.email) {               
                console.log("Email: ", session.user.email);
            } else {
                router.push('/sign_in');
            }
            setIsLoading(false);
        };

        const { data : {subscription} } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
            });

        initializeAuth();

        return () => { subscription.unsubscribe(); };

    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            if (session?.user.email) {               
                // console.log("Fetching User Profile: ", session.user);
                try {
                    const data = await getUserByEmail(session.user.email);
                    setProfile(data);
                } catch (error) {
                    console.error("Error Initialize Auth: ", error)
                    throw error;
                }
            } else { 
                setProfile(null);
            }
        };
        fetchProfile();
    }, [session]);

    useEffect(() => {
        const fetchRecords = async () => {
            if (profile?.email)
                try {
                    const moodData = await getRecordsByEmail(profile.email);
                    setRecords(moodData);
                    const diaryData = await getDiaryByEmail(profile.email);
                    setDiaryRecords(diaryData);
                } catch (error) {
                    console.error("Fetching diary error: ", error);
                    throw error;
                }
        };
        fetchRecords();
    }, [profile])

    const signIn = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({email, password});
            if (error) {
                throw new Error(error.message);
            }
            setSession(data.session);
        } catch (error) {
            console.error("Sign-in error:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        setIsLoading(true);
        try {
            const {error} = await supabase.auth.signOut();
            if (error) {
                throw new Error(error.message);
            }
            setSession(null);
        } catch (error) {
            console.error("Sign-out error: ", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const contextValue: UserContextType = { session, profile, setProfile, records, setRecords, diaryRecords, setDiaryRecords, isLoading, signIn, signOut };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
}