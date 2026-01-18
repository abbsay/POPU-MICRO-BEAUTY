import { Stack, router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import { Colors } from '../../constants/theme';
import { useCartStore } from '../../store/cartStore';

import { useShopifyCheckoutSheet } from '@shopify/checkout-sheet-kit';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../store/authStore';

const FREE_SHIPPING_THRESHOLD = 100.00;

export default function CartScreen() {
    const { lines, checkoutUrl, loading, initializeCart, cartId } = useCartStore();
    const shopifyCheckout = useShopifyCheckoutSheet();

    useEffect(() => {
        initializeCart();
    }, []);

    const customerAccessToken = useAuthStore(state => state.customerAccessToken);

    const subtotal = useMemo(() => {
        return lines.reduce((acc, item) => acc + (parseFloat(item.merchandise.price.amount) * item.quantity), 0);
    }, [lines]);

    const progress = Math.min(subtotal / FREE_SHIPPING_THRESHOLD, 1);
    const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

    const handleCheckout = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (!customerAccessToken) {
            router.push('/auth/login');
            return;
        }
        if (checkoutUrl) {
            // Associate customer to ensure they are logged in during checkout
            const url = await useCartStore.getState().associateCustomer(customerAccessToken);
            shopifyCheckout.present(url || checkoutUrl);
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
                <TouchableOpacity style={styles.startShoppingBtn} onPress={() => router.push('/(tabs)/shop')}>
                    <Text style={styles.startShoppingText}>Start Shopping</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Shopping Cart' }} />

            <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                    {remaining > 0
                        ? `Spend $${remaining.toFixed(2)} more for Free Shipping`
                        : "You've unlocked Free Shipping!"}
                </Text>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: remaining <= 0 ? '#4CAF50' : Colors.light.tint }]} />
                </View>
            </View>

            <FlatList
                data={lines}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <Animated.View
                        entering={FadeInUp.delay(index * 100).springify()}
                        layout={Layout.springify()}
                        style={styles.item}
                    >
                        <Image source={{ uri: item.merchandise.product.images.edges[0]?.node.url }} style={styles.image} />
                        <View style={styles.info}>
                            <Text style={styles.title} numberOfLines={1}>{item.merchandise.product.title}</Text>
                            <Text style={styles.variant}>{item.merchandise.title}</Text>
                            <View style={styles.priceRow}>
                                <Text style={styles.price}>
                                    {item.merchandise.price.currencyCode} {item.merchandise.price.amount}
                                </Text>
                                <Text style={styles.quantity}>Qty: {item.quantity}</Text>
                            </View>
                        </View>
                    </Animated.View>
                )}
                contentContainerStyle={styles.list}
            />

            <View style={styles.footer}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Shipping</Text>
                    <Text style={styles.summaryValue}>{remaining <= 0 ? 'Free' : 'Calculated at checkout'}</Text>
                </View>

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
        marginBottom: 20,
    },
    startShoppingBtn: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: '#000',
        borderRadius: 4,
    },
    startShoppingText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    // Progress Bar
    progressContainer: {
        padding: 20,
        backgroundColor: '#f9f9f9',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    progressText: {
        textAlign: 'center',
        fontSize: 14,
        marginBottom: 10,
        fontWeight: '500',
        color: '#333',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#e0e0e0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    list: {
        padding: 16,
    },
    item: {
        flexDirection: 'row',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
        paddingBottom: 16,
        backgroundColor: '#fff', // Needed for shadow if added
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
        marginBottom: 4,
    },
    variant: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    quantity: {
        fontSize: 14,
        color: '#888',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        backgroundColor: '#fff',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    checkoutButton: {
        backgroundColor: '#000',
        padding: 18,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: 10,
    },
    disabledButton: {
        opacity: 0.5,
    },
    checkoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});
