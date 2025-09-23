import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const moods = ["😢", "😔", "😐", "😊", "😡"];

export default function MoodPicker() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling today?</Text>
      <View style={styles.moodRow}>
        {moods.map((mood, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.moodButton,
              selectedMood === mood && styles.moodButtonSelected,
            ]}
            onPress={() => setSelectedMood(mood)}
          >
            <Text style={styles.moodEmoji}>{mood}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {selectedMood && (
        <Text style={styles.result}>You selected: {selectedMood}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: "600",
  },
  moodRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  moodButton: {
    padding: 15,
    marginHorizontal: 8,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
  },
  moodButtonSelected: {
    backgroundColor: "#cce5ff",
  },
  moodEmoji: {
    fontSize: 32,
  },
  result: {
    fontSize: 18,
    marginTop: 20,
  },
});
