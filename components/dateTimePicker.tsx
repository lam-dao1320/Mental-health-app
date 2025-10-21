import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform, StyleSheet, View } from "react-native";

type DateTimePickerPageProps = {
  dateTime: Date;
  setDateTime: (date: Date) => void;
  onClose: () => void;
};

export default function DateTimePickerPage({ dateTime, setDateTime, onClose }: DateTimePickerPageProps) {

    return(
        <View
            style={styles.container}
        >
            <DateTimePicker
                themeVariant="light"
                value={dateTime}
                mode="datetime"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(event, selectedDate) => {
                if (Platform.OS !== "ios") {
                    // On Android, close picker on selection or cancel
                    onClose();
                }
                if (selectedDate) {
                    setDateTime(selectedDate);
                }
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 3,
        width: "90%",
        height: "50%",
        justifyContent: "center",
        alignItems: "center",
        padding: 8,
        borderRadius: 30,
    }
})