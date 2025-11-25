import { Plan } from "@/lib/object_types";
import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PlanSuggestion(data: any) {
  // console.log("PlanSuggestion received data:", data.data);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

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
      <TouchableOpacity
        onPress={() => {setShowDetails(!showDetails)}}
        style={{flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 8 }}
      >
        <Text style={styles.header}>AI Suggested Plans 🎯</Text>
        <Text style={styles.indicator}>{showDetails ? "▲" : "▼"}</Text>
      </TouchableOpacity>
      <Text style={[styles.subHeader, showDetails && {marginBottom: 16}]}>{data.data.chosen_type}</Text>
      
      {showDetails &&
      <FlatList
        data={data.data.plan_activities}
        keyExtractor={(item) => item.name}
        renderItem={renderPlanItem}
        extraData={selectedPlan}
        scrollEnabled={false}
        contentContainerStyle={{ gap: 12 }}
      />}
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    width: 350,
    backgroundColor: "transparent",
    padding: 20,
  },
  header: {
    flex: 1,
    marginRight: 20,
    alignContent: "flex-start",
    fontSize: 22,
    fontWeight: "800",
    color: "#1D1D1F",
    textAlign: "center",
    fontFamily: "Noto Sans HK",
  },
  subHeader: {
    fontSize: 15,
    color: "#98c9bdff",
    textAlign: "center",
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
    backgroundColor: "#f4fffcff",
    borderColor: "#98c9bdff",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  planName: {
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
    color: "#98c9bdff",
  },
  details: {
    backgroundColor: "#f4fffcff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopColor: "#98c9bdff",
    borderTopWidth: 0.8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A4D6F",
    // marginTop: 4,
    marginBottom: 4,
    fontFamily: "Noto Sans HK",
  },
  detailText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 10, 
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
