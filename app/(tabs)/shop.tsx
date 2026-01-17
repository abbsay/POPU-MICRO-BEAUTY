import { Link, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCollections } from '../../api/shopify';

const { width } = Dimensions.get('window');

export default function ShopScreen() {
    const [collections, setCollections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadCollections() {
            try {
                const data = await getCollections();
                setCollections(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        loadCollections();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <Text style={styles.title}>SHOP ALL</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text>Loading Categories...</Text>
                </View>
            ) : (
                <FlatList
                    data={collections}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <Link href={`/collection/${encodeURIComponent(item.id)}`} asChild>
                            <TouchableOpacity style={styles.card}>
                                {item.image && (
                                    <Image source={{ uri: item.image.url }} style={styles.image} />
                                )}
                                <View style={styles.overlay}>
                                    <Text style={styles.collectionTitle}>{item.title}</Text>
                                </View>
                            </TouchableOpacity>
                        </Link>
                    )}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 2,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 15,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    card: {
        width: (width - 45) / 2, // 2 columns
        height: 200,
        marginBottom: 15,
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#f6f6f6',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 10,
        alignItems: 'center',
    },
    collectionTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 0.5,
        textAlign: 'center',
    },
});
