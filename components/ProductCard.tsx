import { IconSymbol } from '@/components/ui/icon-symbol';
import { useToast } from '@/components/ui/Toast';
import { useCartStore } from '@/store/cartStore';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Platform, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import Animated from 'react-native-reanimated';

interface ProductCardProps {
    product: any;
    style?: any;
    viewMode?: 'grid' | 'list';
    origin?: string;
}

export function ProductCard({ product, style, viewMode = 'grid', origin = 'shop' }: ProductCardProps) {
    const { width } = useWindowDimensions();
    const addItem = useCartStore((state) => state.addItem);
    const { showToast } = useToast();

    // Grid: (Screen Width - 40px padding - 15px gap) / 2
    const columnWidth = Math.floor((width - 40 - 16) / 2);

    const imageUrl = product.images?.edges?.[0]?.node?.url;
    const price = product.priceRange?.minVariantPrice;
    const variantId = product.variants?.edges?.[0]?.node?.id; // Default to first variant

    const isList = viewMode === 'list';
    const transitionTag = `product-image-${origin}-${product.id}`;

    const handleQuickAdd = async (e: any) => {
        // Stop propagation
        e.preventDefault && e.preventDefault();
        // e.stopPropagation && e.stopPropagation(); // Try this if supported by the event wrapper

        console.log('[ProductCard] Quick Add Pressed');
        if (!variantId) {
            console.log('[ProductCard] No variantId found for quick add');
            // Fallback: Navigate to product page if no variant ID (e.g. requires selection)
            router.push(`/product/${encodeURIComponent(product.id)}?origin=${origin}`);
            return;
        }

        console.log('[ProductCard] Adding variant:', variantId);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        try {
            await addItem(variantId, 1);
            showToast('Added to bag');
        } catch (error) {
            console.error('[ProductCard] Add to cart failed:', error);
            showToast('Failed to add');
        }
    };

    return (
        <View style={[
            isList ? styles.cardContainerList : styles.cardContainer,
            !isList && { width: columnWidth },
            style
        ]}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push(`/product/${encodeURIComponent(product.id)}?origin=${origin}`)}
                style={[styles.touchableArea, isList && styles.touchableAreaList]}
            >
                <View style={[
                    isList ? styles.imageWrapperList : styles.imageWrapper,
                    !isList && { height: columnWidth * 1.1 } // Taller aspect ratio for grid
                ]}>
                    {imageUrl ? (
                        <Animated.Image
                            source={{ uri: imageUrl }}
                            style={styles.image}
                            resizeMode="cover" // Modern look uses cover usually, but let's stick to contain if images are irregular, or cover if we want uniformity. Let's try cover with a subtle bg.
                        // switching to contain for safety on white bg as originally planned, but let's try a mix
                        />
                    ) : (
                        <View style={[styles.image, { backgroundColor: '#f0f0f0' }]} />
                    )}

                    {!isList && (
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={handleQuickAdd}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <IconSymbol name="plus" size={20} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={isList ? styles.infoList : styles.infoGrid}>
                    <Text
                        style={[styles.productTitle, isList && styles.productTitleList]}
                        numberOfLines={2}
                    >
                        {product.title}
                    </Text>
                    {price && (
                        <Text style={styles.price}>
                            {price.currencyCode} {price.amount}
                        </Text>
                    )}
                    {isList && (
                        <TouchableOpacity
                            style={styles.addButtonList}
                            onPress={handleQuickAdd}
                        >
                            <Text style={styles.addButtonTextList}>Add to Bag</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        marginBottom: 24,
        backgroundColor: '#fff',
        borderRadius: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    cardContainerList: {
        marginBottom: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 6,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    touchableArea: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    touchableAreaList: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'center',
    },

    // Image
    imageWrapper: {
        backgroundColor: '#f9f9f9', // Light gray bg for images
        overflow: 'hidden',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageWrapperList: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
        overflow: 'hidden',
        marginRight: 16,
    },
    image: {
        width: '100%',
        height: '100%',
    },

    // Info
    infoGrid: {
        padding: 12,
    },
    infoList: {
        flex: 1,
        justifyContent: 'center',
    },

    // Typography
    productTitle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
        color: '#333',
        lineHeight: 20,
    },
    productTitleList: {
        fontSize: 15,
        marginBottom: 4,
    },
    price: {
        fontSize: 15,
        color: '#000',
        fontWeight: '700',
    },

    // Add Button Grid
    addButton: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },

    // Add Button List
    addButtonList: {
        marginTop: 8,
        alignSelf: 'flex-start',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    addButtonTextList: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
    }
});
