
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useToast } from '@/components/ui/Toast';
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { customerUpdate } from '../../api/shopify';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen() {
    const { customer, customerAccessToken, fetchCustomer } = useAuthStore();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        if (!customer) {
            fetchCustomer();
        } else {
            setFirstName(customer.firstName || '');
            setLastName(customer.lastName || '');
            setEmail(customer.email || '');
            setPhone(customer.phone || '');
        }
    }, [customer]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const customerInput = {
                firstName,
                lastName,
                email,
                phone: phone || null // Send null if empty to avoid errors if API validates
            };

            const response = await customerUpdate(customerAccessToken!, customerInput);

            if (response?.customerUserErrors?.length > 0) {
                showToast(response.customerUserErrors[0].message, 'error');
            } else {
                showToast('Profile updated!', 'success');
                fetchCustomer();
            }
        } catch (e) {
            console.error(e);
            showToast('Failed to update profile.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{
                title: 'Edit Profile',
                headerLeft: () => (
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{
                            marginLeft: 0,
                            width: 40,
                            height: 40,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <IconSymbol name="chevron.left" size={28} color="#000" />
                    </TouchableOpacity>
                ),
            }} />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Phone</Text>
                    <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                </View>

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>SAVE CHANGES</Text>}
                </TouchableOpacity>

                <View style={styles.infoBox}>
                    <IconSymbol name="info.circle" size={20} color="#666" />
                    <Text style={styles.infoText}>
                        Your email and phone number are used for login and order notifications.
                    </Text>
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
    content: {
        padding: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
    },
    saveBtn: {
        backgroundColor: '#000',
        padding: 18,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#eee',
        padding: 15,
        borderRadius: 8,
        marginTop: 30,
        alignItems: 'center',
        gap: 10,
    },
    infoText: {
        color: '#666',
        fontSize: 13,
        flex: 1,
        lineHeight: 18,
    }
});
