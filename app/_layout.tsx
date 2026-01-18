import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

import { ShopifyCheckoutSheetProvider } from '@shopify/checkout-sheet-kit';

import { ToastProvider } from '@/components/ui/Toast';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ToastProvider>
      <ShopifyCheckoutSheetProvider configuration={{ preloading: true }}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{
            // @ts-ignore
            headerBackTitleVisible: false,
            headerTintColor: '#000',
            contentStyle: { backgroundColor: '#fff' }
          }}>
            <Stack.Screen name="(tabs)" options={{
              headerShown: false,
              // @ts-ignore
              headerBackTitleVisible: false,
              title: ''
            }} />
            <Stack.Screen name="collection/[id]" options={{ title: '' }} />
            <Stack.Screen name="product/[id]" options={{ presentation: 'card' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="account/orders" options={{ presentation: 'card' }} />
            <Stack.Screen name="account/addresses" options={{ presentation: 'card' }} />
            <Stack.Screen name="account/profile" options={{ presentation: 'card' }} />
            <Stack.Screen name="account/wishlist" options={{ presentation: 'card' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </ShopifyCheckoutSheetProvider>
    </ToastProvider>
  );
}
