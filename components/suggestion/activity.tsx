import { Activity, ActivityCategory } from "@/lib/object_types";
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
  const [selectedCategoryName, setSelectedCategoryName] = useState<
    string | null
  >(null);

  const toggleDetails = (categoryName: string) => {
    setSelectedCategoryName((prevName) =>
      prevName === categoryName ? null : categoryName
    );
  };

  const ActivityDetailsList = ({ activities }: { activities: Activity[] }) => (
    <View style={styles.details}>
      {activities.map((activity, index) => (
        <View key={index} style={styles.activityItem}>
          <Text style={styles.activityDescription}>
            • {activity.description}
          </Text>
          {activity.link && (
            <TouchableOpacity
              onPress={() => Linking.openURL(activity.link)}
              style={styles.linkButton}
              activeOpacity={0.8}
            >
              <Text style={styles.linkText}>View Resource 🔗</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );

  const renderCategory = ({ item }: { item: ActivityCategory }) => {
    const isSelected = selectedCategoryName === item.name;
    return (
      <View style={[styles.card, isSelected && styles.cardExpanded]}>
        <TouchableOpacity
          onPress={() => toggleDetails(item.name)}
          style={styles.cardHeader}
          activeOpacity={0.8}
        >
          <Text style={styles.categoryName}>{item.name}</Text>
          <Text style={styles.indicator}>{isSelected ? "▲" : "▼"}</Text>
        </TouchableOpacity>
        {isSelected && <ActivityDetailsList activities={item.activities} />}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>AI Suggested Stress Activities 🧘</Text>
      <FlatList
        data={data.data.categories}
        keyExtractor={(item) => item.name}
        renderItem={renderCategory}
        extraData={selectedCategoryName}
        scrollEnabled={false}
      />
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#F9F9FB",
    paddingVertical: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1D1D1F",
    marginBottom: 18,
    textAlign: "center",
    fontFamily: "Noto Sans HK",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardExpanded: {
    backgroundColor: "#FDFCF7",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#007AFF",
    fontFamily: "Noto Sans HK",
  },
  indicator: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  details: {
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    backgroundColor: "#FCFCFC",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  activityItem: {
    marginTop: 8,
  },
  activityDescription: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    fontFamily: "Noto Sans HK",
  },
  linkButton: {
    alignSelf: "flex-start",
    marginTop: 4,
  },
  linkText: {
    fontSize: 14,
    color: "#34A853",
    fontWeight: "500",
    textDecorationLine: "underline",
    fontFamily: "Noto Sans HK",
  },
});
