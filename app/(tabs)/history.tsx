import Card from "@/components/history/card";
import { ScrollView, StyleSheet, Text, View } from "react-native";

const recordList = [
        {id: '1', moodText: 'Mood: Okay', dateText: '23 Sep 2025 (Tue)', bodyText: 'Dear Mr. Diary,\n\nIt is a normal day, hanging out with a group of new friends ...'},
        {id: '2', moodText: 'Mood: Sad', dateText: '22 Sep 2025 (Mon)', bodyText: 'Dear Mr. Diary,\n\nIt is a normal day, hanging out with a group of new friends ...'},
        {id: '3', moodText: 'Mood: Okay', dateText: '21 Sep 2025 (Sun)', bodyText: 'Dear Mr. Diary,\n\nIt is a normal day, hanging out with a group of new friends ...'},
        {id: '4', moodText: 'Mood: Sad', dateText: '20 Sep 2025 (Sat)', bodyText: 'Dear Mr. Diary,\n\nIt is a normal day, hanging out with a group of new friends ...'},
        {id: '5', moodText: 'Mood: Okay', dateText: '19 Sep 2025 (Fri)', bodyText: 'Dear Mr. Diary,\n\nIt is a normal day, hanging out with a group of new friends ...'},
        {id: '6', moodText: 'Mood: Sad', dateText: '18 Sep 2025 (Thu)', bodyText: 'Dear Mr. Diary,\n\nIt is a normal day, hanging out with a group of new friends ...'}
    ]


export default function HistoryPage() {

    return (
        <View style={s.container}>
            <Text style={s.header}>My Mood Log</Text>
            <ScrollView>
                {recordList.map((record: any) => (
                    <Card key={record.id} record={record} />
                ))}
            </ScrollView>
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

})