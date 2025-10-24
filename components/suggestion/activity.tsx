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
  // selectedId now tracks the name of the expanded category
  const [selectedActivityName, setSelectedActivityName] = useState<string | null>(null);

  const toggleDetails = (activityName: string) => {
    // Toggles: If it's the same, set to null (collapse). Otherwise, set the new name (expand).
    setSelectedActivityName(prevName => (prevName === activityName ? null : activityName));
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
          <View style={{width:300}}>
            <Text style={styles.title}>{item.name}</Text>
          </View>
          {/* Visual Indicator */}
          <Text style={styles.indicator}>{isSelected ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        
        {/* Conditional rendering of the activities list */}
        {isSelected && (
          <View style={styles.details}>
            <Text style={styles.activityDescription}>• {item.description}</Text>
            {item.link &&
              <TouchableOpacity 
                onPress={() => Linking.openURL(item.link)} 
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>View Resource 🔗</Text>
              </TouchableOpacity>
            }
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>AI Suggested Stress Activities 🧘</Text>
      <Text style={styles.smallHeader}>{data.data.chosen_category}</Text>
      <FlatList
        data={data.data.activities}
        keyExtractor={(item) => item.name}
        renderItem={renderActivityItem}
        extraData={selectedActivityName}
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
  smallHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  itemContainer: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
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
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopColor: '#eee',
    backgroundColor: '#fafafa',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
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
