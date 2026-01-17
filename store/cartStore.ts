import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShopifyCheckoutSheet } from '@shopify/checkout-sheet-kit';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { addToCart, cartBuyerIdentityUpdate, createCart, getCart } from '../api/shopify';

interface CartState {
    cartId: string | null;
    lines: any[];
    checkoutUrl: string | null;
    loading: boolean;
    error: string | null;

    initializeCart: () => Promise<void>;
    addItem: (variantId: string, quantity?: number) => Promise<void>;
    resetCart: () => void;
    associateCustomer: (accessToken: string) => Promise<void>;
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
                            if (cart.checkoutUrl) {
                                // @ts-ignore
                                ShopifyCheckoutSheet.preload(cart.checkoutUrl);
                            }
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

                    if (cart.checkoutUrl) {
                        // @ts-ignore
                        ShopifyCheckoutSheet.preload(cart.checkoutUrl);
                    }
                } catch (error) {
                    console.error('Failed to add to cart:', error);
                    set({ error: 'Failed to add item', loading: false });
                }
            },

            associateCustomer: async (accessToken: string) => {
                const { cartId } = get();
                if (cartId && accessToken) {
                    try {
                        const cart = await cartBuyerIdentityUpdate(cartId, accessToken);
                        if (cart) {
                            set({ checkoutUrl: cart.checkoutUrl });
                            if (cart.checkoutUrl) {
                                // @ts-ignore
                                ShopifyCheckoutSheet.preload(cart.checkoutUrl);
                            }
                        }
                    } catch (error) {
                        console.error('Failed to associate customer to cart:', error);
                    }
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
