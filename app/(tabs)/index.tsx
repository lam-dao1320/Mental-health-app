// app/(tabs)/index.tsx — MindLog Home
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const goEmoji = () => router.push("/Emoji");
  const goDiary = () => router.push("/diary");
  const goHistory = () => router.push("/history");
  const goCheckin = () => router.push("/(questionnaire)");

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F9FB" />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome to MindLog</Text>
          <Text style={styles.subtitleText}>
            Track moods, jot thoughts, and see gentle trends
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionCard} onPress={goCheckin}>
            <View
              style={[styles.iconContainer, { backgroundColor: "#EAF6F2" }]}
            >
              <Ionicons name="help-circle" size={40} color="#ACD1C9" />
            </View>
            <Text style={styles.actionTitle}>Mental check‑in</Text>
            <Text style={styles.actionDescription}>
              Short, private questionnaire
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={goEmoji}>
            <View
              style={[styles.iconContainer, { backgroundColor: "#EAF6F2" }]}
            >
              <Ionicons name="happy" size={40} color="#ACD1C9" />
            </View>
            <Text style={styles.actionTitle}>Log mood</Text>
            <Text style={styles.actionDescription}>
              Pick an emoji and save today’s feeling
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={goDiary}>
            <View
              style={[styles.iconContainer, { backgroundColor: "#FFF3F1" }]}
            >
              <Ionicons name="create" size={40} color="#F49790" />
            </View>
            <Text style={styles.actionTitle}>Write diary</Text>
            <Text style={styles.actionDescription}>
              Capture a short note or reflection
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={goHistory}>
            <View
              style={[styles.iconContainer, { backgroundColor: "#FFF7E9" }]}
            >
              <Ionicons name="time" size={40} color="#F4CA90" />
            </View>
            <Text style={styles.actionTitle}>View history</Text>
            <Text style={styles.actionDescription}>
              Browse past entries and moods
            </Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Why MindLog?</Text>

          <View style={styles.featureItem}>
            <Ionicons name="pulse" size={24} color="#ACD1C9" />
            <Text style={styles.featureText}>Quick emoji mood logging</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="document-text" size={24} color="#F49790" />
            <Text style={styles.featureText}>Simple, focused diary input</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="trending-up" size={24} color="#F4CA90" />
            <Text style={styles.featureText}>Weekly trends at a glance</Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="lock-closed" size={24} color="#ACD1C9" />
            <Text style={styles.featureText}>Private by default</Text>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.getStartedButton} onPress={goEmoji}>
          <Text style={styles.getStartedText}>Start logging</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Brand background
  container: {
    flex: 1,
    backgroundColor: "#F9F9FB",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },

  // Header
  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  logo: {
    width: 420,
    height: 200,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1D1D1F",
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "Noto Sans HK",
  },
  subtitleText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Noto Sans HK",
  },

  // Actions
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  actionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3.84,
    elevation: 4,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1D1D1F",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "Noto Sans HK",
  },
  actionDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "Noto Sans HK",
  },

  // Features
  featuresContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1D1D1F",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Noto Sans HK",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FCFAE1",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 2,
  },
  featureText: {
    fontSize: 16,
    color: "#1D1D1F",
    marginLeft: 15,
    flex: 1,
    fontFamily: "Noto Sans HK",
  },

  // CTA
  getStartedButton: {
    backgroundColor: "#ACD1C9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3.84,
    elevation: 4,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginRight: 10,
    fontFamily: "Noto Sans HK",
  },
});
