import { useUserContext } from "@/context/authContext";
import { forgotPassword, signUp } from "@/lib/supabase_auth";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { addUser, getUserByEmail } from "../lib/user_crud";

const countries = ["United States", "Canada", "China", "HongKong", "Vietnam", "Korea", "Philippine", "Other"]

export default function SignIn() {

    const { setProfile, signIn } = useUserContext();

    const [step, setStep] = useState(0);

    const [email, setEmail] = useState("lam.dao@edu.sait.ca");
    const [password, setPassword] = useState("Lam1234");
    const [confirmedPassword, setConfirmedPassword] = useState("");

    const [firstName,setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [country, setCountry] = useState("");

    const [birthDay, setBirthDay] = useState("");
    const [birthMonth, setBirthMonth] = useState("");
    const [birthYear, setBirthYear] = useState("");

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
                const data = await getUserByEmail(email);
                setProfile(data);
                if (step == 0) router.push('/(tabs)');
                else handleNext();
            } else {
                await handleSignUp();
            } 
        } catch (err) {
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
        setError(null);

        if (!firstName || !lastName || !country.trim() || !birthDay || !birthMonth || !birthYear) {
            setError("Information is required");
            return;
        }

        // Validate birth date
        
        const day = parseInt(birthDay, 10);
        const month = parseInt(birthMonth, 10); 
        const year = parseInt(birthYear, 10);

        if (isNaN(day) || isNaN(month) || isNaN(year)) {
            setError("Birth date must contain only numbers.");
            return;
        }

        const dateCheck = new Date(year, month - 1, day);
        const currentYear = new Date().getFullYear();

        if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > currentYear) {
            setError("Please enter a valid day, month, and year.");
            return;
        }

        // Check if the constructed date matches the input values (validates Feb 30, Apr 31, etc.)
        if (
            dateCheck.getFullYear() !== year || 
            dateCheck.getMonth() !== month - 1 || 
            dateCheck.getDate() !== day
        ) {
            setError("The date entered is invalid (e.g., check days in month).");
            return;
        }

        // Check if date is in the future
        if (dateCheck > new Date()) {
            setError("Birth date cannot be in the future.");
            return;
        }
        
        let newProfile = {
            first_name: firstName,
            last_name: lastName,
            email: email,
            birth_date: dateCheck,
            country: country.trim(),
        }
        // console.log(newProfile);

        try {
            await addUser(newProfile);
            router.push('/(questionnaire)');
        } catch (err: any) {
            if (err.message.toLowerCase().includes("duplicate")) {
                setError("Email is existed");
            } else setError("Registration failed");
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: "f9f9fb" }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.container}>
                    <Text style={styles.welcomeText}>Welcome to Mindlog</Text>
                    <Text style={styles.subtitleText}>Please sign in to continue</Text>


                    {/* Sign In and Sign Up */}
                    {step == 0 && 
                    <View style={styles.card}>
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
                            <Text style={styles.errorText}>
                                Forgot your password?
                            </Text>
                        </TouchableOpacity>
                        }
                    </View>
                    }

                    {/* Step 1: Confirmed Email */}
                    {step == 1 &&
                    <View style={styles.card}>
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
                    {step == 2 &&
                    <View style={styles.card}>
                        <Text style={styles.title}>Create Your Profile</Text>

                        {error && <Text style={styles.errorText}>{error}</Text>}

                        {/* First Name */}
                        <Text style={styles.label}>First Name</Text>
                        <TextInput
                            style={styles.input}
                            value={firstName}
                            onChangeText={setFirstName}
                            autoCapitalize="words"
                        />

                        {/* Last Name */}
                        <Text style={styles.label}>Last Name</Text>
                        <TextInput
                            style={styles.input}
                            value={lastName}
                            onChangeText={setLastName}
                            autoCapitalize="words"
                        />

                        {/* Country */}
                        <Text style={styles.label}>Country</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., United States"
                            value={country}
                            onChangeText={setCountry}
                            autoCapitalize="words"
                        />

                        {/* Birth Date Inputs (Day, Month, Year) */}
                        <Text style={styles.label}>Birth Date</Text>
                        <View style={styles.dateInputRow}>
                            <TextInput
                                style={[styles.input, styles.dateInput]}
                                placeholder="DD"
                                value={birthDay}
                                onChangeText={setBirthDay}
                                keyboardType="numeric"
                                maxLength={2}
                                placeholderTextColor="#6B7280"
                            />
                            <TextInput
                                style={[styles.input, styles.dateInput, {marginHorizontal: 10}]}
                                placeholder="MM"
                                value={birthMonth}
                                onChangeText={setBirthMonth}
                                keyboardType="numeric"
                                maxLength={2}
                                placeholderTextColor="#6B7280"
                            />
                            <TextInput
                                style={[styles.input, styles.dateInput]}
                                placeholder="YYYY"
                                value={birthYear}
                                onChangeText={setBirthYear}
                                keyboardType="numeric"
                                maxLength={4}
                                placeholderTextColor="#6B7280"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleRegisterUser}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text style={styles.buttonText}>
                                    Submit
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                    }
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9F9FB",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    card: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 28,
        paddingVertical: 20,
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
        marginTop: 40,
    },
    welcomeText: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#1D1D1F",
        textAlign: "center",
        marginBottom: 10,
        fontFamily: "Noto Sans HK",
    },
    subtitleText: {
        fontSize: 16,
        color: "#6B7280",
        marginBottom: 24,
        textAlign: "center",
        fontFamily: "Noto Sans HK",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1D1D1F",
        marginBottom: 20,
        textAlign: "center",
        fontFamily: "Noto Sans HK",
    },
    label: {
        fontSize: 14,
        color: '#1D1D1F',
        marginBottom: 5,
        fontWeight: 600,
        fontFamily: "Noto Sans HK",
    },
    input: {
        height: 50,
        width: "100%",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 10,
        backgroundColor: "#fcfae1",
        fontFamily: "Noto Sans HK",
    },
    button: {
        backgroundColor: "#ACD1C9",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 25,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
        marginRight: 10,
        fontFamily: "Noto Sans HK",
    },
    errorText: {
        color: "#F49790",
        marginBottom: 15,
        textAlign: "center",
        fontFamily: "Noto Sans HK",
    },
    switchModeButton: {
        marginTop: 15,
        padding: 10,
        alignItems: 'center',
        fontFamily: "Noto Sans HK",
    },
    switchModeText: {
        color: '#0284c7',
        fontSize: 14,
        fontFamily: "Noto Sans HK",
    },
    dateInputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    dateInput: {
        flex: 1,
        textAlign: 'center', 
        marginBottom: 0,
    },
});