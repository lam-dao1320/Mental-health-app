"use client";

import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const recordList = [
        {id: '1', moodText: 'Mood: Okay', dateText: '23 Sep 2025 (Tue)', bodyText: 'Dear Mr. Diary,\n\nIt is a normal day, hanging out with a group of new friends ...'},
        {id: '2', moodText: 'Mood: Sad', dateText: '22 Sep 2025 (Mon)', bodyText: 'Dear Mr. Diary,\n\nIt is a normal day, hanging out with a group of new friends ...'},
        {id: '3', moodText: 'Mood: Okay', dateText: '21 Sep 2025 (Sun)', bodyText: 'Dear Mr. Diary,\n\nIt is a normal day, hanging out with a group of new friends ...'},
        {id: '4', moodText: 'Mood: Sad', dateText: '20 Sep 2025 (Sat)', bodyText: 'Dear Mr. Diary,\n\nIt is a normal day, hanging out with a group of new friends ...'},
        {id: '5', moodText: 'Mood: Okay', dateText: '19 Sep 2025 (Fri)', bodyText: 'Dear Mr. Diary,\n\nIt is a normal day, hanging out with a group of new friends ...'},
        {id: '6', moodText: 'Mood: Sad', dateText: '18 Sep 2025 (Thu)', bodyText: 'Dear Mr. Diary,\n\nIt is a normal day, hanging out with a group of new friends ...'}
    ]



export default function CardDetails() {

    const { id } = useLocalSearchParams();

    // Find the record by id
    const record = recordList.find((item) => item.id === id);

    if (!record) {
        return (
        <View style={s.container}>
            <Text style={s.header}>You haven't create any Mood Log yet.</Text>
        </View>
        );
    }

    return(
        <View style={s.container}>
            <Text style={s.header}>{record.moodText}</Text>
            <Text style={s.date}>{record.dateText}</Text>
            <Text style={s.body}>{record.bodyText}</Text>
        </View>
    );
}

const s = StyleSheet.create({

    container: {
        backgroundColor: "#F9F9FB",
        height: "100%",
        paddingHorizontal: 15,
    },

    header: {
        color: 'black',
        fontFamily: 'Noto Sans HK',
        fontWeight: 'bold',
        fontSize: 35,
        marginVertical: 40,
        marginHorizontal: 15,
    },

    date: {
        color: "#333",
        fontSize: 18,
        marginHorizontal: 15,
        marginBottom: 15,
    },

    body: {
        color: "#444",
        fontSize: 16,
        lineHeight: 22,
        marginHorizontal: 15,
    },

})