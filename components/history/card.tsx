"use client";

import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";




export default function Card({ record }: { record: any }) {

    const { moodText, dateText, bodyText } = record;

    const router = useRouter();

    const handleCardPress = () => {
        router.push({
            pathname: '/recordDetails/[id]',
            params: { id: record.id }
        });
    };

    return(
        <Pressable onPress={handleCardPress} style={s.card}>
            <View style={s.cardHeader}>
                <Text style={s.moodText}>{moodText}</Text>
                <Text style={s.dateText}>{dateText}</Text>
            </View>

            <View style={s.divider} />

            <View style={s.cardBody}>
                <Text style={s.bodyText} numberOfLines={3}>
                    {bodyText}
                </Text>
            </View>
        </Pressable>
    );
}


const s = StyleSheet.create({

    card: {
        backgroundColor: "#F4CA90",
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

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },

    moodText: {
        fontWeight: "bold",
        fontSize: 16,
    },

    dateText: {
        fontWeight: "bold",
        fontSize: 14,
    },

    divider: {
        height: 1,
        backgroundColor: "#fff",
        marginVertical: 8,
        opacity: 0.5,
    },

    cardBody: {
        gap: 6,
    },

    bodyText: {
        color: "#000",
        fontSize: 15,
        lineHeight: 20,
    },
})