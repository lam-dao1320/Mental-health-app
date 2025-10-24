import { Plan } from '@/lib/object_types';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PlanSuggestion(plans: any) {
  // Use state to track which plan's detail are expanded
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const toggleDetails = (planName: string) => {
    setSelectedPlan(prevName => (prevName === planName ? null : planName));
  };

  // Custom component to render the list of plans
  const renderPlanItem = ({ item }: { item: Plan }) => {
    const isSelected = selectedPlan === item.name;
    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity
          onPress={() => toggleDetails(item.name)}
          style={styles.button}
        >
          <View style={{width:300}}>
            <Text style={styles.planName}>{item.name}</Text>
            <Text style={styles.planType}>{item.type}</Text>
          </View>
          <Text style={styles.indicator}>{isSelected ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {isSelected && (
          <View style={styles.details}>
            <Text style={styles.detailTitle}>Activity Details:</Text>
            <Text style={styles.detailText}>{item.details}</Text>
            <Text style={styles.rationaleTitle}>Why This Activity:</Text>
            <Text style={styles.rationaleText}>{item.rationale}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>AI Suggested Stress Plans 🎯</Text>
      <FlatList
        data={plans.data.plan_activities}
        keyExtractor={(item) => item.name}
        renderItem={renderPlanItem}
        extraData={selectedPlan}
      />
    </View>
  );
}

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
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  planType: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333', // Blue theme for type
    marginTop: 2,
  },
  indicator: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  details: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fafafa',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#1A4D6F'
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10, 
    lineHeight: 20
  },
  rationaleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#1A4D6F',
  },
  rationaleText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    fontStyle: 'italic', // Italicize the rationale for distinction
  },
});