import { useUserContext } from "@/context/authContext";
import { signUp } from "@/lib/supabase_auth";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SignIn() {

    const { user, session, signIn } = useUserContext();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmedPassword, setConfirmedPassword] = useState("");
    const [isSignIn, setIsSignIn] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    const registerUser = async () => {
        if (!email || !password || !confirmedPassword) {
            setError("All fields are required");
            return;
        }
        if (password != confirmedPassword) {
            setError("Confirmed password is not match");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await signUp(email, password);
        } catch (err: any) {
            setError(err instanceof Error ? err.message : "Registration failed");
        } finally {
            setLoading(false);
        }
    }

    const handleAuth = async () => {
        if (!email || !password) {
            setError("Email and password are required");
            return;
        }
        setLoading;(true);
        setError(null);
        try {
            if (isSignIn) {
                await signIn(email, password);
                router.push('/');
            } else {
                await registerUser();
            } 
        } catch (err) {
            setError(err instanceof Error ? err.message : "Authentication failed");
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Welcome to Mindlog</Text>
            <Text style={styles.subtitleText}>Please sign in to continue</Text>
            <View style={{flex: 1,  padding: 20, justifyContent: "center"}}>
                <Text style={styles.title}>{isSignIn ? "Sign In" : "Sign Up"}</Text>

                {error && <Text style={styles.errorText}>{error}</Text>}

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                {!isSignIn &&
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Confirmed Password"
                        value={confirmedPassword}
                        onChangeText={setConfirmedPassword}
                        secureTextEntry
                    />
                </>
                }

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleAuth}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.buttonText}>
                            {isSignIn ? "Sign In" : "Sign Up"}
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setIsSignIn(!isSignIn)}
                    style={styles.switchModeButton}
                >
                    <Text style={styles.switchModeText}>
                        {isSignIn 
                            ? "Don't have an account? Sign Up"
                            : "Already have an account? Sign In"}
                    </Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9F9FB",
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1D1D1F",
        textAlign: "center",
        marginBottom: 10,
        fontFamily: "Noto Sans HK",
    },
    subtitleText: {
        fontSize: 16,
        color: "#6B7280",
        textAlign: "center",
        marginBottom: 20,
        fontFamily: "Noto Sans HK",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        fontFamily: "Noto Sans HK",
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 10,
        backgroundColor: "#f9f9f9",
    },
    button: {
        backgroundColor: '#0284c7',
        height: 50,
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        minWidth: 300,
        maxWidth: 400,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1D1D1F",
        marginBottom: 8,
        textAlign: "center",
        fontFamily: "Noto Sans HK",
    },
    errorText: {
        color: "red",
        marginBottom: 15,
        textAlign: "center",
        fontFamily: "Noto Sans HK",
    },
    switchModeButton: {
        marginTop: 15,
        padding: 10,
        alignItems: 'center',
    },
    switchModeText: {
        color: '#0284c7',
        fontSize: 14,
    },
});