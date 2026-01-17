import { IconSymbol } from '@/components/ui/icon-symbol';
import { Link, Stack } from 'expo-router';
import { useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { searchProducts } from '../../api/shopify';
import { Colors } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            const data = await searchProducts(query);
            setResults(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

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
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={handleSearch}>
                            <Text style={styles.searchBtn}>GO</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text>Searching...</Text>
                </View>
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>
                                {results.length === 0 && query.length > 0 ? "No results found." : "Explore our premium collection"}
                            </Text>
                        </View>
                    }
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
    searchBtn: {
        fontWeight: 'bold',
        color: Colors.light.tint,
        marginLeft: 10,
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
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
    }
});
