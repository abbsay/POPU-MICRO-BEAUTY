import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, router } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { Clipboard, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../components/ui/Toast';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getSanitizedPrefix } from '../../api/adminShopify';

interface CouponItem {
    id: string;
    code: string;
    amount: number;
    title: string;
    description: string;
    type: 'welcome' | 'referral';
    expiryText: string;
    expiryType: 'limited' | 'permanent';
}

export default function CouponsScreen() {
    const { customer, fetchCustomer } = useAuthStore();
    const { showToast } = useToast();
    const [coupons, setCoupons] = useState<CouponItem[]>([]);
    const [usedCodes, setUsedCodes] = useState<Set<string>>(new Set());
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const isPromoActive = new Date() < new Date('2026-07-16T00:00:00Z');

    const loadCouponsAndStatus = useCallback(async () => {
        try {
            // 1. Identify used codes from orders
            const used = new Set<string>();
            if (customer?.orders?.edges) {
                customer.orders.edges.forEach((edge: any) => {
                    const order = edge.node;
                    if (order.discountApplications?.edges) {
                        order.discountApplications.edges.forEach((appEdge: any) => {
                            const code = appEdge.node.code;
                            if (code) {
                                used.add(code.toUpperCase().trim());
                            }
                        });
                    }
                });
            }
            setUsedCodes(used);

            // 2. Build coupon list dynamically based on customer prefix
            const email = customer?.email || '';
            const prefix = getSanitizedPrefix(email);
            const list: CouponItem[] = [];
            const isPromoActive = new Date() < new Date('2026-07-16T00:00:00Z');

            // Add the 5 welcome coupons
            for (let i = 1; i <= 5; i++) {
                list.push({
                    id: `welcome_${i}`,
                    code: `POPU-${prefix}-20-${i}`,
                    amount: 20,
                    title: `App Welcome Coupon ${i}/5`,
                    description: 'Get $20 off your order. 1 coupon per order.',
                    type: 'welcome',
                    expiryText: isPromoActive ? 'Expires: July 15, 2026' : 'Expired',
                    expiryType: 'limited'
                });
            }

            // Check if user has a referral code saved
            const referralCodeSaved = await AsyncStorage.getItem('referred_by_code');
            if (referralCodeSaved) {
                list.unshift({
                    id: 'referral_bonus',
                    code: `POPU-${prefix}-REF-25`,
                    amount: 25,
                    title: 'Referral Bonus Coupon',
                    description: 'Get an extra $25 off your order as an invite reward.',
                    type: 'referral',
                    expiryText: 'Valid long-term',
                    expiryType: 'permanent'
                });
            }

            setCoupons(list);
        } catch (e) {
            console.error('Failed to load coupons', e);
        } finally {
            setLoading(false);
        }
    }, [customer]);

    useEffect(() => {
        loadCouponsAndStatus();
    }, [loadCouponsAndStatus]);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchCustomer();
        } catch (e) {
            console.error(e);
        } finally {
            setRefreshing(false);
        }
    };

    const handleCopyCode = (code: string) => {
        Clipboard.setString(code);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast(`Coupon code ${code} copied!`, 'success');
    };

    if (loading && !refreshing) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <Stack.Screen options={{ title: 'My Coupons', headerBackTitle: '' }} />
                <ActivityIndicator size="large" color="#A390E4" />
            </SafeAreaView>
        );
    }

    if (!customer) {
        return (
            <SafeAreaView style={[styles.container, styles.center, { padding: 20 }]}>
                <Stack.Screen options={{ title: 'My Coupons', headerBackTitle: '' }} />
                <MaterialCommunityIcons name="ticket-percent-outline" size={80} color="#ccc" style={{ marginBottom: 20 }} />
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#000' }}>
                    Sign in to view coupons
                </Text>
                <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 30, lineHeight: 20, paddingHorizontal: 20 }}>
                    {isPromoActive 
                        ? 'Please sign in or create an account to access your personalized $100 Welcome Pack and referral bonuses.'
                        : 'Please sign in or create an account to access your referral bonuses.'}
                </Text>
                <TouchableOpacity 
                    style={{
                        backgroundColor: '#000',
                        paddingHorizontal: 30,
                        paddingVertical: 18,
                        borderRadius: 12,
                        width: '100%',
                        alignItems: 'center',
                    }}
                    onPress={() => router.push('/auth/login')}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>SIGN IN</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const totalValue = coupons.reduce((sum, item) => {
        const isUsed = usedCodes.has(item.code.toUpperCase().trim());
        const isExpired = item.expiryType === 'limited' && !isPromoActive;
        return sum + ((isUsed || isExpired) ? 0 : item.amount);
    }, 0);

    const hasUnusedWelcome = isPromoActive && coupons.some(
        (item) => item.type === 'welcome' && !usedCodes.has(item.code.toUpperCase().trim())
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'My Coupons', headerBackTitle: '' }} />
            
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A390E4" />
                }
            >
                {/* Header Summary Card */}
                <LinearGradient
                    colors={['#A390E4', '#E8A0BF']}
                    style={styles.summaryCard}
                >
                    <View>
                        <Text style={styles.summaryTitle}>COUPON BALANCE</Text>
                        <Text style={styles.summaryValue}>${totalValue}</Text>
                    </View>
                    <MaterialCommunityIcons name="ticket-percent-outline" size={48} color="rgba(255, 255, 255, 0.4)" />
                </LinearGradient>

                {hasUnusedWelcome && (
                    <View style={styles.warningBanner}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#D97706" />
                        <Text style={styles.warningBannerText}>
                            Note: Your $100 Welcome Pack coupons will expire on July 15, 2026.
                        </Text>
                    </View>
                )}

                <Text style={styles.sectionHeader}>AVAILABLE COUPONS</Text>

                {coupons.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No coupons available.</Text>
                    </View>
                ) : (
                    coupons.map((item, index) => {
                        const isUsed = usedCodes.has(item.code.toUpperCase().trim());
                        const isExpired = item.expiryType === 'limited' && !isPromoActive;
                        const isInactive = isUsed || isExpired;
                        
                        return (
                            <Animated.View 
                                key={item.id} 
                                entering={FadeInDown.delay(index * 80).springify()}
                                style={[styles.ticketContainer, isInactive && styles.ticketUsed]}
                            >
                                {/* Left Section - Value */}
                                <LinearGradient
                                    colors={isInactive ? ['#E0E0E0', '#D6D6D6'] : ['#A390E4', '#C3B3F2']}
                                    style={styles.ticketLeft}
                                >
                                    <Text style={styles.ticketCurrency}>$</Text>
                                    <Text style={styles.ticketAmount}>{item.amount}</Text>
                                </LinearGradient>

                                {/* Right Section - Details */}
                                <View style={styles.ticketRight}>
                                    <View style={styles.ticketTextContainer}>
                                        <Text style={[styles.ticketTitle, isInactive && styles.textStrikethrough]}>
                                            {item.title}
                                        </Text>
                                        <Text style={styles.ticketDesc} numberOfLines={2}>
                                            {item.description}
                                        </Text>
                                        
                                        <View style={styles.expiryRow}>
                                            <MaterialCommunityIcons 
                                                name={item.expiryType === 'limited' ? 'clock-outline' : 'infinity'} 
                                                size={12} 
                                                color={isInactive ? '#999' : (item.expiryType === 'limited' ? '#D97706' : '#22C55E')} 
                                            />
                                            <Text style={[
                                                styles.expiryText, 
                                                isInactive && styles.textStrikethrough,
                                                { color: isInactive ? '#999' : (item.expiryType === 'limited' ? '#B45309' : '#15803D') }
                                            ]}>
                                                {item.expiryText}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    <View style={styles.ticketBottomRow}>
                                        <View style={[styles.codeBadge, isInactive && styles.codeBadgeUsed]}>
                                            <Text style={[styles.codeText, isInactive && styles.codeTextUsed]}>
                                                {item.code}
                                            </Text>
                                        </View>
                                        
                                        {isUsed ? (
                                            <View style={styles.usedLabel}>
                                                <MaterialCommunityIcons name="check-circle" size={14} color="#999" />
                                                <Text style={styles.usedLabelText}>USED</Text>
                                            </View>
                                        ) : isExpired ? (
                                            <View style={styles.usedLabel}>
                                                <MaterialCommunityIcons name="alert-circle" size={14} color="#FF3B30" />
                                                <Text style={[styles.usedLabelText, { color: '#FF3B30' }]}>EXPIRED</Text>
                                            </View>
                                        ) : (
                                            <TouchableOpacity 
                                                style={styles.copyButton} 
                                                onPress={() => handleCopyCode(item.code)}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={styles.copyButtonText}>COPY</Text>
                                                <MaterialCommunityIcons name="content-copy" size={12} color="#fff" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>

                                {/* Dotted Divider Line */}
                                <View style={styles.ticketDivider} />

                                {/* Cutout circles (Punched ticket style) */}
                                <View style={styles.cutoutTop} />
                                <View style={styles.cutoutBottom} />
                            </Animated.View>
                        );
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    summaryCard: {
        borderRadius: 20,
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
        shadowColor: '#A390E4',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
    },
    summaryTitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    summaryValue: {
        color: '#fff',
        fontSize: 38,
        fontWeight: '900',
        letterSpacing: 1,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#888',
        marginBottom: 15,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    warningBanner: {
        backgroundColor: '#FFFBEB',
        borderColor: '#FDE68A',
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
    },
    warningBannerText: {
        fontSize: 12,
        color: '#B45309',
        fontWeight: '600',
        flex: 1,
    },
    expiryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 6,
    },
    expiryText: {
        fontSize: 10,
        fontWeight: '600',
    },
    ticketContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        height: 126,
        flexDirection: 'row',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
        overflow: 'hidden',
        position: 'relative',
    },
    ticketUsed: {
        opacity: 0.75,
    },
    ticketLeft: {
        width: '28%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    ticketCurrency: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: -12,
        marginRight: 2,
    },
    ticketAmount: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
    },
    ticketRight: {
        flex: 1,
        padding: 14,
        justifyContent: 'space-between',
    },
    ticketTextContainer: {
        flex: 1,
    },
    ticketTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 2,
    },
    ticketDesc: {
        fontSize: 11,
        color: '#666',
        lineHeight: 14,
    },
    ticketBottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    codeBadge: {
        backgroundColor: '#F3EFFF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 0.5,
        borderColor: '#E6DFFF',
    },
    codeBadgeUsed: {
        backgroundColor: '#F0F0F0',
        borderColor: '#E0E0E0',
    },
    codeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#A390E4',
        letterSpacing: 0.5,
    },
    codeTextUsed: {
        color: '#999',
        textDecorationLine: 'line-through',
    },
    copyButton: {
        backgroundColor: '#000',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    copyButtonText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    usedLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    usedLabelText: {
        color: '#999',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    textStrikethrough: {
        textDecorationLine: 'line-through',
        color: '#999',
    },
    ticketDivider: {
        position: 'absolute',
        left: '28%',
        top: 10,
        bottom: 10,
        borderWidth: 0.5,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
    },
    cutoutTop: {
        position: 'absolute',
        top: -8,
        left: '28%',
        marginLeft: -8,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#F9F9F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
    },
    cutoutBottom: {
        position: 'absolute',
        bottom: -8,
        left: '28%',
        marginLeft: -8,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#F9F9F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
        fontSize: 14,
    },
});
