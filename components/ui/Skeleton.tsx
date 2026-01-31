import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { DimensionValue, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';

interface SkeletonProps {
    width?: DimensionValue;
    height?: DimensionValue;
    style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 20, style }: SkeletonProps) {
    const translateX = useSharedValue(-1);

    useEffect(() => {
        translateX.value = withRepeat(
            withTiming(1, {
                duration: 1500,
                easing: Easing.linear
            }),
            -1, // Infinite repeat
            false // Do not reverse, restart from beginning
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        const translate = interpolate(
            translateX.value,
            [-1, 1],
            [-100, 100] // Percentage translation
        );
        return {
            transform: [{ translateX: `${translate}%` }],
        };
    });

    return (
        <View style={[styles.container, { width, height }, style]}>
            <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
                <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#E1E9EE', // Slightly blue-ish grey for premium feel
        borderRadius: 4,
        overflow: 'hidden', // Mask the shimmer
    },
});
