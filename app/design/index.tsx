
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { ActionSheetIOS, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DesignLandingScreen() {
    const router = useRouter();

    const handleStartDesigning = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', 'Take Photo', 'Choose from Library'],
                    cancelButtonIndex: 0,
                    tintColor: '#000',
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) {
                        takePhoto();
                    } else if (buttonIndex === 2) {
                        pickImage();
                    }
                }
            );
        } else {
            // Android Alert fallback
            Alert.alert(
                "Select Image",
                "Choose an image source",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Take Photo", onPress: takePhoto },
                    { text: "Choose from Library", onPress: pickImage }
                ]
            );
        }
    };

    const takePhoto = async () => {
        try {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
                Alert.alert("Permission Required", "Camera access is needed to take photos.");
                return;
            }
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: false,
                quality: 1,
            });
            if (!result.canceled) {
                router.push({
                    pathname: '/design/editor',
                    params: { initialImage: result.assets[0].uri }
                });
            }
        } catch (e: any) {
            Alert.alert("Error", e.message);
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 1,
            });
            if (!result.canceled) {
                router.push({
                    pathname: '/design/editor',
                    params: { initialImage: result.assets[0].uri }
                });
            }
        } catch (e: any) {
            Alert.alert("Error", e.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{
                headerBackTitle: ' ', // Force space so Editor screen has clean back button
                title: 'Design Studio', // Explicit title
                headerLeft: () => (
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ justifyContent: 'center', alignItems: 'center' }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <MaterialCommunityIcons name="chevron-left" size={32} color="#000" />
                    </TouchableOpacity>
                ),
            }} />
            <View style={styles.content}>
                <MaterialCommunityIcons name="face-woman-shimmer" size={100} color="#E8A0BF" />
                <Text style={styles.title}>Design Your Brows</Text>
                <Text style={styles.subtitle}>
                    Upload a selfie and find the perfect eyebrow shape for your face.
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleStartDesigning}
                >
                    <Text style={styles.buttonText}>Start Designing</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
                </TouchableOpacity>
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
        flex: 1,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: '80%',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#000',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 50,
        marginTop: 20,
        gap: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});
