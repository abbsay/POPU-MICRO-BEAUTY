import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { getPageByHandle } from '../../api/shopify'; // Assuming this maps to api/shopify.ts

export default function AboutScreen() {
    const { width } = useWindowDimensions();
    const [page, setPage] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPageByHandle('about-us')
            .then(data => {
                setPage(data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    if (!page) {
        return (
            <View style={styles.center}>
                <Text>About Us content not found.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Stack.Screen options={{ title: page.title || 'About Us' }} />
            <RenderHtml
                contentWidth={width - 40}
                source={{ html: page.body }}
                tagsStyles={{
                    p: { fontSize: 16, lineHeight: 24, marginBottom: 15, color: '#333' },
                    h1: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
                    h2: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
                    img: { maxWidth: '100%', borderRadius: 8, marginVertical: 10 } // Basic image styling
                }}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 20,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
