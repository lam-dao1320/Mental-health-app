import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";


interface UserContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;   
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
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const router = useRouter();

    useEffect(() => {
        const initializeAuth = async () => {
            setIsLoading(true);
            const {data : {session}} = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                // await fetchProfile(session.user.id);
                console.log(session.user);
            } else {
                router.push('/sign_in');
            }
            setIsLoading(false);
        };

        const { data : {subscription} } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    // fetchProfile(session.user.id);
                    console.log(session);
                } else { 
                    // setProfile(null);
                }
            });

        initializeAuth();

        return () => { subscription.unsubscribe(); };

    }, []);

    // const googleSignIn = async () => {
    //     setIsLoading(true);
    //     try {
    //         const { data, error } = await supabase.auth.signInWithOAuth({
    //             provider: 'google',
    //             options: {
    //                 redirectTo: '/',
    //                 // scopes: ['email', 'profile'],
    //             }
    //         })
    //     } catch (error) {
    //         console.log("Google Sign In Failed", error);
    //         throw error;
    //     } finally {
    //         setIsLoading(false);
    //     }
    // }

    const signIn = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({email, password});
            if (error) {
                throw new Error(error.message);
            }
            setSession(data.session);
            setUser(data.user);

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
            setUser(null);

        } catch (error) {
            console.error("Sign-out error: ", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const contextValue: UserContextType = { user, session, isLoading, signIn, signOut };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );

}