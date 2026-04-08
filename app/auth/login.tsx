import { IconSymbol } from '@/components/ui/icon-symbol';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { customerAccessTokenCreate, customerRecover } from '../../api/shopify';
import { Colors } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const login = useAuthStore((state) => state.login);

    const handleForgotPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address first.');
            return;
        }

        setLoading(true);
        try {
            const response = await customerRecover(email);
            if (response?.customerUserErrors?.length > 0) {
                Alert.alert('Error', response.customerUserErrors[0].message);
            } else {
                Alert.alert('Success', 'Check your email for a reset link.');
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await customerAccessTokenCreate(email, password);
            if (response.customerUserErrors && response.customerUserErrors.length > 0) {
                Alert.alert('Login Failed', response.customerUserErrors[0].message);
            } else if (response.customerAccessToken) {
                await login(response.customerAccessToken.accessToken);
                await useCartStore.getState().associateCustomer(response.customerAccessToken.accessToken);
                router.dismiss(); // Go back to account page
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
            <Stack.Screen options={{ title: 'Login', headerBackTitle: 'Back', headerTintColor: '#000' }} />

            <View style={styles.content}>
                <Text style={styles.header}>Welcome Back</Text>
                <Text style={styles.subHeader}>Sign in to your account</Text>

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
                            placeholder="Enter your password"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                            <IconSymbol name={showPassword ? 'eye.slash' : 'eye'} size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={handleForgotPassword} style={{ alignSelf: 'flex-end' }}>
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>SIGN IN</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                        <Text style={styles.link}>Don&apos;t have an account? Sign Up</Text>
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
    forgotText: {
        color: '#666',
        fontSize: 14,
        marginTop: 5,
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#000',
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
    link: {
        textAlign: 'center',
        marginTop: 20,
        color: Colors.light.tint,
        fontWeight: '600',
    }
});
