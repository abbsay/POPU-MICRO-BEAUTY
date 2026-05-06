import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  Easing
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the native splash screen from hiding automatically
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore errors
});

export function AnimatedSplashScreen({ children }: { children: React.ReactNode }) {
  const [isAppReady, setIsAppReady] = useState(false);
  const [isSplashAnimationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // App is ready immediately since we don't need artificial delays
    setIsAppReady(true);
  }, []);

  const opacity = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    // Breathing glow effect
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  // When the app is ready and the image is loaded, hide native splash and fade out
  const onImageLoaded = async () => {
    if (!isAppReady) return;
    
    try {
      await SplashScreen.hideAsync();
    } catch (e) {}

    // Quick fade out
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(setAnimationComplete)(true);
    });
  };

  useEffect(() => {
    if (isAppReady) {
      onImageLoaded();
    }
  }, [isAppReady]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: 1 + (glowOpacity.value - 0.4) * 0.2 }], // Slight pulse scale
  }));

  return (
    <View style={styles.container}>
      {/* App Content */}
      {isAppReady && children}

      {/* Custom Splash Overlay */}
      {!isSplashAnimationComplete && (
        <Animated.View pointerEvents="none" style={[styles.splashOverlay, animatedStyle]}>
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              {/* Glow / Halo Effect */}
              <Animated.View style={[styles.glow, glowStyle]} />
              <Animated.Image
                source={require('../assets/images/popu_logo.png')}
                style={styles.logo}
                resizeMode="contain"
                onLoadEnd={onImageLoaded}
              />
            </View>
            <Text style={styles.title}>Popu Micro Beauty</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -40 }], // Move slightly up so it's perfectly centered visually
  },
  logoContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#E8A0BF', // Soft pink brand color
    shadowColor: '#E8A0BF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 50,
    elevation: 20,
  },
  logo: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 1.5,
    marginTop: 40,
  },
});
