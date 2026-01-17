import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, FlatList, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/theme';
import { useCartStore } from '../store/cartStore';

export default function CartScreen() {
    const { lines, checkoutUrl, loading, initializeCart, cartId } = useCartStore();

    useEffect(() => {
        initializeCart();
    }, []);

    const handleCheckout = () => {
        if (checkoutUrl) {
            Linking.openURL(checkoutUrl);
        }
    };

    if (loading && lines.length === 0) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.light.tint} />
            </View>
        );
    }

    if (lines.length === 0) {
        return (
            <View style={styles.center}>
                <Stack.Screen options={{ title: 'Cart' }} />
                <Text style={styles.emptyText}>Your cart is empty</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Shopping Cart' }} />
            <FlatList
                data={lines}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Image source={{ uri: item.merchandise.product.images.edges[0]?.node.url }} style={styles.image} />
                        <View style={styles.info}>
                            <Text style={styles.title}>{item.merchandise.product.title}</Text>
                            <Text style={styles.variant}>{item.merchandise.title}</Text>
                            <Text style={styles.price}>
                                {item.merchandise.price.currencyCode} {item.merchandise.price.amount}
                            </Text>
                            <Text style={styles.quantity}>Qty: {item.quantity}</Text>
                        </View>
                    </View>
                )}
                contentContainerStyle={styles.list}
            />
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.checkoutButton, !checkoutUrl && styles.disabledButton]}
                    onPress={handleCheckout}
                    disabled={!checkoutUrl}
                >
                    <Text style={styles.checkoutText}>Proceed to Checkout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
    },
    list: {
        padding: 16,
    },
    item: {
        flexDirection: 'row',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 16,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
    },
    info: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    variant: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.light.tint,
        marginTop: 4,
    },
    quantity: {
        marginTop: 4,
        fontSize: 14,
        color: '#888',
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    checkoutButton: {
        backgroundColor: Colors.light.tint,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
    checkoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
