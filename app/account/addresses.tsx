
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useToast } from '@/components/ui/Toast';
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { customerAddressCreate, customerAddressDelete, customerAddressUpdate } from '../../api/shopify';
import { useAuthStore } from '../../store/authStore';

export default function AddressesScreen() {
    const { customer, customerAccessToken, fetchCustomer } = useAuthStore();
    const { showToast } = useToast();
    const [addresses, setAddresses] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Address Form State
    const [address1, setAddress1] = useState('');
    const [city, setCity] = useState('');
    const [province, setProvince] = useState('');
    const [zip, setZip] = useState('');
    const [country, setCountry] = useState('United States');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        if (!customer) {
            fetchCustomer();
        } else if (customer.addresses) {
            setAddresses(customer.addresses.edges.map((e: any) => e.node));
        }
    }, [customer]);

    const openModal = (address?: any) => {
        if (address) {
            setEditingId(address.id);
            setFirstName(address.firstName || '');
            setLastName(address.lastName || '');
            setAddress1(address.address1 || '');
            setCity(address.city || '');
            setProvince(address.province || '');
            setZip(address.zip || '');
            setCountry(address.country || 'United States');
            setPhone(address.phone || '');
        } else {
            setEditingId(null);
            clearForm();
        }
        setModalVisible(true);
    };

    const handleSaveAddress = async () => {
        if (!address1 || !city || !zip || !firstName || !lastName) {
            showToast('Please fill in all required fields.', 'error');
            return;
        }
        setLoading(true);
        try {
            const addressInput = {
                address1,
                city,
                province,
                zip,
                country,
                firstName,
                lastName,
                phone: phone || null
            };

            let response;
            if (editingId) {
                response = await customerAddressUpdate(customerAccessToken!, editingId, addressInput);
            } else {
                response = await customerAddressCreate(customerAccessToken!, addressInput);
            }

            if (response?.customerUserErrors?.length > 0) {
                showToast(response.customerUserErrors[0].message, 'error');
            } else {
                showToast(editingId ? 'Address updated!' : 'Address added!', 'success');
                setModalVisible(false);
                fetchCustomer();
                clearForm();
            }
        } catch (e) {
            showToast('Failed to save address.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        Alert.alert('Delete Address', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const response = await customerAddressDelete(customerAccessToken!, id);
                        if (response?.deletedCustomerAddressId) {
                            showToast('Address deleted.', 'success');
                            fetchCustomer();
                        } else {
                            showToast('Could not delete address.', 'error');
                        }
                    } catch (e) {
                        console.error(e);
                        showToast('An error occurred.', 'error');
                    }
                }
            }
        ]);
    };

    const clearForm = () => {
        setAddress1('');
        setCity('');
        setProvince('');
        setZip('');
        setFirstName('');
        setLastName('');
        setPhone('');
        setEditingId(null);
    };

    const renderAddress = ({ item }: { item: any }) => (
        <View style={styles.addressCard}>
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
                <Text style={styles.addressText}>{item.formatted.join('\n')}</Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => openModal(item)} style={styles.actionBtn}>
                    <IconSymbol name="pencil" size={20} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteAddress(item.id)} style={styles.actionBtn}>
                    <IconSymbol name="trash" size={20} color="red" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{
                title: 'Addresses',
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
                headerRight: () => (
                    <TouchableOpacity
                        onPress={() => openModal()}
                        style={{
                            marginRight: 0,
                            width: 40,
                            height: 40,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <IconSymbol name="plus" size={24} color="#000" />
                    </TouchableOpacity>
                )
            }} />

            <FlatList
                data={addresses}
                renderItem={renderAddress}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <IconSymbol name="location" size={48} color="#ccc" />
                        <Text style={styles.emptyText}>No addresses saved.</Text>
                    </View>
                }
            />

            <Modal animationType="slide" visible={modalVisible} presentationStyle="pageSheet">
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{editingId ? 'Edit Address' : 'Add New Address'}</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                            <IconSymbol name="xmark" size={20} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>First Name</Text>
                            <TextInput style={styles.input} placeholder="e.g. John" value={firstName} onChangeText={setFirstName} />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Last Name</Text>
                            <TextInput style={styles.input} placeholder="e.g. Doe" value={lastName} onChangeText={setLastName} />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Address</Text>
                            <TextInput style={styles.input} placeholder="Address Line 1" value={address1} onChangeText={setAddress1} />
                        </View>
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>City</Text>
                                <TextInput style={styles.input} placeholder="City" value={city} onChangeText={setCity} />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Postcode</Text>
                                <TextInput style={styles.input} placeholder="Zip Code" value={zip} onChangeText={setZip} />
                            </View>
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>State / Province</Text>
                            <TextInput style={styles.input} placeholder="State" value={province} onChangeText={setProvince} />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone</Text>
                            <TextInput style={styles.input} placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Country</Text>
                            <TextInput style={styles.input} placeholder="Country" value={country} onChangeText={setCountry} />
                        </View>

                        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAddress} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{editingId ? 'UPDATE ADDRESS' : 'SAVE ADDRESS'}</Text>}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    listContent: {
        padding: 20,
    },
    addressCard: {
        backgroundColor: '#fff',
        padding: 20,
        marginBottom: 15,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#333',
    },
    addressText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#666',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionBtn: {
        padding: 10,
        marginLeft: 5,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
    },
    emptyState: {
        padding: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
        marginTop: 10,
    },
    modalContent: {
        flex: 1,
        padding: 20,
        paddingTop: 20,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        paddingTop: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    closeBtn: {
        padding: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
    },
    form: {
        gap: 20,
        paddingBottom: 40,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 12, // Square rounded
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        backgroundColor: '#FAFAFA',
    },
    row: {
        flexDirection: 'row',
    },
    saveBtn: {
        backgroundColor: '#000',
        padding: 18,
        alignItems: 'center',
        marginTop: 10,
        borderRadius: 12, // Square rounded
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 0.5,
    }
});
