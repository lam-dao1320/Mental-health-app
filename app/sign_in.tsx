import { useUserContext } from "@/context/authContext";
import { forgotPassword, signUp } from "@/lib/supabase_auth";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SignIn() {

    const { user, session, signIn } = useUserContext();

    const [step, setStep] = useState(1);

    const [email, setEmail] = useState("lam.dao@edu.sait.ca");
    const [password, setPassword] = useState("Lam1234");
    const [confirmedPassword, setConfirmedPassword] = useState("");

    const [firstName,setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthDate, setBirthDate] = useState(new Date());

    const [isSignIn, setIsSignIn] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    const newProfile = {
        first_name: '',
        last_name: '',
        email: email || '',
        birth_date: null,
        country: '',
    }

    const handleNext = () => {
        if (step < 2) setStep(step + 1);
        else router.push('/');
    }

    const handleSignUp = async () => {
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
            handleNext();
            setIsSignIn(!isSignIn);
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
        setLoading(true);
        setError(null);
        try {
            if (isSignIn) {
                await signIn(email, password);
                if (step == 0) router.push('/');
                else handleNext();
            } else {
                await handleSignUp();
            } 
        } catch (err) {
            console.log(email, " ", password);
            setError(err instanceof Error ? err.message : "Authentication failed");
        } finally {
            setLoading(false);
        }
    }

    const handleForgotPassword = async () => {
        if (!email) {
            setError("Email is required")
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await forgotPassword(email);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Resetting password failed");
        } finally {
            setLoading(false);
        }
    }

    const handleRegisterUser = async () => {
        if (!firstName || !lastName) {
            setError("Name is required");
            return;
        }
    }
    
    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Welcome to Mindlog</Text>
            <Text style={styles.subtitleText}>Please sign in to continue</Text>

            {/* Sign In and Sign Up */}
            {step == 0 && 
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

                {isSignIn &&
                <TouchableOpacity
                    onPress={handleForgotPassword}
                    style={styles.switchModeButton}
                >
                    <Text style={styles.switchModeText}>
                        Forgot your password?
                    </Text>
                </TouchableOpacity>
                }
            </View>
            }
            {/* Step 1: Confirmed Email */}
            {step == 1 &&
            <View style={{flex: 1,  padding: 20, justifyContent: "center"}}>
                <Text style={styles.title}>Confirmed Your Email</Text>

                {error && <Text style={styles.errorText}>{error}</Text>}

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleAuth}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.buttonText}>
                            Yes, I confirmed
                        </Text>
                    )}
                </TouchableOpacity>

            </View>
            }
            {/* Step 2: Fill in User Information */}
            {step ==2 &&
            <View style={{flex: 1,  padding: 20, justifyContent: "center"}}>
                <Text style={styles.title}>Create Your Account</Text>

                {error && <Text style={styles.errorText}>{error}</Text>}

                <TextInput
                    style={styles.input}
                    placeholder="First name"
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
            </View>
            }
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