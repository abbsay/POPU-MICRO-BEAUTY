import { IconSymbol } from '@/components/ui/icon-symbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProducts, searchProducts } from '../../api/shopify';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40) / 2;

const SEARCH_HISTORY_KEY = 'search_history';

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const [popularProducts, setPopularProducts] = useState<any[]>([]);

    useEffect(() => {
        loadHistory();
        loadPopularProducts();
    }, []);

    const loadHistory = async () => {
        try {
            const stored = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
            if (stored) {
                setHistory(JSON.parse(stored));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const loadPopularProducts = async () => {
        try {
            const data = await getProducts(4); // Fetch 4 popular products
            setPopularProducts(data);
        } catch (e) {
            console.error(e);
        }
    };

    const saveHistory = async (text: string) => {
        try {
            const newHistory = [text, ...history.filter(h => h !== text)].slice(0, 10);
            setHistory(newHistory);
            await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
        } catch (e) {
            console.error(e);
        }
    };

    const clearHistory = async () => {
        setHistory([]);
        await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    };

    const handleSearch = async (text: string = query) => {
        if (!text.trim()) return;
        setQuery(text);
        setLoading(true);
        setHasSearched(true);
        saveHistory(text.trim());
        Keyboard.dismiss();
        try {
            const data = await searchProducts(text);
            setResults(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const clearSearch = () => {
        setQuery('');
        setResults([]);
        setHasSearched(false);
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => (
        <Link key={item.id} href={`/product/${encodeURIComponent(item.id)}`} asChild>
            <TouchableOpacity activeOpacity={0.9}>
                <Animated.View
                    entering={FadeInDown.delay(index * 50).springify()}
                    layout={Layout.springify()}
                    style={styles.card}
                >
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
                </Animated.View>
            </TouchableOpacity>
        </Link>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <Text style={styles.title}>SEARCH</Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <IconSymbol name="magnifyingglass" size={20} color="#666" />
                    <TextInput
                        placeholder="Search products..."
                        style={styles.input}
                        placeholderTextColor="#999"
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={() => handleSearch(query)}
                        returnKeyType="search"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={clearSearch} style={styles.clearBtn}>
                            <IconSymbol name="xmark.circle.fill" size={18} color="#ccc" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text>Searching...</Text>
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    {!hasSearched && query.length === 0 ? (
                        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                            {/* History Section */}
                            {history.length > 0 && (
                                <View style={styles.section}>
                                    <View style={styles.sectionHeaderRow}>
                                        <Text style={styles.sectionTitle}>RECENT SEARCHES</Text>
                                        <TouchableOpacity onPress={clearHistory}>
                                            <Text style={styles.clearHistoryText}>Clear</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.tagsWrapper}>
                                        {history.map((tag, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={styles.historyTag}
                                                onPress={() => handleSearch(tag)}
                                            >
                                                <IconSymbol name="clock" size={12} color="#999" style={{ marginRight: 6 }} />
                                                <Text style={styles.tagText}>{tag}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Popular Products */}
                            <View style={[styles.section, { marginTop: 20 }]}>
                                <Text style={styles.sectionTitle}>POPULAR NOW</Text>
                                <View style={styles.popularGrid}>
                                    {popularProducts.map((item, index) => (
                                        <Link key={item.id} href={`/product/${encodeURIComponent(item.id)}`} asChild>
                                            <TouchableOpacity style={styles.popularCard}>
                                                <Image source={{ uri: item.images.edges[0]?.node.url }} style={styles.popularImage} />
                                                <View style={styles.popularInfo}>
                                                    <Text style={styles.popularTitle} numberOfLines={2}>{item.title}</Text>
                                                    <Text style={styles.popularPrice}>{item.priceRange.minVariantPrice.currencyCode} {item.priceRange.minVariantPrice.amount}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </Link>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>
                    ) : (
                        <FlatList
                            data={results}
                            keyExtractor={(item) => item.id}
                            numColumns={2}
                            columnWrapperStyle={styles.columnWrapper}
                            contentContainerStyle={styles.listContent}
                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>No results found.</Text>
                                </View>
                            }
                            renderItem={renderItem}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
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
        paddingVertical: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 2,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#000',
    },
    clearBtn: {
        padding: 5,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
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
        marginBottom: 30,
    },
    imageWrapper: {
        backgroundColor: '#f6f6f6',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 12,
        height: 200,
    },
    image: {
        width: '100%',
        height: '100%',
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
        fontWeight: 'bold',
    },
    emptyState: {
        marginTop: 50,
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
    },
    // New Sections
    section: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#999',
        letterSpacing: 1,
        marginBottom: 15, // Default for non-row headers
    },
    clearHistoryText: {
        fontSize: 12,
        color: 'red',
        fontWeight: '500',
    },
    tagsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    historyTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#eee',
    },
    tagText: {
        fontSize: 14,
        color: '#333',
    },
    // Popular
    popularGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    popularCard: {
        width: '48%',
        marginBottom: 20,
        flexDirection: 'row', // Horizontal mini cards? Or just vertical grid?
        // Let's do vertical grid for popular
        backgroundColor: '#fff',
    },
    popularImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        marginBottom: 8,
    },
    popularInfo: {

    },
    popularTitle: {
        fontSize: 13,
        fontWeight: '500',
        color: '#000',
        marginBottom: 4,
    },
    popularPrice: {
        fontSize: 12,
        color: '#666',
        fontWeight: 'bold',
    },
});
