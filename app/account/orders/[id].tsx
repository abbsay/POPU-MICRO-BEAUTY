
import { getOrderById } from '@/api/shopify';
import { Skeleton } from '@/components/ui/Skeleton';
import { Colors } from '@/constants/theme';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrderDetailScreen() {
    const { id } = useLocalSearchParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadOrder(id as string);
        }
    }, [id]);

    const loadOrder = async (orderId: string) => {
        try {
            const data = await getOrderById(orderId);
            setOrder(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ title: 'Order Details' }} />
                <View style={{ padding: 20 }}>
                    <Skeleton width="100%" height={150} style={{ marginBottom: 20 }} />
                    <Skeleton width="100%" height={300} />
                </View>
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ title: 'Order Details' }} />
                <View style={styles.center}>
                    <Text>Order not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: `Order #${order.orderNumber}` }} />
            <ScrollView contentContainerStyle={styles.content}>

                {/* Status Card */}
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Placed on</Text>
                        <Text style={styles.value}>{new Date(order.processedAt).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Payment Status</Text>
                        <View style={[styles.badge, order.financialStatus === 'PAID' ? styles.badgeSuccess : styles.badgeWarning]}>
                            <Text style={styles.badgeText}>{order.financialStatus}</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Fulfillment</Text>
                        <View style={[styles.badge, order.fulfillmentStatus === 'FULFILLED' ? styles.badgeSuccess : styles.badgeInfo]}>
                            <Text style={styles.badgeText}>{order.fulfillmentStatus}</Text>
                        </View>
                    </View>
                </View>

                {/* Shipping Address */}
                {order.shippingAddress && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>SHIPPING ADDRESS</Text>
                        <View style={styles.card}>
                            <Text style={styles.addressText}>{order.shippingAddress.formatted.join('\n')}</Text>
                        </View>
                    </View>
                )}

                {/* Items */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ITEMS</Text>
                    <View style={styles.card}>
                        {order.lineItems.edges.map(({ node }: any, index: number) => (
                            <View key={index} style={[styles.itemRow, index === order.lineItems.edges.length - 1 && { borderBottomWidth: 0 }]}>
                                {node.variant?.image && (
                                    <Image source={{ uri: node.variant.image.url }} style={styles.itemImage} />
                                )}
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemTitle}>{node.title}</Text>
                                    <Text style={styles.itemVariant}>{node.variant?.title}</Text>
                                    <View style={styles.priceRow}>
                                        <Text style={styles.itemPrice}>
                                            {node.originalTotalPrice.currencyCode} {node.originalTotalPrice.amount}
                                        </Text>
                                        <Text style={styles.itemQty}>x{node.quantity}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Summary */}
                <View style={styles.card}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>{order.subtotalPrice?.currencyCode} {order.subtotalPrice?.amount}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Shipping</Text>
                        <Text style={styles.summaryValue}>{order.totalShippingPrice?.currencyCode} {order.totalShippingPrice?.amount}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tax</Text>
                        <Text style={styles.summaryValue}>{order.totalTax?.currencyCode} {order.totalTax?.amount}</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>{order.totalPrice.currencyCode} {order.totalPrice.amount}</Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    label: {
        color: '#666',
        fontSize: 14,
    },
    value: {
        fontWeight: '500',
        fontSize: 14,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        backgroundColor: '#eee',
    },
    badgeSuccess: {
        backgroundColor: '#E8F5E9',
    },
    badgeWarning: {
        backgroundColor: '#FFF3E0',
    },
    badgeInfo: {
        backgroundColor: '#E3F2FD',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
    },
    section: {
        marginBottom: 5,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#999',
        marginBottom: 10,
        letterSpacing: 1,
    },
    addressText: {
        lineHeight: 22,
        color: '#333',
    },
    itemRow: {
        flexDirection: 'row',
        paddingBottom: 15,
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 4,
        backgroundColor: '#f0f0f0',
    },
    itemInfo: {
        flex: 1,
        marginLeft: 15,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemVariant: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '500',
    },
    itemQty: {
        fontSize: 14,
        color: '#999',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        color: '#666',
    },
    summaryValue: {
        fontWeight: '500',
    },
    totalRow: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.light.tint,
    }
});
