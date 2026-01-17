import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { addToCart, createCart, getCart } from '../api/shopify';

interface CartState {
    cartId: string | null;
    lines: any[];
    checkoutUrl: string | null;
    loading: boolean;
    error: string | null;

    initializeCart: () => Promise<void>;
    addItem: (variantId: string, quantity?: number) => Promise<void>;
    resetCart: () => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            cartId: null,
            lines: [],
            checkoutUrl: null,
            loading: false,
            error: null,

            initializeCart: async () => {
                const { cartId } = get();
                if (cartId) {
                    try {
                        set({ loading: true });
                        const cart = await getCart(cartId);
                        if (cart) {
                            set({
                                lines: cart.lines.edges.map((e: any) => e.node),
                                checkoutUrl: cart.checkoutUrl,
                                loading: false,
                            });
                        } else {
                            set({ cartId: null, lines: [], checkoutUrl: null, loading: false }); // Cart expired
                        }
                    } catch (e) {
                        console.error(e);
                        set({ loading: false });
                    }
                }
            },

            addItem: async (variantId: string, quantity = 1) => {
                set({ loading: true, error: null });
                const { cartId } = get();
                const lines = [{ merchandiseId: variantId, quantity }];

                try {
                    let cart;
                    if (cartId) {
                        cart = await addToCart(cartId, lines);
                    } else {
                        cart = await createCart(lines);
                    }

                    set({
                        cartId: cart.id,
                        lines: cart.lines.edges.map((e: any) => e.node),
                        checkoutUrl: cart.checkoutUrl,
                        loading: false,
                    });
                } catch (error) {
                    console.error('Failed to add to cart:', error);
                    set({ error: 'Failed to add item', loading: false });
                }
            },

            resetCart: () => set({ cartId: null, lines: [], checkoutUrl: null }),
        }),
        {
            name: 'shopify-cart-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
