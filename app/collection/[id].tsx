import { IconSymbol } from '@/components/ui/icon-symbol';
import { Link, router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCollectionProducts } from '../../api/shopify';
import { Colors } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function CollectionScreen() {
    const { id } = useLocalSearchParams();
    const [collection, setCollection] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadCollectionData(id as string);
        }
    }, [id]);

    async function loadCollectionData(collectionId: string) {
        try {
            // Ensure ID is decoded if passed as URL param
            const decodedId = decodeURIComponent(collectionId);
            const data = await getCollectionProducts(decodedId);
            setCollection(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.tint} />
            </SafeAreaView>
        );
    }

    if (!collection) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <Text>Collection not found</Text>
            </SafeAreaView>
        );
    }

    const products = collection.products.edges.map((edge: any) => edge.node);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Stack.Screen options={{
                headerShown: true,
                title: collection.title,
                headerBackTitle: '', // Hides back title on iOS
                headerTintColor: '#000',
                headerTransparent: false,
                headerLeft: () => (
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{
                            marginLeft: 10,
                            width: 40,
                            height: 40,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 12,
                            backgroundColor: 'transparent',
                        }}
                    >
                        <IconSymbol name="chevron.left" size={28} color="#000" />
                    </TouchableOpacity>
                ),
            }} />

            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <Link key={item.id} href={`/product/${encodeURIComponent(item.id)}`} asChild>
                        <TouchableOpacity style={styles.card}>
                            <View style={styles.imageWrapper}>
                                <Image
                                    source={{ uri: item.images.edges[0]?.node.url }}
                                    style={styles.image}
                                />
                            </View>
                            <Text style={styles.productTitle} numberOfLines={1}>
                                {item.title}
                            </Text>
                            <Text style={styles.price}>
                                {item.priceRange.minVariantPrice.currencyCode} {item.priceRange.minVariantPrice.amount}
                            </Text>
                        </TouchableOpacity>
                    </Link>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text>No products in this collection.</Text>
                    </View>
                }
            />
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
        backgroundColor: '#fff',
    },
    listContent: {
        padding: 15,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    card: {
        width: (width - 45) / 2,
        marginBottom: 30,
    },
    imageWrapper: {
        backgroundColor: '#f6f6f6',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 12,
    },
    image: {
        width: '100%',
        height: 180,
        resizeMode: 'cover',
    },
    productTitle: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 6,
        color: '#000',
    },
    price: {
        fontSize: 13,
        color: '#666',
    },
    emptyState: {
        marginTop: 50,
        alignItems: 'center',
    }
});
