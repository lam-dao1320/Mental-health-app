import { Activity } from "@/lib/object_types";
import { useState } from "react";
import {
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ActivitySuggestion(data: any) {
  console.log("QuickActivitySuggestion received data:", data.data);
  const [selectedActivityName, setSelectedActivityName] = useState<
    string | null
  >(null);

  const toggleDetails = (activityName: string) => {
    setSelectedActivityName((prevName) =>
      prevName === activityName ? null : activityName
    );
  };

  const renderActivityItem = ({ item }: { item: Activity }) => {
    const isSelected = selectedActivityName === item.name;

    return (
      <View style={[styles.card, isSelected && styles.cardExpanded]}>
        <TouchableOpacity
          onPress={() => toggleDetails(item.name)}
          style={styles.cardHeader}
          activeOpacity={0.8}
        >
          <Text style={styles.title} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.indicator}>{isSelected ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {isSelected && (
          <View style={styles.details}>
            <Text style={styles.activityDescription}>• {item.description}</Text>
            {item.link && (
              <TouchableOpacity
                onPress={() => Linking.openURL(item.link)}
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>View Resource 🔗</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>AI Suggested Activities 🧘</Text>
      <Text style={styles.subHeader}>{data.data.chosen_category}</Text>
      <FlatList
        data={data.data.activities}
        keyExtractor={(item) => item.name}
        renderItem={renderActivityItem}
        extraData={selectedActivityName}
        scrollEnabled={false} // ✅ fix nested ScrollView bug
        contentContainerStyle={{ gap: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "transparent",
    paddingVertical: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1D1D1F",
    textAlign: "center",
    fontFamily: "Noto Sans HK",
  },
  subHeader: {
    fontSize: 15,
    color: "#F49790",
    textAlign: "center",
    marginBottom: 16,
    marginTop: 4,
    fontWeight: "600",
    fontFamily: "Noto Sans HK",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  cardExpanded: {
    backgroundColor: "#FFF5F7",
    borderColor: "#F4C6C3",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1D1D1F",
    flex: 1,
    marginRight: 10,
    fontFamily: "Noto Sans HK",
  },
  indicator: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F49790",
  },
  details: {
    backgroundColor: "#FFF8FA",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopColor: "#F4C6C3",
    borderTopWidth: 0.8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  activityDescription: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    fontFamily: "Noto Sans HK",
  },
  linkButton: {
    alignSelf: "flex-start",
    marginTop: 6,
  },
  linkText: {
    fontSize: 14,
    color: "#E57373",
    fontWeight: "600",
    textDecorationLine: "underline",
    fontFamily: "Noto Sans HK",
  },
});
