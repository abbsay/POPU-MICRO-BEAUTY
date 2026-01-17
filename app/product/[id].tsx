import { IconSymbol } from '@/components/ui/icon-symbol';
import { Skeleton } from '@/components/ui/Skeleton';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import { getProductById } from '../../api/shopify';
import { Colors } from '../../constants/theme';
import { useCartStore } from '../../store/cartStore';

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [addStatus, setAddStatus] = useState<'idle' | 'adding' | 'added'>('idle');
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const { width } = useWindowDimensions();
    const { addItem, lines } = useCartStore();

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

    const { currentVariant, isAvailable } = getVariantData(product, selectedOptions);

    const handleAddToCart = async () => {
        if (currentVariant && addStatus === 'idle') {
            setAddStatus('adding');
            await addItem(currentVariant.id, 1);
            setAddStatus('added');

            setTimeout(() => {
                setAddStatus('idle');
            }, 2000);
        }
    };

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
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{
                title: '',
                headerTransparent: true,
                headerTintColor: '#000',
                headerRight: () => (
                    <Link href="/cart" asChild>
                        <TouchableOpacity style={{ marginRight: 16 }}>
                            <View>
                                <IconSymbol name="bag" size={24} color="#000" />
                                {lines.length > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{lines.length}</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    </Link>
                )
            }} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Image Gallery */}
                <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.gallery}>
                    {product.images.edges.map((edge: any, index: number) => (
                        <Image key={index} source={{ uri: edge.node.url }} style={[styles.image, { width }]} />
                    ))}
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

                    {/* Add to Cart Button */}
                    <TouchableOpacity
                        style={[
                            styles.addToCartButton,
                            (!currentVariant) && styles.disabledButton,
                            addStatus === 'added' && { backgroundColor: '#4CAF50' },
                            addStatus === 'adding' && { opacity: 0.7 }
                        ]}
                        onPress={handleAddToCart}
                        disabled={addStatus !== 'idle' || !currentVariant}
                    >
                        {addStatus === 'adding' ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.addToCartText}>
                                {addStatus === 'added' ? 'Added to Cart!' : isAvailable ? 'Add to Cart' : 'Unavailable'}
                            </Text>
                        )}
                    </TouchableOpacity>

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
        </SafeAreaView>
    );
}

import { Modal } from 'react-native';

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
    if (!product || !product.variants) return { currentVariant: null, isAvailable: false };

    const variantEdge = product.variants.edges.find((edge: any) => {
        return edge.node.selectedOptions.every((opt: any) => {
            return selectedOptions[opt.name] === opt.value;
        });
    });

    return {
        currentVariant: variantEdge?.node || null,
        isAvailable: !!variantEdge
    };
}

const styles = StyleSheet.create({
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
        paddingBottom: 40,
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
        marginTop: -20, // Overlap slightly with image
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'System',
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
        borderRadius: 20,
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
    addToCartButton: {
        backgroundColor: Colors.light.tint,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 16,
    },
    disabledButton: {
        opacity: 0.5,
        backgroundColor: '#ccc',
    },
    addToCartText: {
        color: '#fff',
        fontSize: 16,
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
    badge: {
        position: 'absolute',
        right: -6,
        top: -6,
        backgroundColor: Colors.light.tint,
        borderRadius: 8,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
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
        borderRadius: 8,
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
});
