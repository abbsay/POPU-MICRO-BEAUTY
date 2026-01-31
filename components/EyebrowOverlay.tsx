
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

type EyebrowOverlayProps = {
    color?: string;
    initialScale?: number;
};

export const EyebrowOverlay = ({ color = '#4A3B2C', initialScale = 1 }: EyebrowOverlayProps) => {
    const scale = useSharedValue(initialScale);
    const savedScale = useSharedValue(initialScale);
    const rotation = useSharedValue(0);
    const savedRotation = useSharedValue(0);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            translateX.value = savedTranslateX.value + e.translationX;
            translateY.value = savedTranslateY.value + e.translationY;
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => {
            scale.value = savedScale.value * e.scale;
        })
        .onEnd(() => {
            savedScale.value = scale.value;
        });

    const rotationGesture = Gesture.Rotation()
        .onUpdate((e) => {
            rotation.value = savedRotation.value + e.rotation;
        })
        .onEnd(() => {
            savedRotation.value = rotation.value;
        });

    const composed = Gesture.Simultaneous(panGesture, pinchGesture, rotationGesture);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
            { rotateZ: `${rotation.value}rad` },
        ],
    }));

    return (
        <GestureDetector gesture={composed}>
            <Animated.View style={[styles.container, animatedStyle]}>
                {/* Placeholder for Eyebrow Asset - replacing with an icon for now */}
                <View style={styles.eyebrowVisual}>
                    <MaterialCommunityIcons name="eye-outline" size={80} color={color} />
                    {/* In the future, this will be an Image component source={require('path/to/eyebrow.png')} */}
                </View>

                {/* Visual guide for selection/editing state could go here */}
            </Animated.View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignSelf: 'center',
        top: '40%',
        // Being absolutely positioned in the center initially
    },
    eyebrowVisual: {
        // bounding box styles if needed
    }
});
