
import { Link, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';

export default function OrdersScreen() {
    const { customer, fetchCustomer } = useAuthStore();
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        if (!customer) {
            fetchCustomer();
        } else if (customer.orders) {
            setOrders(customer.orders.edges.map((e: any) => e.node));
        }
    }, [customer]);

    const renderOrder = ({ item, index }: { item: any, index: number }) => (
        <Animated.View entering={FadeInUp.delay(index * 100).springify()} layout={Layout.springify()}>
            <Link href={`/account/orders/${encodeURIComponent(item.id)}`} asChild>
                <TouchableOpacity>
                    <View style={styles.orderCard}>
                        <View style={styles.orderHeader}>
                            <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>
                            <Text style={[styles.status, { color: item.financialStatus === 'PAID' ? 'green' : 'orange' }]}>
                                {item.financialStatus}
                            </Text>
                        </View>
                        <View style={styles.orderFooter}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalPrice}>
                                {item.totalPrice.currencyCode} {item.totalPrice.amount}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </Link>
        </Animated.View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'My Orders', headerBackTitleVisible: false }} />
            <FlatList
                data={orders}
                renderItem={renderOrder}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>You haven't placed any orders yet.</Text>
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
    orderCard: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 15,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    status: {
        fontSize: 14,
        fontWeight: '600',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 15,
    },
    totalLabel: {
        color: '#666',
        fontSize: 14,
    },
    totalPrice: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyState: {
        padding: 50,
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
    }
});
