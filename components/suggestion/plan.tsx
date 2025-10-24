import { Plan } from "@/lib/object_types";
import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PlanSuggestion(plans: any) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const toggleDetails = (planName: string) => {
    setSelectedPlan((prevName) => (prevName === planName ? null : planName));
  };

  const renderPlanItem = ({ item }: { item: Plan }) => {
    const isSelected = selectedPlan === item.name;

    return (
      <View style={[styles.card, isSelected && styles.cardExpanded]}>
        <TouchableOpacity
          onPress={() => toggleDetails(item.name)}
          style={styles.cardHeader}
          activeOpacity={0.8}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.planName}>{item.name}</Text>
            <Text style={styles.planType}>{item.type}</Text>
          </View>
          <Text style={styles.indicator}>{isSelected ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {isSelected && (
          <View style={styles.details}>
            <Text style={styles.sectionTitle}>Activity Details</Text>
            <Text style={styles.detailText}>{item.details}</Text>

            <Text style={styles.sectionTitle}>Why This Activity</Text>
            <Text style={styles.rationaleText}>{item.rationale}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>AI Suggested Wellness Plans 🎯</Text>
      <FlatList
        data={plans.data.plan_activities}
        keyExtractor={(item) => item.name}
        renderItem={renderPlanItem}
        extraData={selectedPlan}
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomColor: "#EAEAEA",
  },
  planName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#007AFF",
    fontFamily: "Noto Sans HK",
  },
  planType: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    marginTop: 2,
    fontFamily: "Noto Sans HK",
  },
  indicator: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 10,
  },
  details: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A4D6F",
    marginTop: 10,
    marginBottom: 4,
    fontFamily: "Noto Sans HK",
  },
  detailText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    fontFamily: "Noto Sans HK",
  },
  rationaleText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    fontStyle: "italic",
    fontFamily: "Noto Sans HK",
  },
});
