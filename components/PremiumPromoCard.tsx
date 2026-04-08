import { Canvas, LinearGradient, Rect, vec } from "@shopify/react-native-skia";
import React, { useEffect } from "react";
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { Easing, useDerivedValue, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

interface PremiumPromoCardProps {
    title: string;
    subtitle: string;
    imageUri: string;
    buttonText?: string;
    onPress?: () => void;
}

export function PremiumPromoCard({ title, subtitle, imageUri, buttonText = "Explore", onPress }: PremiumPromoCardProps) {
    const { width } = useWindowDimensions();
    const height = 220;

    // Animation for the shimmer
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withRepeat(
            withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    // Computed Skia values for the gradient
    // We want a subtle light sweep across the card
    const startVec = useDerivedValue(() => {
        return vec(0, 0);
    }, [progress]);

    const endVec = useDerivedValue(() => {
        return vec(width, height);
    }, [progress]);

    return (
        <View style={[styles.container, { height, width: width - 40 }]}>
            <ImageBackground
                source={{ uri: imageUri }}
                style={styles.bgImage}
                imageStyle={{ borderRadius: 16 }}
            >
                {/* Dark Overlay for text readability */}
                <View style={styles.overlay} />

                {/* Skia Shimmer Layer */}
                <View style={StyleSheet.absoluteFill}>
                    <Canvas style={{ flex: 1 }}>
                        <Rect x={0} y={0} width={width - 40} height={height} opacity={0.3}>
                            <LinearGradient
                                start={vec(0, 0)}
                                end={vec(width - 40, height)}
                                colors={["transparent", "rgba(255,255,255,0.2)", "transparent"]}
                                positions={[0, 0.5, 1]}
                            />
                        </Rect>
                    </Canvas>
                </View>

                <View style={styles.content}>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subtitle}>{subtitle}</Text>
                    </View>

                    <TouchableOpacity activeOpacity={0.8} style={styles.button} onPress={onPress}>
                        <Text style={styles.buttonText}>{buttonText}</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 40,
        marginHorizontal: 20,
        borderRadius: 16,
        overflow: 'hidden',
        // Shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    bgImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 16,
    },
    content: {
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    textContainer: {
        flex: 1,
        paddingRight: 10,
    },
    title: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8,
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 15,
        fontWeight: '500',
    },
    button: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
        backdropFilter: 'blur(10px)', // For web, on native we might need BlurView but simple version for now
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 13,
    }
});
