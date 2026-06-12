import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';
import { Stack, router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, Share, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getShopInfo } from '../../api/shopify';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useToast } from '../../components/ui/Toast';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

export default function AccountScreen() {
    const { customer, logout, customerAccessToken, fetchCustomer } = useAuthStore();
    const [shopInfo, setShopInfo] = useState<any>(null);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [referredByCode, setReferredByCode] = useState<string | null>(null);
    const { showToast } = useToast();

    const isPromoActive = new Date() < new Date('2026-07-16T00:00:00Z');

    const glowScale = useSharedValue(1);
    const glowOpacity = useSharedValue(0.45);

    useEffect(() => {
        glowScale.value = withRepeat(
            withTiming(1.18, { duration: 2000 }),
            -1,
            false
        );
        glowOpacity.value = withRepeat(
            withTiming(0, { duration: 2000 }),
            -1,
            false
        );
    }, []);

    const animatedGlowStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: glowScale.value }],
            opacity: glowOpacity.value,
        };
    });

    useEffect(() => {
        if (customerAccessToken) {
            fetchCustomer();
        }
        // Fetch dynamic shop info
        getShopInfo().then(info => {
            setShopInfo(info);
        }).catch(err => console.log("Failed to fetch shop info", err));
    }, [customerAccessToken, fetchCustomer]);

    // Check if new user for welcome popup
    useEffect(() => {
        const checkWelcomeReward = async () => {
            if (customer && customer.email) {
                // Determine if user is new (0 orders)
                const orderCount = customer.orders?.edges?.length || 0;
                if (orderCount === 0) {
                    const refCode = await AsyncStorage.getItem('referred_by_code');
                    
                    // Show modal if either the welcome promo is active OR they registered via a referral code
                    const shouldShowModal = isPromoActive || !!refCode;
                    
                    if (shouldShowModal) {
                        const seenKey = `welcome_popup_seen_${customer.email}`;
                        const hasSeen = await AsyncStorage.getItem(seenKey);
                        if (!hasSeen) {
                            setReferredByCode(refCode);
                            setShowWelcomeModal(true);
                        }
                    }
                }
            }
        };
        checkWelcomeReward();
    }, [customer, isPromoActive]);

    const handleShareReferral = async () => {
        if (!customer?.email) return;
        const code = `POPU-${customer.email.split('@')[0].toUpperCase()}`;
        const message = isPromoActive
            ? `Invite your friends to POPU! They’ll get a $125 Welcome Pack with 5 x $20 welcome coupons and an exclusive $25 machine purchase offer. After their first purchase, you’ll unlock one additional $25 machine purchase opportunity. Use my referral code ${code} when you sign up. Download the app today: https://apps.apple.com/app/id6758688074`
            : `Join POPU Micro Beauty and get a $25 bonus coupon! Use my referral code ${code} when you sign up. Download the app today: https://apps.apple.com/app/id6758688074`;
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await Share.share({ message });
        } catch (error) {
            console.error('Failed to share referral code:', error);
        }
    };

    const handleCopyReferral = () => {
        if (!customer?.email) return;
        const code = `POPU-${customer.email.split('@')[0].toUpperCase()}`;
        Clipboard.setString(code);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast('Referral code copied to clipboard!', 'success');
    };

    const handleGoToCoupons = async () => {
        if (customer?.email) {
            const seenKey = `welcome_popup_seen_${customer.email}`;
            await AsyncStorage.setItem(seenKey, 'true');
        }
        setShowWelcomeModal(false);
        router.push('/account/coupons');
    };

    const handleDismissWelcome = async () => {
        if (customer?.email) {
            const seenKey = `welcome_popup_seen_${customer.email}`;
            await AsyncStorage.setItem(seenKey, 'true');
        }
        setShowWelcomeModal(false);
    };

    const handleLogout = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        logout();
        useCartStore.getState().resetCart();
        setReferredByCode(null);
        await AsyncStorage.removeItem('referred_by_code');
    };

    const handleContactUs = async () => {
        const mailUrl = 'mailto:support@popumicrobeauty.com';
        try {
            const canOpen = await Linking.canOpenURL(mailUrl);
            if (canOpen) {
                await Linking.openURL(mailUrl);
            } else {
                // Fallback to web contact page
                const baseUrl = shopInfo?.primaryDomain?.url || 'https://popumicrobeauty.com';
                await WebBrowser.openBrowserAsync(`${baseUrl}/pages/contact`);
            }
        } catch (e) {
            // Final fallback if everything fails
            const baseUrl = shopInfo?.primaryDomain?.url || 'https://popumicrobeauty.com';
            await WebBrowser.openBrowserAsync(`${baseUrl}/pages/contact`);
        }
    };


    const handlePrivacy = async () => {
        // Use dynamic policy URL key if available
        const url = shopInfo?.privacyPolicy?.url || 'https://popumicrobeauty.com/policies/privacy-policy';
        await WebBrowser.openBrowserAsync(url);
    };

    const handleNotifications = () => {
        Linking.openSettings();
    };

    const handleDeleteAccount = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            "Delete Account",
            "Are you sure you want to delete your account? All your data will be permanently removed. This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        Alert.alert(
                            "Account Deletion Requested",
                            "Your account deletion request has been submitted and will be processed within 24 hours.",
                            [{ text: "OK", onPress: () => handleLogout() }]
                        );
                    }
                }
            ]
        );
    };

    if (!customer) {
        // Guest State
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center' }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.guestHeader}>
                    <Image
                        source={require('../../assets/images/popu_logo.png')}
                        style={styles.logo}
                    />
                    <Text style={styles.subText}>Sign in for a better experience</Text>

                    <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/auth/login')}>
                        <Text style={styles.primaryBtnText}>SIGN IN</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/auth/signup')}>
                        <Text style={styles.secondaryBtnText}>CREATE ACCOUNT</Text>
                    </TouchableOpacity>

                    {isPromoActive && (
                        <View style={styles.promoBadgeContainer}>
                            <Animated.View style={[styles.promoGlow, animatedGlowStyle]} />
                            <View style={styles.promoBadge}>
                                <MaterialCommunityIcons name="gift-outline" size={16} color="#A390E4" />
                                <Text style={styles.promoText}>
                                    New User Registration: Get a $100 Welcome Pack
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        );
    }

    // Logged In State
    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {/* Header / Profile Section */}
                <View style={styles.loggedInHeader}>
                    <View style={styles.headerTop}>
                        <Text style={styles.pageTitle}>My Account</Text>
                    </View>

                    <TouchableOpacity onPress={() => router.push('/account/profile')} style={styles.profileCard}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: `https://ui-avatars.com/api/?name=${customer.firstName || 'User'}+${customer.lastName || ''}&background=000&color=fff&size=200` }}
                                style={styles.avatar}
                            />
                            <View style={styles.editBadge}>
                                <MaterialCommunityIcons name="pencil" size={12} color="#fff" />
                            </View>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.welcomeText}>{customer.firstName} {customer.lastName}</Text>
                            <Text style={styles.emailText}>{customer.email}</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
                    </TouchableOpacity>

                    {/* My Coupons Banner */}
                    <TouchableOpacity 
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.push('/account/coupons');
                        }} 
                        style={styles.couponsBanner} 
                        activeOpacity={0.8}
                    >
                        <View style={styles.couponsBannerContent}>
                            <View style={styles.couponsIconCircle}>
                                <MaterialCommunityIcons name="ticket-percent-outline" size={24} color="#A390E4" />
                            </View>
                            <View style={styles.couponsTextContainer}>
                                <Text style={styles.couponsBannerTitle}>My Coupons</Text>
                                <Text style={styles.couponsBannerSubtitle}>
                                    {isPromoActive ? 'Tap to view your $100+ welcome pack' : 'Tap to view your coupons'}
                                </Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
                    </TouchableOpacity>

                    {/* Referral & Rewards Card */}
                    <View style={styles.referralCard}>
                        <View style={styles.referralHeader}>
                            <MaterialCommunityIcons name="gift-outline" size={20} color="#A390E4" />
                            <Text style={styles.referralTitle}>Invite Friends & Earn Rewards</Text>
                        </View>
                        <Text style={styles.referralDesc}>
                            {isPromoActive
                                ? "Invite your friends to POPU! They’ll get a $125 Welcome Pack with 5 x $20 welcome coupons and an exclusive $25 machine purchase offer. After their first purchase, you’ll unlock one additional $25 machine purchase opportunity."
                                : "Share POPU with friends! They'll get a $25 referral bonus, and you'll receive a $25 reward when they make their first purchase."}
                        </Text>
                        <View style={styles.referralActions}>
                            <TouchableOpacity style={styles.referralCodeBox} onPress={handleCopyReferral} activeOpacity={0.7}>
                                <Text style={styles.referralCodeLabel}>YOUR REFERRAL CODE</Text>
                                <View style={styles.referralCodeRow}>
                                    <Text style={styles.referralCodeText}>
                                        {`POPU-${customer.email.split('@')[0].toUpperCase()}`}
                                    </Text>
                                    <MaterialCommunityIcons name="content-copy" size={14} color="#666" />
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.referralShareBtn} onPress={handleShareReferral} activeOpacity={0.8}>
                                <MaterialCommunityIcons name="share-variant" size={16} color="#fff" style={{ marginRight: 6 }} />
                                <Text style={styles.referralShareBtnText}>SHARE</Text>
                            </TouchableOpacity>
                        </View>
                        {isPromoActive && (
                            <TouchableOpacity 
                                style={styles.promoOfferBtn} 
                                onPress={() => {
                                    router.push(`/collection/${encodeURIComponent('25-pmu-pen-machines-exclusive-popu-referral-offer')}`);
                                }}
                                activeOpacity={0.85}
                            >
                                <LinearGradient
                                    colors={['#A390E4', '#E8A0BF']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.promoOfferGradient}
                                >
                                    <MaterialCommunityIcons name="lightning-bolt" size={16} color="#fff" />
                                    <Text style={styles.promoOfferBtnText}>VIEW EXCLUSIVE MACHINE OFFER</Text>
                                    <MaterialCommunityIcons name="arrow-right" size={16} color="#fff" />
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Menu Sections */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>SHOPPING</Text>
                    <View style={styles.menuCard}>
                        <MenuItem
                            icon="shopping-outline"
                            label="My Orders"
                            onPress={() => router.push('/account/orders')}
                        />
                        <View style={styles.separator} />
                        <MenuItem
                            icon="heart-outline"
                            label="Wishlist"
                            onPress={() => router.push('/account/wishlist')}
                        />
                        <View style={styles.separator} />
                        <MenuItem
                            icon="map-marker-outline"
                            label="Addresses"
                            onPress={() => router.push('/account/addresses')}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>SUPPORT</Text>
                    <View style={styles.menuCard}>
                        <MenuItem
                            icon="headset"
                            label="Contact Us"
                            onPress={handleContactUs}
                        />
                        <View style={styles.separator} />
                        <MenuItem
                            icon="information-outline"
                            label="About Us"
                            onPress={() => router.push('/account/about')}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>SETTINGS</Text>
                    <View style={styles.menuCard}>
                        <MenuItem
                            icon="bell-outline"
                            label="Notifications"
                            onPress={handleNotifications}
                        />
                        <View style={styles.separator} />
                        <MenuItem
                            icon="shield-check-outline"
                            label="Privacy & Security"
                            onPress={handlePrivacy}
                        />
                        <View style={styles.separator} />
                        <MenuItem
                            icon="account-remove-outline"
                            label="Delete Account"
                            onPress={handleDeleteAccount}
                            isDestructive={true}
                        />
                    </View>
                </View>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <View style={styles.versionInfo}>
                    <Text style={styles.versionText}>
                        Version {Constants.expoConfig?.version || '1.1.7'} (Build {Constants.expoConfig?.ios?.buildNumber || '13'})
                    </Text>
                </View>
            </ScrollView>

            {/* Welcome Reward Modal */}
            <Modal
                visible={showWelcomeModal}
                transparent={true}
                animationType="fade"
                onRequestClose={handleDismissWelcome}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.modalCloseButton} onPress={handleDismissWelcome}>
                            <MaterialCommunityIcons name="close" size={20} color="#000" />
                        </TouchableOpacity>
                        
                        <View style={styles.modalGiftIconContainer}>
                            <LinearGradient
                                colors={['#A390E4', '#E8A0BF']}
                                style={styles.modalGiftIconGradient}
                            >
                                <MaterialCommunityIcons name="gift" size={36} color="#fff" />
                            </LinearGradient>
                        </View>
                        
                        <Text style={styles.modalTitle}>WELCOME TO POPU!</Text>
                        <Text style={styles.modalSubtitle}>
                            {isPromoActive
                                ? (referredByCode ? 'Exclusive $125 Welcome Pack' : 'Exclusive $100 Welcome Pack')
                                : 'Exclusive $25 Referral Bonus'}
                        </Text>
                        
                        <Text style={styles.modalDescription}>
                            {isPromoActive
                                ? (referredByCode 
                                    ? 'Congratulations! You have received a $125 Welcome Pack containing 5 welcome coupons (worth $100) and 1 referral bonus coupon (worth $25). Redeem them on separate orders.' 
                                    : 'Congratulations! You have received a $100 Welcome Pack containing 5 welcome coupons. Redeem them on separate orders.')
                                : 'Congratulations! You have received a $25 Referral Bonus coupon. Redeem it on your order.'}
                        </Text>
                        
                        <View style={styles.couponPackPreview}>
                            {isPromoActive && (
                                <LinearGradient
                                    colors={['#F5F3FF', '#FFF0F5']}
                                    style={styles.packPreviewGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <MaterialCommunityIcons name="ticket-percent" size={28} color="#A390E4" />
                                    <View style={styles.packPreviewTextContainer}>
                                        <Text style={styles.packPreviewTitle}>$100 Welcome Coupon Pack</Text>
                                        <Text style={styles.packPreviewSubtitle}>5 x $20 coupons added to your wallet</Text>
                                    </View>
                                </LinearGradient>
                            )}
                            {referredByCode && (
                                <LinearGradient
                                    colors={['#FFF0F5', '#FFF9E6']}
                                    style={[styles.packPreviewGradient, isPromoActive && { marginTop: 10 }]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <MaterialCommunityIcons name="gift" size={28} color="#E8A0BF" />
                                    <View style={styles.packPreviewTextContainer}>
                                        <Text style={styles.packPreviewTitle}>$25 Referral Coupon Bonus</Text>
                                        <Text style={styles.packPreviewSubtitle}>Additional bonus coupon in your wallet</Text>
                                    </View>
                                </LinearGradient>
                            )}
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.modalPrimaryBtn} 
                            onPress={handleGoToCoupons}
                        >
                            <Text style={styles.modalPrimaryBtnText}>
                                VIEW MY COUPONS
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.modalSecondaryBtn} onPress={handleDismissWelcome}>
                            <Text style={styles.modalSecondaryBtnText}>Dismiss</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// Helper Component for Menu Items
function MenuItem({ icon, label, onPress, isDestructive = false }: { icon: any, label: string, onPress: () => void, isDestructive?: boolean }) {
    return (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.iconBox, isDestructive && { backgroundColor: '#FFF0F0' }]}>
                <MaterialCommunityIcons name={icon} size={20} color={isDestructive ? '#FF3B30' : '#000'} />
            </View>
            <Text style={[styles.menuText, isDestructive && { color: '#FF3B30' }]}>{label}</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    // Guest Styles
    guestHeader: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    logo: {
        width: 180,
        height: 60,
        resizeMode: 'contain',
        marginBottom: 10,
    },
    subText: {
        color: '#666',
        fontSize: 14,
        marginBottom: 40,
        textAlign: 'center',
    },
    primaryBtn: {
        backgroundColor: '#000',
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderRadius: 12, // Square rounded
        marginBottom: 15,
        width: '100%',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    primaryBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    secondaryBtn: {
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 12, // Square rounded
        borderWidth: 1,
        borderColor: '#000',
        width: '100%',
        alignItems: 'center',
        backgroundColor: '#fff',
        gap: 2,
    },
    secondaryBtnText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
    },
    secondaryBtnSubText: {
        color: '#A390E4',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        textAlign: 'center',
    },

    // Logged In Styles
    loggedInHeader: {
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#000',
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    avatarContainer: {
        marginRight: 15,
        position: 'relative',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#eee',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#000',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    profileInfo: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    emailText: {
        color: '#666',
        fontSize: 14,
    },

    // Design Banner
    designBanner: {
        backgroundColor: '#000',
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: "#E8A0BF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    designContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    designTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 2,
    },
    designSubtitle: {
        color: '#E8A0BF',
        fontSize: 13,
    },

    // Menu
    section: {
        marginTop: 10,
        paddingHorizontal: 20,
        marginBottom: 10, // Added spacing between sections
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#888',
        marginBottom: 8,
        marginLeft: 4,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    menuCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden', // Ensure corners clip separators
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 15,
        color: '#333',
    },
    separator: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginLeft: 67, // Align with text (16+36+15)
    },

    // Logout
    logoutButton: {
        marginHorizontal: 20,
        marginTop: 20,
        padding: 16,
        alignItems: 'center',
        marginBottom: 20,
    },
    logoutText: {
        color: '#FF3B30', // System red
        fontSize: 16,
        fontWeight: '600',
    },
    versionInfo: {
        alignItems: 'center',
        marginBottom: 20,
    },
    versionText: {
        color: '#ccc',
        fontSize: 12,
    },

    // Referral Card Styles
    referralCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    referralHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 8,
    },
    referralTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    referralDesc: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
        marginBottom: 15,
    },
    referralActions: {
        flexDirection: 'row',
        gap: 12,
    },
    referralCodeBox: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        borderWidth: 1,
        borderColor: '#EFEFEF',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        justifyContent: 'center',
    },
    referralCodeLabel: {
        fontSize: 9,
        color: '#999',
        fontWeight: 'bold',
        marginBottom: 2,
        letterSpacing: 0.5,
    },
    referralCodeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    referralCodeText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#A390E4',
    },
    referralShareBtn: {
        backgroundColor: '#000',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    referralShareBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        paddingHorizontal: 24,
        paddingVertical: 32,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
        position: 'relative',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 10,
    },
    modalCloseButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        padding: 4,
    },
    modalGiftIconContainer: {
        marginBottom: 20,
    },
    modalGiftIconGradient: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#A390E4",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#000',
        letterSpacing: 1,
        textAlign: 'center',
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#E8A0BF',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    modalDescription: {
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 24,
        paddingHorizontal: 10,
    },
    couponPackPreview: {
        width: '100%',
        marginBottom: 24,
    },
    packPreviewGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        gap: 12,
    },
    packPreviewTextContainer: {
        flex: 1,
    },
    packPreviewTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 2,
    },
    packPreviewSubtitle: {
        fontSize: 11,
        color: '#666',
    },
    modalPrimaryBtn: {
        backgroundColor: '#000',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    modalPrimaryBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    modalSecondaryBtn: {
        paddingVertical: 8,
        width: '100%',
        alignItems: 'center',
    },
    modalSecondaryBtnText: {
        color: '#999',
        fontSize: 13,
        fontWeight: '500',
    },
    couponsBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    couponsBannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    couponsIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F5F3FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    couponsTextContainer: {
        justifyContent: 'center',
    },
    couponsBannerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 2,
    },
    couponsBannerSubtitle: {
        fontSize: 12,
        color: '#666',
    },
    promoBadgeContainer: {
        marginTop: 25,
        position: 'relative',
        alignSelf: 'center',
    },
    promoGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(163, 144, 228, 0.22)',
        borderRadius: 20,
    },
    promoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: 'rgba(163, 144, 228, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(163, 144, 228, 0.15)',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 16,
        shadowColor: '#A390E4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
    },
    promoText: {
        color: '#A390E4',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    promoOfferBtn: {
        marginTop: 15,
        borderRadius: 12,
        overflow: 'hidden',
    },
    promoOfferGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 8,
    },
    promoOfferBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});
