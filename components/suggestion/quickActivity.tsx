import { Activity, ActivityCategory } from "@/lib/object_types";
import { useState } from "react";
import { FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function QuickActivitySuggestion(data: any) {
  console.log("QuickActivitySuggestion received data:", data.data.categories[0]);
  // selectedId now tracks the name of the expanded category
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);

  const toggleDetails = (categoryName: string) => {
    // Toggles: If it's the same, set to null (collapse). Otherwise, set the new name (expand).
    setSelectedCategoryName(prevName => (prevName === categoryName ? null : categoryName));
  };
  
  // Custom component to render the list of activities within a category
  const ActivityDetailsList = ({ activities }: { activities: Activity[] }) => (
    <View style={styles.details}>
      {activities.map((activity, index) => (
        <View key={index} style={styles.activityItem}>
          <Text style={styles.activityDescription}>• {activity.description}</Text>
          <TouchableOpacity 
            onPress={() => Linking.openURL(activity.link)} 
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>View Resource 🔗</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderCategory = ({ item }: { item: ActivityCategory }) => {
    const isSelected = selectedCategoryName === item.name;

    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity 
          onPress={() => toggleDetails(item.name)} 
          style={styles.button}
        >
          <Text style={styles.title}>{item.name}</Text>
          {/* Visual Indicator */}
          <Text style={styles.indicator}>{isSelected ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        
        {/* Conditional rendering of the activities list */}
        {isSelected && (
          <ActivityDetailsList activities={item.activities} />
        )}
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
      />
    </View>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
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
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF', // Theme color for category titles
  },
  indicator: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  details: {
    paddingHorizontal: 15,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fafafa',
  },
  activityItem: {
    marginBottom: 10,
  },
  activityDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    lineHeight: 20,
  },
  linkButton: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  linkText: {
    fontSize: 14,
    color: '#34A853', // Green for links/resources
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});