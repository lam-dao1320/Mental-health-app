import { Activity } from "@/lib/object_types";
import { useState } from "react";
import { FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
      <View style={styles.itemContainer}>
        <TouchableOpacity 
          onPress={() => toggleDetails(item.name)} 
          style={styles.button}
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
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
    width: 400,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
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
    paddingVertical: 10,
    borderTopColor: '#eee',
    backgroundColor: '#fafafa',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
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