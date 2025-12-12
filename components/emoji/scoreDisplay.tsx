import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, G as SvgG } from 'react-native-svg';

// --- Brand Colors (Defined outside the component) ---
const BRAND_PRIMARY_COLOR = '#F9F9FB';
const BRAND_ACCENT_1 = '#F49790'; // Main progress bar color

// --- Data Interfaces (Based on your newScoreSchema) ---
interface NewScoreData {
  depression_score: number;
  anxiety_score: number;
  overall_score: number;
  summary: string;
}

// --- Main Component Props (Updated) ---
interface NewScoreDisplayProps {
    data: NewScoreData;
    onClose: () => void;
}

interface ScoreCircleProps {
  label: string;
  score: number;
  type: 'depression' | 'anxiety' | 'overall';
}

// --- Mapping Logic (Define these outside or import them) ---

const MAX_SCORE = 40; 
interface ScoreRange { level: string; max: number; }
// Define these full arrays based on your guide:
const DepressionRanges: ScoreRange[] = [{ level: 'Minimal', max: 4 }, { level: 'Mild', max: 13 }, { level: 'Moderate', max: 20 }, { level: 'Mod. Severe', max: 27 }, { level: 'Severe', max: MAX_SCORE }];
const AnxietyRanges: ScoreRange[] = [{ level: 'Minimal', max: 4 }, { level: 'Mild', max: 9 }, { level: 'Moderate', max: 14 }, { level: 'Severe', max: MAX_SCORE }];
const OverallRanges: ScoreRange[] = [{ level: 'Excellent', max: 8 }, { level: 'Good', max: 16 }, { level: 'Moderate', max: 24 }, { level: 'Significant', max: 32 }, { level: 'Severe', max: MAX_SCORE }];

const getLevelAndProgress = (score: number, type: 'depression' | 'anxiety' | 'overall') => {
  let ranges: ScoreRange[] = [];
  switch (type) {
    case 'depression': ranges = DepressionRanges; break;
    case 'anxiety': ranges = AnxietyRanges; break;
    case 'overall': ranges = OverallRanges; break;
  }
  const level = ranges.find(range => score <= range.max)?.level || 'N/A';
  const percentage = Math.min((score / MAX_SCORE) * 100, 100);
  return { level, percentage };
};

// --- SVG Circular Progress Bar Component (using react-native-svg) ---
const CircularProgressBar: React.FC<{ percentage: number, color: string, children: React.ReactNode }> = ({ percentage, color, children }) => {
  const radius = 40;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const progressPercentage = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;
  const size = 2 * radius + strokeWidth; // 100

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Group to rotate the SVG content */}
      <SvgG rotation={-90} origin={`${size / 2}, ${size / 2}`}>
        
        {/* Background track (Light Arc) */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#EAEAEA"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress track (Colored Arc) */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </SvgG>

      {/* Content inside the circle (children are absolute positioned React Native elements) */}
      <View style={{ position: 'absolute', top: 0, left: 0, width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        {children}
      </View>
    </Svg>
  );
};


// --- Helper Component for the Score Circles ---
const ScoreCircle: React.FC<ScoreCircleProps> = ({ label, score, type }) => {
  const { level, percentage } = getLevelAndProgress(score, type);

  const emoji = (type === 'overall' && score < 17) ? '😊' : 
                (score < 10) ? '🙂' : 
                (score < 25) ? '😐' : 
                '😔';
  

  return (
    <View style={styles.scoreContainer}>
      {/* Label above the circle */}
      <Text style={styles.scoreLabel}>{label}</Text>
      
      {/* Circular Progress Bar */}
      <CircularProgressBar 
        percentage={percentage} 
        color={label === "DEPRESSION" ? '#F49790' : label === "ANXIETY" ? '#ACD1C9' : '#F4CA90'}>
        {/* Content inside the circle (React Native Text components) */}
        <Text style={styles.levelText}>
          {level.toUpperCase()}
        </Text>
        <Text style={styles.emojiText}>
          {emoji}
        </Text>
      </CircularProgressBar>
    </View>
  );
};


// --- Main Component ---
const NewScoreDisplay: React.FC<NewScoreDisplayProps> = ({ data, onClose }) => {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <View style={[styles.card, { backgroundColor: BRAND_PRIMARY_COLOR }]}>
      
      {/* Close Button (TouchableOpacitiy for better UX) */}
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={onClose}
        accessibilityLabel="Close evaluation display"
      >
        <Text style={styles.closeButtonText}>&times;</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Daily Wellness Evaluation</Text>
      
      {/* Container for the three score circles */}
      <View style={styles.scoresRow}>
        <ScoreCircle label="DEPRESSION" score={data.depression_score} type="depression" />
        <ScoreCircle label="ANXIETY" score={data.anxiety_score} type="anxiety" />
        <ScoreCircle label="OVERALL" score={data.overall_score} type="overall" />
      </View>

      {/* Summary under the three circles */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>{data.summary}</Text>
      </View>

      {/* Toggle extra info */}
      <TouchableOpacity
        style={styles.knowMoreBtn}
        onPress={() => setShowInfo(!showInfo)}
      >
        <Text style={styles.knowMoreText}>
          {showInfo ? "Hide details" : "Know More"}
        </Text>
        <Ionicons
          name={showInfo ? "chevron-up" : "chevron-down"}
          size={16}
          color="#1D1D1F"
        />
      </TouchableOpacity>

      {showInfo && (
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Score Guide</Text>
          <Text style={styles.infoText}>
            0–8: Excellent mental wellness
          </Text>
          <Text style={styles.infoText}>
            9–16: Good with minor concerns
          </Text>
          <Text style={styles.infoText}>
            17–24: Moderate concerns – consider support
          </Text>
          <Text style={styles.infoText}>
            25–32: Significant concerns – professional support recommended
          </Text>
          <Text style={styles.infoText}>
            33–40: Severe concerns – immediate support strongly recommended
          </Text>
        </View>
      )}
    </View>
  );
};

export default NewScoreDisplay;


// --- React Native Stylesheet ---
const styles = StyleSheet.create({
  card: {
    padding: 25,
    paddingTop: 45, // Space for the close button
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8, // Android shadow
    maxWidth: 700,
    width: Dimensions.get('window').width * 0.9, // Adjust width for mobile screen
    marginVertical: 20,
    alignSelf: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 15,
    padding: 5,
  },
  closeButtonText: {
    fontSize: 28,
    color: '#555',
  },
  scoresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 10,
  },
  scoreContainer: {
    alignItems: 'center',
    width: '30%',
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    position: 'absolute',
    top: 30, // Adjust vertical positioning within the circle area (100x100)
  },
  emojiText: {
    fontSize: 16,
    position: 'absolute',
    top: 50, // Position below the level text
  },
  summaryContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FFF0F0', // Light version of Accent 1
    borderRadius: 8,
    // borderTopWidth: 1,
    // borderTopColor: BRAND_ACCENT_1,
    width: '100%',
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  knowMoreBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    marginTop: 10,
  },
  knowMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1D1D1F",
    marginRight: 6,
    fontFamily: "Noto Sans HK",
  },
  infoBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F9F9FB",
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
    color: "#1D1D1F",
    fontFamily: "Noto Sans HK",
  },
  infoText: {
    fontSize: 13,
    color: "#444",
    marginBottom: 4,
    fontFamily: "Noto Sans HK",
  },
});