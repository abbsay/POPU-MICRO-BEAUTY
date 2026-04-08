import { ProductCard } from '@/components/ProductCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCollectionProducts } from '../../api/shopify';
import { Colors } from '../../constants/theme';

export default function CollectionScreen() {
    const { id } = useLocalSearchParams();
    const [collection, setCollection] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const toggleViewMode = () => {
        setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
    };

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
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <Stack.Screen options={{
                headerShown: true,
                title: collection.title,
                headerBackTitle: ' ', // Force space to hide back title on next screen
                headerTintColor: '#000',
                headerTransparent: false,
                headerShadowVisible: false, // Cleaner look
                headerStyle: { backgroundColor: '#fff' },
                headerRight: () => (
                    <TouchableOpacity
                        onPress={toggleViewMode}
                        style={styles.headerButton}
                    >
                        <IconSymbol
                            name={viewMode === 'grid' ? 'list.bullet' : 'square.grid.2x2'}
                            size={22}
                            color="#000"
                        />
                    </TouchableOpacity>
                )
            }} />

            <FlatList
                key={viewMode} // Force re-render when changing columns
                data={products}
                keyExtractor={(item) => item.id}
                numColumns={viewMode === 'grid' ? 2 : 1}
                columnWrapperStyle={viewMode === 'grid' ? styles.columnWrapper : undefined}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <ProductCard product={item} viewMode={viewMode} origin="collection" />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text>No products in this collection.</Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
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
    headerButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 10,        // Reduced top padding
        paddingBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    emptyState: {
        marginTop: 50,
        alignItems: 'center',
    }
});
