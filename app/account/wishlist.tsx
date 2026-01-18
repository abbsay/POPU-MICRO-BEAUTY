import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Haptics from 'expo-haptics';
import { Link, Stack } from 'expo-router';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp, FadeOut, Layout } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWishlistStore } from '../../store/wishlistStore';

export default function WishlistScreen() {
    const { items, removeItem } = useWishlistStore();

    const handleRemove = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        removeItem(id);
    };

    const renderItem = ({ item, index }: { item: any, index: number }) => (
        <Animated.View
            entering={FadeInUp.delay(index * 100).springify()}
            layout={Layout.springify()}
            exiting={FadeOut}
        >
            <Link href={`/product/${encodeURIComponent(item.id)}`} asChild>
                <TouchableOpacity style={styles.card}>
                    <Image source={{ uri: item.image }} style={styles.image} />
                    <View style={styles.info}>
                        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                        <Text style={styles.price}>{item.price}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.removeBtn}>
                        <IconSymbol name="heart.fill" size={24} color="red" />
                    </TouchableOpacity>
                </TouchableOpacity>
            </Link>
        </Animated.View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Wishlist', headerBackTitleVisible: false }} />

            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <IconSymbol name="heart" size={60} color="#ddd" />
                        <Text style={styles.emptyText}>Your wishlist is empty</Text>
                        <Text style={styles.emptySubText}>Save items you want to view later.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    listContent: {
        padding: 20,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 4,
        backgroundColor: '#f0f0f0',
    },
    info: {
        flex: 1,
        marginLeft: 15,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 5,
    },
    price: {
        fontSize: 14,
        color: '#666',
    },
    removeBtn: {
        padding: 10,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 100,
        gap: 20,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    emptySubText: {
        color: '#999',
        fontSize: 16,
    }
});
