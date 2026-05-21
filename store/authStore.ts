import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getCustomer } from '../api/shopify';

interface AuthState {
    customerAccessToken: string | null;
    customerAccessTokenExpiresAt: string | null;
    customer: any | null;
    login: (token: string, expiresAt?: string) => Promise<void>;
    logout: () => void;
    fetchCustomer: () => Promise<void>;
    checkTokenExpiry: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            customerAccessToken: null,
            customerAccessTokenExpiresAt: null,
            customer: null,
            login: async (token: string, expiresAt?: string) => {
                set({ customerAccessToken: token, customerAccessTokenExpiresAt: expiresAt || null });
                await get().fetchCustomer();
            },
            logout: () => {
                set({ customerAccessToken: null, customerAccessTokenExpiresAt: null, customer: null });
            },
            checkTokenExpiry: () => {
                const { customerAccessToken, customerAccessTokenExpiresAt } = get();
                if (!customerAccessToken) return true;
                if (customerAccessTokenExpiresAt) {
                    const expiryDate = new Date(customerAccessTokenExpiresAt);
                    const now = new Date();
                    if (expiryDate <= now) {
                        console.warn("Shopify token expired, logging out...");
                        get().logout();
                        return true;
                    }
                }
                return false;
            },
            fetchCustomer: async () => {
                const isExpired = get().checkTokenExpiry();
                if (isExpired) return;

                const { customerAccessToken } = get();
                if (customerAccessToken) {
                    try {
                        const customer = await getCustomer(customerAccessToken);
                        if (!customer) {
                            // Token revoked on Shopify side, logout locally
                            get().logout();
                        } else {
                            set({ customer });
                        }
                    } catch (error) {
                        console.error('Failed to fetch customer profile', error);
                    }
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
