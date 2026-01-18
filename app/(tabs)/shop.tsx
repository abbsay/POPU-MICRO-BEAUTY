import { Link, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCollections } from '../../api/shopify';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40) / 2;

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

    const renderItem = ({ item, index }: { item: any; index: number }) => (
        <Link href={`/collection/${encodeURIComponent(item.id)}`} asChild>
            <TouchableOpacity activeOpacity={0.9}>
                <Animated.View
                    entering={FadeInDown.delay(index * 100).springify().damping(12)}
                    layout={Layout.springify()}
                    style={styles.card}
                >
                    {item.image ? (
                        <Image source={{ uri: item.image.url }} style={styles.image} />
                    ) : (
                        <View style={[styles.image, { backgroundColor: '#eee' }]} />
                    )}
                    <View style={styles.overlay}>
                        <View style={styles.textContainer}>
                            <Text style={styles.collectionTitle}>{item.title}</Text>
                            <Text style={styles.exploreText}>EXPLORE</Text>
                        </View>
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </Link>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.header}>
                <Text style={styles.title}>COLLECTIONS</Text>
                <Text style={styles.subtitle}>Curated just for you</Text>
            </Animated.View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading curated collections...</Text>
                </View>
            ) : (
                <Animated.FlatList
                    data={collections}
                    keyExtractor={(item: any) => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.listContent}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
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
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: 1,
        color: '#000',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
        letterSpacing: 0.5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#999',
        fontSize: 16,
    },
    listContent: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    card: {
        width: COLUMN_WIDTH,
        height: COLUMN_WIDTH * 1.3, // Aspect ratio 1:1.3
        marginBottom: 15,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#f0f0f0',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.25)',
        justifyContent: 'flex-end',
        padding: 15,
    },
    textContainer: {

    },
    collectionTitle: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 18,
        letterSpacing: 0.5,
        marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    exploreText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1.5,
        opacity: 0.9,
    },
});
