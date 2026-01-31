import { ProductCard } from '@/components/ProductCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Skeleton } from '@/components/ui/Skeleton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, FlatList, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProducts, searchProducts } from '../../api/shopify';

const { width } = Dimensions.get('window');
// Standardize padding and spacing
const HORIZONTAL_PADDING = 20;

const SEARCH_HISTORY_KEY = 'search_history';

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const [popularProducts, setPopularProducts] = useState<any[]>([]);
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            await Promise.all([loadHistory(), loadPopularProducts()]);
        } finally {
            setPageLoading(false);
        }
    };

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

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const toggleViewMode = () => {
        setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 50).springify()}
            layout={Layout.springify()}
        >
            <ProductCard product={item} viewMode={viewMode} origin="search" />
        </Animated.View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <View style={{ width: 40 }} />
                <Text style={styles.title}>SEARCH</Text>
                <TouchableOpacity onPress={toggleViewMode} style={styles.headerButton}>
                    <IconSymbol
                        name={viewMode === 'grid' ? 'list.bullet' : 'square.grid.2x2'}
                        size={22}
                        color="#000"
                    />
                </TouchableOpacity>
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
                    <View style={styles.skeletonGrid}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <View key={i} style={{ width: Math.floor((width - 40 - 16) / 2), marginBottom: 24 }}>
                                <Skeleton width="100%" height={Math.floor((width - 40 - 16) / 2)} style={{ marginBottom: 10, borderRadius: 8 }} />
                                <Skeleton width="80%" height={15} style={{ marginBottom: 5 }} />
                                <Skeleton width="40%" height={15} />
                            </View>
                        ))}
                    </View>
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    {!hasSearched && query.length === 0 ? (
                        <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: HORIZONTAL_PADDING }}>
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
                            {popularProducts.length > 0 && (
                                <View style={[styles.section, { marginTop: 30 }]}>
                                    <Text style={styles.sectionTitle}>POPULAR NOW</Text>
                                    <View style={styles.popularGrid}>
                                        {popularProducts.map((item, index) => (
                                            <ProductCard key={item.id} product={item} />
                                        ))}
                                    </View>
                                </View>
                            )}
                        </ScrollView>
                    ) : (
                        <FlatList
                            key={viewMode}
                            data={results}
                            keyExtractor={(item) => item.id}
                            numColumns={viewMode === 'grid' ? 2 : 1}
                            columnWrapperStyle={viewMode === 'grid' ? styles.columnWrapper : undefined}
                            contentContainerStyle={styles.listContent}
                            ListEmptyComponent={
                                <View style={styles.emptyState}>
                                    <IconSymbol name="magnifyingglass" size={48} color="#eee" style={{ marginBottom: 10 }} />
                                    <Text style={styles.emptyText}>No results found.</Text>
                                    <Text style={styles.emptySubText}>Try searching for something else.</Text>
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
        paddingVertical: 15,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    headerButton: {
        width: 40,
        alignItems: 'flex-end',
    },
    title: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 2,
    },
    searchContainer: {
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingBottom: 15,
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
        flex: 1,
        paddingHorizontal: 15,
    },
    skeletonGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    skeletonCard: {
        width: (width - 45) / 2, // Matches ProductCard width logic
        marginBottom: 20,
    },
    listContent: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    emptyState: {
        marginTop: 80,
        alignItems: 'center',
    },
    emptyText: {
        color: '#333',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubText: {
        color: '#999',
        fontSize: 14,
    },
    // Sections
    section: {
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
        marginBottom: 15,
    },
    clearHistoryText: {
        fontSize: 12,
        color: '#666', // More subtle than red
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
        borderRadius: 20, // More rounded tags
        borderWidth: 1,
        borderColor: '#eee',
    },
    tagText: {
        fontSize: 13,
        color: '#333',
    },
    // Popular
    popularGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
});
