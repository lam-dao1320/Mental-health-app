import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type AIDisclaimerModalProps = {
  visible: boolean;
  onClose: (consent: boolean) => void;
};

export default function AIDisclaimerModal({
  visible,
  onClose,
}: AIDisclaimerModalProps) {
  const handleConsent = async (consent: boolean) => {
    await AsyncStorage.setItem("ai_consent", consent ? "true" : "false");
    onClose(consent);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>
            The Use of Artificial Intelligence Disclaimer in MindLog
          </Text>
          <ScrollView style={styles.scroll}>
            <Text style={styles.subtitle}>Prepared by</Text>
            <Text style={styles.text}>
              Carl Ezekiel Bautista{"\n"}Software Development Student{"\n"}
              School for Advanced Digital Technology{"\n"}
              Southern Alberta Institute of Technology (SAIT)
            </Text>

            <Text style={styles.sectionTitle}>Introduction</Text>
            <Text style={styles.text}>
              This document provides users with an understanding of how
              artificial intelligence (AI) features operate within MindLog.
              These AI-driven features help analyze diary entries and check-in
              data to improve the reliability and personalization of results.
              MindLog uses these insights to suggest activities that promote
              emotional well-being.
            </Text>

            <Text style={styles.sectionTitle}>AI Disclaimer</Text>
            <Text style={styles.text}>
              MindLog uses AI to analyze your diary entries and mental check-in
              scores. The AI suggests both immediate activities and long-term
              wellness plans. The generated results are for informational
              purposes only and should not replace professional medical care.
            </Text>

            <Text style={styles.sectionTitle}>Data We Process</Text>
            <Text style={styles.bullet}>
              • Mood status, diary text, date, and country information.
            </Text>
            <Text style={styles.bullet}>
              • Mental check-in scores: depression, anxiety, and overall
              wellness.
            </Text>
            <Text style={styles.bullet}>
              • Frequency of entries and check-in submissions.
            </Text>

            <Text style={styles.sectionTitle}>How AI Uses Your Data</Text>
            <Text style={styles.text}>
              The AI processes your most recent mood logs to provide instant
              activity suggestions and uses your mental check-in data to
              generate a structured long-term plan. It analyzes your data
              through five focus areas — Nature, Movement, Mind, Creative, and
              Reflection — and offers ranked recommendations with short
              rationales for each.
            </Text>

            <Text style={styles.sectionTitle}>What to Expect</Text>
            <Text style={styles.bullet}>
              • <Text style={styles.bold}>Immediate Relief Suggestions:</Text>{" "}
              Personalized activities such as journaling, breathing, or music.
            </Text>
            <Text style={styles.bullet}>
              • <Text style={styles.bold}>Long-Term Action Plans:</Text>{" "}
              Recommendations aligned with your check-in results, promoting
              wellness in Nature, Mind, or Movement areas.
            </Text>
            <Text style={styles.bullet}>
              • <Text style={styles.bold}>Activity Rationale:</Text> Each
              suggestion includes reasoning connected to your mental state or
              log patterns.
            </Text>

            <Text style={styles.sectionTitle}>Data Handling and Security</Text>
            <Text style={styles.bullet}>
              • <Text style={styles.bold}>Consent and Control:</Text> AI
              features remain disabled until you opt in. You can withdraw
              consent anytime via Settings.
            </Text>
            <Text style={styles.bullet}>
              • <Text style={styles.bold}>Training Choice:</Text> Your data is
              not used for model training unless you explicitly opt in. All
              deletions are honored.
            </Text>
            <Text style={styles.bullet}>
              • <Text style={styles.bold}>Data Protection:</Text> Information is
              encrypted in transit and at rest, with strict access control and
              auditing.
            </Text>
            <Text style={styles.bullet}>
              • <Text style={styles.bold}>Third Parties:</Text> Any external
              processors are bound by data protection agreements and cannot use
              your data for advertising.
            </Text>
            <Text style={styles.bullet}>
              • <Text style={styles.bold}>Region and Compliance:</Text> Data is
              stored in secure cloud regions compliant with standard privacy
              frameworks.
            </Text>

            <Text style={styles.sectionTitle}>Action and Consent</Text>
            <Text style={styles.text}>
              By selecting <Text style={styles.bold}>Agree</Text>, you allow
              MindLog to analyze your diary entries and mental check-in data
              using AI for activity and plan generation. MindLog does not sell
              or share your data externally. You can turn off AI anytime; some
              features may become unavailable. This content is not a substitute
              for medical advice.
            </Text>
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#F49790" }]}
              onPress={() => handleConsent(true)}
            >
              <Text style={styles.buttonText}>I Agree</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#DDD" }]}
              onPress={() => handleConsent(false)}
            >
              <Text style={[styles.buttonText, { color: "#333" }]}>
                Decline
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "90%",
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 20,
    maxHeight: "85%",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1D1D1F",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
    color: "#444",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 4,
    color: "#1D1D1F",
  },
  text: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 10,
    textAlign: "justify",
  },
  bullet: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 6,
    textAlign: "justify",
  },
  bold: {
    fontWeight: "700",
    color: "#1D1D1F",
  },
  scroll: {
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
