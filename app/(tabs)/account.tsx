import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Haptics from 'expo-haptics';
import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';

export default function AccountScreen() {
    const { customer, logout, customerAccessToken, fetchCustomer } = useAuthStore();

    useEffect(() => {
        if (customerAccessToken) {
            fetchCustomer();
        }
    }, [customerAccessToken]);

    const handleLogout = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        logout();
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
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Header / Profile Section */}
                <View style={styles.loggedInHeader}>
                    <Image
                        source={require('../../assets/images/popu_logo.png')}
                        style={styles.headerLogo}
                    />

                    <TouchableOpacity onPress={() => router.push('/account/profile')} style={styles.profileCard}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: `https://ui-avatars.com/api/?name=${customer.firstName || 'User'}+${customer.lastName || ''}&background=000&color=fff&size=200` }}
                                style={styles.avatar}
                            />
                            <View style={styles.editBadge}>
                                <IconSymbol name="pencil" size={12} color="#fff" />
                            </View>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.welcomeText}>{customer.firstName} {customer.lastName}</Text>
                            <Text style={styles.emailText}>{customer.email}</Text>
                        </View>
                        <IconSymbol name="chevron.right" size={20} color="#ccc" style={{ marginLeft: 'auto' }} />
                    </TouchableOpacity>
                </View>

                {/* My Account Menu */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>MY ACCOUNT</Text>
                    <View style={styles.menuCard}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/account/orders')}>
                            <View style={styles.iconBox}>
                                <IconSymbol name="bag" size={20} color="#000" />
                            </View>
                            <Text style={styles.menuText}>My Orders</Text>
                            <IconSymbol name="chevron.right" size={16} color="#ccc" />
                        </TouchableOpacity>
                        <View style={styles.separator} />
                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/account/addresses')}>
                            <View style={styles.iconBox}>
                                <IconSymbol name="location" size={20} color="#000" />
                            </View>
                            <Text style={styles.menuText}>Addresses</Text>
                            <IconSymbol name="chevron.right" size={16} color="#ccc" />
                        </TouchableOpacity>
                        <View style={styles.separator} />
                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/account/wishlist')}>
                            <View style={styles.iconBox}>
                                <IconSymbol name="heart" size={20} color="#000" />
                            </View>
                            <Text style={styles.menuText}>Wishlist</Text>
                            <IconSymbol name="chevron.right" size={16} color="#ccc" />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9', // Light gray background for better card contrast
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
    headerLogo: {
        width: 120,
        height: 40,
        resizeMode: 'contain',
        marginBottom: 20,
        alignSelf: 'center',
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
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    avatarContainer: {
        marginRight: 15,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
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

    // Menu
    section: {
        marginTop: 10,
        paddingHorizontal: 20,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 10,
        marginLeft: 4,
        letterSpacing: 0.5,
    },
    menuCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 10,
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
        paddingHorizontal: 10,
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
        marginLeft: 61, // Align with text
    },

    // Logout
    logoutButton: {
        marginHorizontal: 20,
        marginTop: 30,
        padding: 16,
        alignItems: 'center',
    },
    logoutText: {
        color: '#FF3B30', // System red
        fontSize: 16,
        fontWeight: '600',
    },
});
