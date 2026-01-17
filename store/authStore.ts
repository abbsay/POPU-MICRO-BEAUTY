import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getCustomer } from '../api/shopify';

interface AuthState {
    customerAccessToken: string | null;
    customer: any | null;
    login: (token: string) => Promise<void>;
    logout: () => void;
    fetchCustomer: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            customerAccessToken: null,
            customer: null,
            login: async (token: string) => {
                set({ customerAccessToken: token });
                await get().fetchCustomer();
            },
            logout: () => {
                set({ customerAccessToken: null, customer: null });
            },
            fetchCustomer: async () => {
                const { customerAccessToken } = get();
                if (customerAccessToken) {
                    try {
                        const customer = await getCustomer(customerAccessToken);
                        set({ customer });
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
