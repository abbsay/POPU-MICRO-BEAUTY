import { Stack } from 'expo-router';

export default function DesignLayout() {
    return (
        <Stack screenOptions={{
            headerBackTitle: ' ', // Force space
            headerTintColor: '#000',
            contentStyle: { backgroundColor: '#fff' },
        }}>
            <Stack.Screen name="index" options={{ title: 'Design Studio', headerBackTitle: ' ' }} />
            <Stack.Screen name="editor" options={{ title: 'Editor', headerBackTitle: ' ' }} />
        </Stack>
    );
}
