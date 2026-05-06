import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getShopInfo } from '../../api/shopify';
import { useAuthStore } from '../../store/authStore';

export default function AccountScreen() {
    const { customer, logout, customerAccessToken, fetchCustomer } = useAuthStore();
    const [shopInfo, setShopInfo] = useState<any>(null);

    useEffect(() => {
        if (customerAccessToken) {
            fetchCustomer();
        }
        // Fetch dynamic shop info
        getShopInfo().then(info => {
            setShopInfo(info);
        }).catch(err => console.log("Failed to fetch shop info", err));
    }, [customerAccessToken]);

    const handleLogout = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        logout();
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

    const handleHelpCenter = async () => {
        // Use dynamic domain if available, else fallback
        const baseUrl = shopInfo?.primaryDomain?.url || 'https://popumicrobeauty.com';
        await WebBrowser.openBrowserAsync(`${baseUrl}/pages/contact`);
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

                    {/* Loyalty Card (Mock) */}
                    {/* Design Banner */}
                    {/* <TouchableOpacity onPress={() => router.push('/design')} style={styles.designBanner}>
                        <View style={styles.designContent}>
                            <MaterialCommunityIcons name="face-woman-shimmer" size={28} color="#fff" />
                            <View>
                                <Text style={styles.designTitle}>Design Your Eyebrows</Text>
                                <Text style={styles.designSubtitle}>Create your perfect look</Text>
                            </View>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
                    </TouchableOpacity> */}
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
                    <Text style={styles.versionText}>Version 1.1.0 (Build 7)</Text>
                </View>
            </ScrollView>
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
        paddingVertical: 18,
        borderRadius: 12, // Square rounded
        borderWidth: 1,
        borderColor: '#000',
        width: '100%',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    secondaryBtnText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
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
});
