import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import { EyebrowOverlay } from '../../components/EyebrowOverlay';

export default function DesignEditorScreen() {
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const imageRef = useRef<View>(null);

    const [status, requestPermission] = MediaLibrary.usePermissions();

    const pickImage = async () => {
        setLoading(true);
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 1,
            });

            if (!result.canceled) {
                setImage(result.assets[0].uri);
            }
        } catch (e: any) {
            Alert.alert("Error", "Could not pick image: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const takePhoto = async () => {
        setLoading(true);
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
                setImage(result.assets[0].uri);
            }
        } catch (e: any) {
            Alert.alert("Error", "Could not take photo: " + e.message);
        } finally {
            setLoading(false);
        }
    }

    const clearImage = () => {
        setImage(null);
    };

    const saveImage = async () => {
        if (!status?.granted) {
            const permission = await requestPermission();
            if (!permission.granted) {
                Alert.alert("Permission Required", "Storage access is needed to save your design.");
                return;
            }
        }

        setSaving(true);
        try {
            const localUri = await captureRef(imageRef, {
                height: 440,
                quality: 1,
                format: 'png',
            });

            await MediaLibrary.saveToLibraryAsync(localUri);
            if (localUri) {
                Alert.alert("Saved!", "Your design has been saved to your photos.");
            }
        } catch (e: any) {
            console.log(e);
            Alert.alert("Error", "Could not save image.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                {!image ? (
                    <View style={styles.placeholderContainer}>
                        <Text style={styles.instructionText}>Take a selfie or upload a photo to start</Text>

                        <View style={styles.buttonGroup}>
                            <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
                                <MaterialCommunityIcons name="camera" size={24} color="#fff" />
                                <Text style={styles.actionButtonText}>Take Photo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={pickImage}>
                                <MaterialCommunityIcons name="image" size={24} color="#000" />
                                <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Upload</Text>
                            </TouchableOpacity>
                        </View>
                        {loading && <ActivityIndicator style={{ marginTop: 20 }} />}
                    </View>
                ) : (
                    <View style={styles.editorContainer}>
                        <View style={styles.imageArea} ref={imageRef} collapsable={false}>
                            <Image source={{ uri: image }} style={styles.bgImage} resizeMode="contain" />
                            <EyebrowOverlay />
                        </View>

                        <View style={styles.toolbar}>
                            <TouchableOpacity onPress={clearImage} style={styles.toolButton}>
                                <MaterialCommunityIcons name="close" size={24} color="#fff" />
                                <Text style={styles.toolLabel}>Reset</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.toolButton, { backgroundColor: '#E8A0BF' }]}
                                onPress={saveImage}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <MaterialCommunityIcons name="download" size={24} color="#fff" />
                                )}
                                <Text style={styles.toolLabel}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    instructionText: {
        color: '#fff',
        fontSize: 18,
        marginBottom: 40,
        textAlign: 'center',
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: 20,
    },
    actionButton: {
        backgroundColor: '#E8A0BF',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    secondaryButton: {
        backgroundColor: '#fff',
    },
    secondaryButtonText: {
        color: '#000',
    },
    editorContainer: {
        flex: 1,
    },
    imageArea: {
        flex: 1,
        backgroundColor: '#222',
        overflow: 'hidden', // Ensure image doesn't bleed
    },
    bgImage: {
        width: '100%',
        height: '100%',
    },
    toolbar: {
        height: 100,
        backgroundColor: '#111',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: 20,
    },
    toolButton: {
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        minWidth: 80,
    },
    toolLabel: {
        color: '#fff',
        fontSize: 12,
        marginTop: 4,
    },
});
