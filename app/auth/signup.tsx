import { IconSymbol } from '@/components/ui/icon-symbol';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { customerAccessTokenCreate, customerCreate } from '../../api/shopify';
import { Colors } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

export default function SignupScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const login = useAuthStore((state) => state.login);

    const handleSignup = async () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            // 1. Create Customer
            const createRes = await customerCreate(email, password);
            if (createRes.customerUserErrors && createRes.customerUserErrors.length > 0) {
                Alert.alert('Signup Failed', createRes.customerUserErrors[0].message);
                return;
            }

            // 2. Login immediately
            const tokenRes = await customerAccessTokenCreate(email, password);
            if (tokenRes.customerAccessToken) {
                await login(tokenRes.customerAccessToken.accessToken);
                await useCartStore.getState().associateCustomer(tokenRes.customerAccessToken.accessToken);
                router.dismissTo('/(tabs)/account');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Sign Up', headerBackTitle: 'Login', headerTintColor: '#000' }} />

            <View style={styles.content}>
                <Text style={styles.header}>Create Account</Text>
                <Text style={styles.subHeader}>Join POPU MICRO BEAUTY</Text>

                <View style={styles.form}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Create a password"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                            <IconSymbol name={showPassword ? 'eye.slash' : 'eye'} size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Confirm your password"
                            secureTextEntry={!showPassword}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleSignup}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>CREATE ACCOUNT</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 20,
        paddingTop: 40,
    },
    header: {
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 10,
        letterSpacing: 1,
    },
    subHeader: {
        fontSize: 16,
        color: '#666',
        marginBottom: 40,
    },
    form: {
        gap: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
        textTransform: 'uppercase',
        letterSpacing: 1,
        color: '#333',
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 10,
        fontSize: 16,
        marginBottom: 10,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 10,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 16,
    },
    eyeIcon: {
        padding: 10,
    },
    button: {
        backgroundColor: Colors.light.tint, // Brand color for primary action
        padding: 18,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 1,
    },
});
