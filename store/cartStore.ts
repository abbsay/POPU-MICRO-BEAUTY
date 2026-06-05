import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { addToCart, cartBuyerIdentityUpdate, createCart, getCart, cartLinesRemove, cartLinesUpdate, cartAttributesUpdate } from '../api/shopify';

interface CartState {
    cartId: string | null;
    lines: any[];
    checkoutUrl: string | null;
    loading: boolean;
    error: string | null;
    referralApplied?: boolean;

    initializeCart: () => Promise<void>;
    addItem: (variantId: string, quantity?: number) => Promise<void>;
    removeItem: (lineId: string) => Promise<void>;
    updateItemQuantity: (lineId: string, quantity: number) => Promise<void>;
    resetCart: () => void;
    associateCustomer: (accessToken: string) => Promise<string | null>;
    applyReferralCode: (referrerCode: string) => Promise<void>;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            cartId: null,
            lines: [],
            checkoutUrl: null,
            loading: false,
            error: null,
            referralApplied: false,

            initializeCart: async () => {
                const { cartId, referralApplied } = get();
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

                            // Auto-apply referral if not applied yet
                            if (!referralApplied) {
                                const referrerCode = await AsyncStorage.getItem('referred_by_code');
                                if (referrerCode) {
                                    await get().applyReferralCode(referrerCode);
                                }
                            }
                        } else {
                            set({ cartId: null, lines: [], checkoutUrl: null, loading: false, referralApplied: false }); // Cart expired
                        }
                    } catch (e) {
                        console.error(e);
                        set({ loading: false });
                    }
                }
            },

            addItem: async (variantId: string, quantity = 1) => {
                set({ loading: true, error: null });
                let { cartId, referralApplied } = get();
                const lines = [{ merchandiseId: variantId, quantity }];

                try {
                    let cart;
                    if (cartId) {
                        try {
                            cart = await addToCart(cartId, lines);
                        } catch (e) {
                            console.log("Add to cart failed, trying to create new cart...", e);
                            cartId = null; // Reset invalid cartId
                        }
                    }

                    if (!cartId || !cart) {
                        cart = await createCart(lines);
                        referralApplied = false;
                        set({ referralApplied: false });
                    }

                    if (!cart) {
                        throw new Error("Failed to create or update cart");
                    }

                    set({
                        cartId: cart.id,
                        lines: cart.lines.edges.map((e: any) => e.node),
                        checkoutUrl: cart.checkoutUrl,
                        loading: false,
                    });

                    // Auto-apply referral if not applied yet
                    if (!referralApplied) {
                        const referrerCode = await AsyncStorage.getItem('referred_by_code');
                        if (referrerCode) {
                            await get().applyReferralCode(referrerCode);
                        }
                    }
                } catch (error: any) {
                    console.error('Failed to add to cart:', error);
                    set({ error: error.message || 'Failed to add item', loading: false });
                }
            },

            associateCustomer: async (accessToken: string) => {
                const { cartId } = get();
                if (cartId && accessToken) {
                    try {
                        const cart = await cartBuyerIdentityUpdate(cartId, accessToken);
                        if (cart) {
                            set({ checkoutUrl: cart.checkoutUrl });
                            return cart.checkoutUrl;
                        }
                    } catch (error) {
                        console.error('Failed to associate customer to cart:', error);
                    }
                }
                return null;
            },

            removeItem: async (lineId: string) => {
                const { cartId } = get();
                if (!cartId) return;

                set({ loading: true, error: null });
                try {
                    const cart = await cartLinesRemove(cartId, [lineId]);
                    if (cart) {
                        set({
                            lines: cart.lines.edges.map((e: any) => e.node),
                            checkoutUrl: cart.checkoutUrl,
                            loading: false,
                        });
                    }
                } catch (error: any) {
                    console.error('Failed to remove item from cart:', error);
                    set({ error: error.message || 'Failed to remove item', loading: false });
                }
            },

            updateItemQuantity: async (lineId: string, quantity: number) => {
                const { cartId } = get();
                if (!cartId) return;

                if (quantity <= 0) {
                    await get().removeItem(lineId);
                    return;
                }

                set({ loading: true, error: null });
                try {
                    const cart = await cartLinesUpdate(cartId, [{ id: lineId, quantity }]);
                    if (cart) {
                        set({
                            lines: cart.lines.edges.map((e: any) => e.node),
                            checkoutUrl: cart.checkoutUrl,
                            loading: false,
                        });
                    }
                } catch (error: any) {
                    console.error('Failed to update cart quantity:', error);
                    set({ error: error.message || 'Failed to update quantity', loading: false });
                }
            },

            resetCart: () => set({ cartId: null, lines: [], checkoutUrl: null, referralApplied: false }),

            applyReferralCode: async (referrerCode: string) => {
                const { cartId } = get();
                if (cartId && referrerCode) {
                    try {
                        set({ loading: true });
                        const cart = await cartAttributesUpdate(cartId, [{ key: 'referred_by', value: referrerCode }]);
                        if (cart) {
                            set({
                                lines: cart.lines.edges.map((e: any) => e.node),
                                checkoutUrl: cart.checkoutUrl,
                                referralApplied: true,
                                loading: false,
                            });
                        }
                    } catch (error) {
                        console.error('Failed to apply referral code to cart:', error);
                        set({ loading: false });
                    }
                }
            },
        }),
        {
            name: 'shopify-cart-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
