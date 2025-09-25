import { supabase } from "./supabase";

export const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    if (error) {
        throw error;
    }
    return data;
};

export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email, password
    })
    if (error) {
        throw error;
    }
    return data;
};

export const googleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
    })
    if (error) {
        throw error;
    }
    return data;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        throw error;
    }
};

export const getSession = async () => {
    const { data: {session}, error } = await supabase.auth.getSession();
    if (error) {
        throw error;
    }
    return session;
};