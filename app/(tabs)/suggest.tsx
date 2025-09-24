import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const suggestions = [
    "Take a 10-minute walk outside.",
    "Try deep breathing exercises.",
    "Listen to your favorite song.",
    "Write down three things you're grateful for.",
    "Do a quick body stretch.",
    "Drink a glass of water.",
    "Practice mindfulness for 5 minutes.",
    "Call or text a friend.",
    "Try a new hobby or craft.",
    "Read a page of a book.",
    "Watch a funny video.",
    "Declutter your workspace.",
    "Meditate for 5 minutes.",
    "Spend time with a pet or nature.",
    "Plan a small goal for the day."
    ];

export default function SuggestPage() {
    const [currentSuggestion, setCurrentSuggestion] = useState(
        suggestions[Math.floor(Math.random() * suggestions.length)]
    );

    const handleNewSuggestion = () => {
        let nextSuggestion;
        do {
        nextSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        } while (nextSuggestion === currentSuggestion); // avoid repeating the same one
        setCurrentSuggestion(nextSuggestion);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Try Something Now</Text>
        
            <View style={styles.suggestionBox}>
                <Text style={styles.suggestionText}>{currentSuggestion}</Text>
            </View>

            <Pressable style={styles.button} onPress={handleNewSuggestion}>
                <Text style={styles.buttonText}>Get New Suggestion</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9F9FB",
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
    },

    title: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 40,
        fontFamily: "Noto Sans HK",
    },

    suggestionBox: {
        backgroundColor: "#FCFAE1",
        height: 90,
        width: 300,
        borderRadius: 10,
        padding: 15,
        marginHorizontal: 15,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },

    suggestionText: {
        fontSize: 18,
        color: "#333",
        lineHeight: 28,
        fontFamily: "Noto Sans HK",
    },

    button: {
        backgroundColor: "#ACD1C9",
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 25,
    },

    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
});
