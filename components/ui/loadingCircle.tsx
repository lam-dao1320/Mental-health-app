import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

// MindLog Accent 1 Color
const BRAND_ACCENT_1 = '#F49790'; 

interface LoadingCircleProps {
  /**
   * Size of the loading indicator.
   * Defaults to 'large'.
   */
  size?: 'small' | 'large';

  /**
   * Optional color override for the indicator.
   * Defaults to MindLog Accent 1 (#F49790).
   */
  color?: string;

  /**
   * If true, the indicator will overlay the entire screen with a slight transparency.
   * Use this for blocking operations.
   * Defaults to false (for inline/rolling display).
   */
  fullScreenOverlay?: boolean;

  /**
   * Message to display under the loading circle.
   * Defaults to "AI evaluating mental health score..."
   */
  message?: string;
}

const LoadingCircle: React.FC<LoadingCircleProps> = ({ 
  size = 'large', 
  color = BRAND_ACCENT_1, 
  fullScreenOverlay = false,
  message = "AI evaluating mental health score...", 
}) => {
  
  // Use the overlay style only if specifically requested
  const containerStyle = fullScreenOverlay ? styles.overlayContainer : styles.centeredContainer;

  return (
    <View>
      <ActivityIndicator size={size} color={color} />
      {/* Display the message below the spinner */}
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // *** REVISED: Suitable for inline/rolling display. Centers content but doesn't force full height. ***
  centeredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20, // Add some vertical padding for breathing room
    width: '100%', // Take full width of parent to ensure horizontal centering
  },
  
  // Style for full-screen blocking overlay (when fullScreenOverlay={true})
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 249, 251, 0.8)',
    zIndex: 999,
  },

  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
    textAlign: 'center',
  }
});

export default LoadingCircle;