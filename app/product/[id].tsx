import { IconSymbol } from '@/components/ui/icon-symbol';
import { Skeleton } from '@/components/ui/Skeleton';
import * as Haptics from 'expo-haptics';
import { Link, router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import RenderHtml from 'react-native-render-html';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProductById } from '../../api/shopify';
import { Colors } from '../../constants/theme';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';

// ...

export default function ProductDetailScreen() {
    const { id, origin } = useLocalSearchParams();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [addStatus, setAddStatus] = useState<'idle' | 'adding' | 'added'>('idle');
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [quantity, setQuantity] = useState(1);
    const { width } = useWindowDimensions();
    const { addItem, lines } = useCartStore();
    const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();

    // Animation Refs & State
    const cartIconRef = useRef<View>(null);
    const [flyingItem, setFlyingItem] = useState<{ uri: string } | null>(null);
    const flyX = useSharedValue(0);
    const flyY = useSharedValue(0);
    const flyScale = useSharedValue(1);
    const flyOpacity = useSharedValue(1);
    const buttonScale = useSharedValue(1);

    const buttonAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: buttonScale.value }]
        };
    });

    const isWishlisted = product ? isInWishlist(product.id) : false;

    const toggleWishlist = () => {
        if (!product) return;
        if (isWishlisted) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist({
                id: product.id,
                title: product.title,
                price: currentVariant ? `${currentVariant.price.currencyCode} ${currentVariant.price.amount}` : '',
                image: product.images.edges[0]?.node.url,
                handle: product.handle || ''
            });
        }
    };

    useEffect(() => {
        if (id) {
            const decodedId = decodeURIComponent(id as string);
            loadProduct(decodedId);
        }
    }, [id]);

    async function loadProduct(productId: string) {
        try {
            const data = await getProductById(productId);
            setProduct(data);
            // Initialize with first variant's options
            if (data?.variants?.edges?.length > 0) {
                const defaultVariant = data.variants.edges[0].node;
                const initialOptions: Record<string, string> = {};
                defaultVariant.selectedOptions.forEach((opt: any) => {
                    initialOptions[opt.name] = opt.value;
                });
                setSelectedOptions(initialOptions);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const { currentVariant, isAvailable, isOutOfStock } = getVariantData(product, selectedOptions);

    const handleAddToCart = async () => {
        if (currentVariant && addStatus === 'idle') {
            // 1. Success Haptic
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Button Spring
            buttonScale.value = withSequence(
                withTiming(0.9, { duration: 100 }),
                withSpring(1, { damping: 10, stiffness: 100 })
            );

            // 2. Start Animation
            if (product.images.edges[0]?.node.url && cartIconRef.current) {
                cartIconRef.current.measure((x, y, w, h, pageX, pageY) => {
                    const iconCenterX = pageX + w / 2;
                    const iconCenterY = pageY + h / 2;

                    // Start position (roughly center of image gallery)
                    // We can refine this if we want exact start from the image
                    const startX = width / 2;
                    const startY = 200; // Approx center of 400px height gallery

                    // Initialize values
                    flyX.value = startX - 50; // centering the 100px flying image
                    flyY.value = startY - 50;
                    flyScale.value = 1;
                    flyOpacity.value = 1;

                    setFlyingItem({ uri: product.images.edges[0].node.url });

                    // Animate
                    flyX.value = withTiming(iconCenterX - 50, { duration: 600, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
                    flyY.value = withTiming(iconCenterY - 50, { duration: 600, easing: Easing.cubic });
                    flyScale.value = withTiming(0.1, { duration: 600 });
                    flyOpacity.value = withTiming(0, { duration: 600 }, (finished) => {
                        if (finished) {
                            runOnJS(setFlyingItem)(null);
                        }
                    });
                });
            }

            setAddStatus('adding');
            await addItem(currentVariant.id, quantity);
            setAddStatus('added');

            setTimeout(() => {
                setAddStatus('idle');
            }, 2000);
        }
    };

    const flyingStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: flyX.value },
                { translateY: flyY.value },
                { scale: flyScale.value }
            ],
            opacity: flyOpacity.value
        };
    });

    const handleOptionSelect = (optionName: string, value: string) => {
        setSelectedOptions(prev => ({
            ...prev,
            [optionName]: value
        }));
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Skeleton width={width} height={400} style={{ marginBottom: 20 }} />
                    <View style={{ padding: 16 }}>
                        <Skeleton width="60%" height={30} style={{ marginBottom: 10 }} />
                        <Skeleton width="40%" height={24} style={{ marginBottom: 20 }} />
                        <Skeleton width="100%" height={50} style={{ marginBottom: 20, borderRadius: 8 }} />
                        <Skeleton width="100%" height={200} />
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    if (!product) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Product not found</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            <Stack.Screen options={{
                title: '',
                headerTransparent: true,
                headerTintColor: '#000',
                headerBackTitle: '', // Keep clean title
                headerBackTitleVisible: false, // Explicitly hide text
                // Custom headerLeft removed to use system default
                headerRight: () => null // Removed icons from header as they are now in bottom bar
            }} />
            <ScrollView contentContainerStyle={styles.scrollContent}
                contentInsetAdjustmentBehavior="never" // Prevent automated insets from messing up the layout
            >
                {/* Image Gallery */}
                <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.gallery}>
                    {product.images.edges.map((edge: any, index: number) => {
                        const ImageComponent = index === 0 ? Animated.Image : Image;
                        const context = typeof origin === 'string' ? origin : 'shop';
                        const extraProps = index === 0 ? { sharedTransitionTag: `product-image-${context}-${product.id}` } : {};

                        return (
                            <ImageComponent
                                key={index}
                                source={{ uri: edge.node.url }}
                                style={[styles.image, { width }]}
                                {...extraProps}
                            />
                        );
                    })}
                </ScrollView>

                <View style={styles.infoContainer}>
                    <Text style={styles.title}>{product.title}</Text>

                    <Text style={styles.price}>
                        {currentVariant
                            ? `${currentVariant.price.currencyCode} ${currentVariant.price.amount}`
                            : 'Not Available'}
                    </Text>


                    {/* Variant Selectors */}
                    {product.options?.map((option: any) => {
                        // Skip "Title" option which is for products with no variants (Default Title)
                        if (option.name === 'Title') return null;

                        return (
                            <View key={option.id} style={styles.optionGroup}>
                                <Text style={styles.optionName}>{option.name}</Text>

                                {/* Use Dropdown for Size, Chips for others */}
                                {option.name === 'Size' ? (
                                    <OptionDropdown
                                        value={selectedOptions[option.name]}
                                        options={option.values}
                                        onSelect={(val) => handleOptionSelect(option.name, val)}
                                    />
                                ) : (
                                    <View style={styles.optionValues}>
                                        {option.values.map((value: string) => {
                                            const isSelected = selectedOptions[option.name] === value;
                                            return (
                                                <TouchableOpacity
                                                    key={value}
                                                    style={[
                                                        styles.optionChip,
                                                        isSelected && styles.optionChipSelected
                                                    ]}
                                                    onPress={() => handleOptionSelect(option.name, value)}
                                                >
                                                    <Text style={[
                                                        styles.optionText,
                                                        isSelected && styles.optionTextSelected
                                                    ]}>
                                                        {value}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>
                        );
                    })}

                    <View style={styles.description}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <RenderHtml
                            contentWidth={width - 32}
                            source={{ html: product.descriptionHtml }}
                            baseStyle={{ fontSize: 16, color: '#333', lineHeight: 24 }}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Flying Image for Animation */}
            {flyingItem && (
                <Animated.Image
                    source={{ uri: flyingItem.uri }}
                    style={[
                        styles.flyingImage,
                        flyingStyle,
                    ]}
                />
            )}

            {/* Bottom Action Bar */}
            <View style={[styles.bottomBar, { paddingBottom: 20 }]}>
                {/* 1. Home */}
                <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.iconButton}>
                    <IconSymbol name="house.fill" size={24} color="#000" />
                    <Text style={styles.iconLabel}>Home</Text>
                </TouchableOpacity>

                {/* 2. Quantity */}
                <View style={styles.quantityControl}>
                    <TouchableOpacity
                        onPress={() => setQuantity(Math.max(1, quantity - 1))}
                        style={styles.qtyButton}
                    >
                        <Text style={styles.qtyButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{quantity}</Text>
                    <TouchableOpacity
                        onPress={() => setQuantity(quantity + 1)}
                        style={styles.qtyButton}
                    >
                        <Text style={styles.qtyButtonText}>+</Text>
                    </TouchableOpacity>
                </View>

                {/* 3. Add to Cart */}
                <Animated.View style={[{ flex: 1 }, buttonAnimatedStyle]}>
                    <TouchableOpacity
                        style={[
                            styles.addToCartButtonFixed,
                            (!isAvailable) && styles.disabledButton,
                            addStatus === 'added' && { backgroundColor: '#4CAF50' },
                            addStatus === 'adding' && { opacity: 0.7 }
                        ]}
                        onPress={handleAddToCart}
                        disabled={addStatus !== 'idle' || !isAvailable}
                        activeOpacity={0.9}
                    >
                        {addStatus === 'adding' ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.addToCartTextFixed}>
                                {addStatus === 'added' ? 'Added' : isAvailable ? 'Add to Cart' : 'Sold Out'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </Animated.View>

                {/* 4. Cart */}
                <Link href="/cart" asChild>
                    <TouchableOpacity
                        style={styles.iconButton}
                    >
                        <View ref={cartIconRef} collapsable={false}>
                            <IconSymbol name="bag" size={24} color="#000" />
                            {lines.length > 0 && (
                                <View style={styles.badgeFixed}>
                                    <Text style={styles.badgeTextFixed}>{lines.length}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.iconLabel}>Cart</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </SafeAreaView>
    );
}

// ... styles ...


function OptionDropdown({ value, options, onSelect }: { value: string, options: string[], onSelect: (val: string) => void }) {
    const [visible, setVisible] = useState(false);

    return (
        <>
            <TouchableOpacity style={styles.dropdownButton} onPress={() => setVisible(true)}>
                <Text style={styles.dropdownButtonText}>{value || 'Select Option'}</Text>
                <IconSymbol name="chevron.down" size={20} color="#000" />
            </TouchableOpacity>

            <Modal visible={visible} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setVisible(false)}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Size</Text>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <IconSymbol name="xmark" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {options.map(opt => (
                                <TouchableOpacity
                                    key={opt}
                                    style={[styles.modalOption, opt === value && styles.modalOptionSelected]}
                                    onPress={() => {
                                        onSelect(opt);
                                        setVisible(false);
                                    }}
                                >
                                    <Text style={[styles.modalOptionText, opt === value && styles.modalOptionTextSelected]}>
                                        {opt}
                                    </Text>
                                    {opt === value && <IconSymbol name="checkmark" size={20} color="#000" />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

// Helper to find matching variant
function getVariantData(product: any, selectedOptions: Record<string, string>) {
    if (!product || !product.variants) return { currentVariant: null, isAvailable: false, isOutOfStock: false };

    const variantEdge = product.variants.edges.find((edge: any) => {
        return edge.node.selectedOptions.every((opt: any) => {
            return selectedOptions[opt.name] === opt.value;
        });
    });

    const currentVariant = variantEdge?.node || null;
    const isAvailable = currentVariant?.availableForSale ?? false;
    const isOutOfStock = !!currentVariant && !isAvailable;

    return {
        currentVariant,
        isAvailable,
        isOutOfStock
    };
}

const styles = StyleSheet.create({
    backButton: {
        marginLeft: 0,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: '#fff',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 100, // Add padding for bottom bar
    },
    gallery: {
        height: 400,
    },
    image: {
        height: 400,
        resizeMode: 'cover',
    },
    infoContainer: {
        padding: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: '#fff',
        marginTop: -20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#000',
    },
    price: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.light.tint,
        marginBottom: 24,
    },
    optionGroup: {
        marginBottom: 16,
    },
    optionName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        color: '#666',
        letterSpacing: 1,
    },
    optionValues: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    optionChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12, // Square rounded
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
    },
    optionChipSelected: {
        borderColor: '#000',
        backgroundColor: '#000',
    },
    optionText: {
        fontSize: 14,
        color: '#333',
    },
    optionTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 8,
    },
    description: {
        marginTop: 8,
    },

    // Bottom Bar Styles
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        // Shadow for elevation
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 5,
    },
    iconButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
    },
    iconLabel: {
        fontSize: 10,
        color: '#666',
        marginTop: 4,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        height: 40,
    },
    qtyButton: {
        width: 32,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyButtonText: {
        fontSize: 18,
        color: '#333',
    },
    qtyText: {
        width: 30,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500',
    },
    addToCartButtonFixed: {
        flex: 1,
        backgroundColor: Colors.light.tint,
        height: 44,
        borderRadius: 12, // Square rounded
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 12,
    },
    addToCartTextFixed: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.5,
        backgroundColor: '#ccc',
    },
    badgeFixed: {
        position: 'absolute',
        right: -6,
        top: -4,
        backgroundColor: Colors.light.tint,
        borderRadius: 8,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fff',
    },
    badgeTextFixed: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    // Dropdown Styles
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12, // Square rounded
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#f9f9f9',
    },
    dropdownButtonText: {
        fontSize: 16,
        color: '#333',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalOptionSelected: {
        backgroundColor: '#f5f5f5',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333',
    },
    modalOptionTextSelected: {
        fontWeight: 'bold',
    },
    flyingImage: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        zIndex: 9999,
        top: 0,
        left: 0,
        resizeMode: 'cover',
    },
});
