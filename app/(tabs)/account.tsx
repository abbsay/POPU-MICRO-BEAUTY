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
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={[styles.header, { paddingVertical: 80 }]}>
                    <Text style={styles.welcomeText}>POPU MICRO</Text>
                    <Text style={styles.subText}>Sign in for a better experience</Text>

                    <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/auth/login')}>
                        <Text style={styles.primaryBtnText}>SIGN IN</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/auth/signup')}>
                        <Text style={styles.secondaryBtnText}>CREATE ACCOUNT</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>SUPPORT</Text>
                    <TouchableOpacity style={styles.menuItem}>
                        <IconSymbol name="gear" size={20} color="#000" />
                        <Text style={styles.menuText}>Settings</Text>
                        <IconSymbol name="chevron.right" size={16} color="#ccc" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.version}>Version 1.0.0</Text>
            </SafeAreaView>
        );
    }

    // Logged In State
    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView>
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: `https://ui-avatars.com/api/?name=${customer.firstName || 'User'}+${customer.lastName || ''}&background=000&color=fff&size=200` }}
                            style={styles.avatar}
                        />
                    </View>
                    <Text style={styles.welcomeText}>{customer.firstName} {customer.lastName}</Text>
                    <Text style={styles.subText}>{customer.email}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>MY ACCOUNT</Text>
                    <TouchableOpacity style={styles.menuItem}>
                        <IconSymbol name="bag" size={20} color="#000" />
                        <Text style={styles.menuText}>My Orders</Text>
                        <IconSymbol name="chevron.right" size={16} color="#ccc" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <IconSymbol name="location" size={20} color="#000" />
                        <Text style={styles.menuText}>Addresses</Text>
                        <IconSymbol name="chevron.right" size={16} color="#ccc" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <IconSymbol name="heart" size={20} color="#000" />
                        <Text style={styles.menuText}>Wishlist</Text>
                        <IconSymbol name="chevron.right" size={16} color="#ccc" />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>SUPPORT</Text>
                    <TouchableOpacity style={styles.menuItem}>
                        <IconSymbol name="gear" size={20} color="#000" />
                        <Text style={styles.menuText}>Settings</Text>
                        <IconSymbol name="chevron.right" size={16} color="#ccc" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>LOG OUT</Text>
                </TouchableOpacity>

                <Text style={styles.version}>Version 1.0.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        alignItems: 'center',
        paddingVertical: 40,
        borderBottomWidth: 10,
        borderBottomColor: '#f9f9f9',
    },
    avatarContainer: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 5,
    },
    subText: {
        color: '#666',
        fontSize: 14,
        marginBottom: 20,
    },
    primaryBtn: {
        backgroundColor: '#000',
        paddingHorizontal: 40,
        paddingVertical: 15,
        marginBottom: 15,
        width: '80%',
        alignItems: 'center',
    },
    primaryBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    secondaryBtn: {
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderWidth: 1,
        borderColor: '#000',
        width: '80%',
        alignItems: 'center',
    },
    secondaryBtnText: {
        color: '#000',
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    section: {
        marginTop: 20,
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#999',
        marginBottom: 10,
        letterSpacing: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        marginLeft: 15,
        fontWeight: '500',
    },
    logoutButton: {
        margin: 30,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 18,
        borderRadius: 0,
        alignItems: 'center',
    },
    logoutText: {
        color: '#000',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1.5,
    },
    version: {
        textAlign: 'center',
        color: '#ccc',
        fontSize: 12,
        marginBottom: 30,
    }
});
