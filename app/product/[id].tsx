import { IconSymbol } from '@/components/ui/icon-symbol';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
    const { width } = useWindowDimensions();
    const { addItem, lines } = useCartStore();

    useEffect(() => {
        if (id) {
            loadProduct(id as string);
        }
    }, [id]);

    async function loadProduct(productId: string) {
        try {
            const data = await getProductById(productId);
            setProduct(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleAddToCart = async () => {
        if (product) {
            const variantId = product.variants?.edges[0]?.node.id;
            if (variantId) {
                await addItem(variantId, 1);
                Alert.alert('Success', 'Added to cart!');
            }
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.tint} />
            </View>
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
                        {product.priceRange.minVariantPrice.currencyCode} {product.priceRange.minVariantPrice.amount}
                    </Text>

                    {/* Add to Cart Button */}
                    <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                        <Text style={styles.addToCartText}>Add to Cart</Text>
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
        marginBottom: 16,
    },
    addToCartButton: {
        backgroundColor: Colors.light.tint,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 24,
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
});
