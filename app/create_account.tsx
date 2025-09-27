import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CreateAccount() {

    const [step, setStep] = useState(1);

    const handleNext = () => {
        setStep(step + 1);
    }
    const handleBack = () => {
        setStep(step - 1);
    }

    return (
        <View style={styles.container}>

            { step == 1 &&
            <View>
                <Text style={styles.welcomeText}>Step 1</Text>
                <Text style={styles.subtitleText}>Confirmed your email</Text>
                <TouchableOpacity
                    style={styles.button}
                >

                </TouchableOpacity>
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
});