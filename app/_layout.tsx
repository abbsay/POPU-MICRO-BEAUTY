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

import { AnimatedSplashScreen } from '@/components/AnimatedSplashScreen';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AnimatedSplashScreen>
      <ToastProvider>
        <ShopifyCheckoutSheetProvider configuration={{ preloading: true }}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{
              // @ts-ignore
              headerBackTitleVisible: false,
              headerBackTitle: ' ', // Force space to hide text
              headerTintColor: '#000',
              contentStyle: { backgroundColor: '#fff' }
            }}>
              <Stack.Screen name="(tabs)" options={{
                headerShown: false,
                // @ts-ignore
                headerBackTitleVisible: false,
                headerBackTitle: '',
                title: ''
              }} />
              <Stack.Screen name="collection/[id]" options={{ title: '', headerBackTitle: '' }} />
              <Stack.Screen name="product/[id]" options={{ presentation: 'card', headerBackTitle: '' }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              <Stack.Screen name="account/orders" options={{ presentation: 'card', headerBackTitle: '' }} />
              <Stack.Screen name="account/addresses" options={{ presentation: 'card', headerBackTitle: '' }} />
              <Stack.Screen name="account/profile" options={{ presentation: 'card', headerBackTitle: '' }} />
              <Stack.Screen name="account/wishlist" options={{ presentation: 'card', headerBackTitle: '' }} />
              <Stack.Screen name="design" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </ShopifyCheckoutSheetProvider>
      </ToastProvider>
    </AnimatedSplashScreen>
  );
}
