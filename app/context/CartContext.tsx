import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useFetcher } from "@remix-run/react";

interface CartLine {
    id: string;
    quantity: number;
    merchandise: {
        id: string;
        title: string;
        image?: {
            url: string;
            altText?: string;
        };
        product: {
            title: string;
            handle: string;
        };
        price: {
            amount: string;
            currencyCode: string;
        };
    };
}

interface Cart {
    id: string;
    checkoutUrl: string;
    totalQuantity: number;
    estimatedCost: {
        totalAmount: {
            amount: string;
            currencyCode: string;
        };
    };
    lines: {
        edges: {
            node: CartLine;
        }[];
    };
}

interface CartContextType {
    cart: Cart | null;
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    addToCart: (variantId: string, quantity?: number) => void;
    removeFromCart: (lineId: string) => void;
    updateLine: (lineId: string, quantity: number) => void;
    isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<Cart | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const fetcher = useFetcher<any>();

    const isLoading = fetcher.state !== "idle";

    // Load cart from local storage on mount
    useEffect(() => {
        const storedCartId = localStorage.getItem("shopify_cart_id");
        if (storedCartId) {
            // Fetch existing cart
            // We can use a loader here via useFetcher but tricky within effect without triggering loops
            // Better to use a separate fetcher for initial load or just lazy load
            const searchParams = new URLSearchParams();
            searchParams.append("cartId", storedCartId);
            fetcher.load(`/api/cart?${searchParams.toString()}`);
        }
    }, []);

    // Update cart state when fetcher data changes
    useEffect(() => {
        if (fetcher.data) {
            if (fetcher.data.cart) {
                setCart(fetcher.data.cart);
                localStorage.setItem("shopify_cart_id", fetcher.data.cart.id);
            } else if (fetcher.data.id) {
                // Some mutations return the object directly
                // But our API returns { cart: ... } usually, check api.cart.tsx
                // Wait, create/add/update returns { cart: ... } inside the response
                // Let's check api.cart.tsx structure: 
                // return json(result.cartCreate) -> cartCreate has { cart, userErrors }
                // So fetcher.data will be { cart: ..., userErrors: ... }
                if (fetcher.data.cart) {
                    setCart(fetcher.data.cart);
                    localStorage.setItem("shopify_cart_id", fetcher.data.cart.id);
                    // Verify if we should open cart
                    if (fetcher.formMethod === "POST") {
                        setIsOpen(true);
                    }
                }
            }
        }
    }, [fetcher.data]);

    const addToCart = (variantId: string, quantity = 1) => {
        if (!cart) {
            fetcher.submit(
                { action: "create", lines: JSON.stringify([{ merchandiseId: variantId, quantity }]) },
                { method: "post", action: "/api/cart" }
            );
        } else {
            fetcher.submit(
                {
                    action: "add",
                    cartId: cart.id,
                    lines: JSON.stringify([{ merchandiseId: variantId, quantity }])
                },
                { method: "post", action: "/api/cart" }
            );
        }
    };

    const removeFromCart = (lineId: string) => {
        if (!cart) return;
        fetcher.submit(
            {
                action: "remove",
                cartId: cart.id,
                lineIds: JSON.stringify([lineId])
            },
            { method: "post", action: "/api/cart" }
        );
    };

    const updateLine = (lineId: string, quantity: number) => {
        if (!cart) return;
        fetcher.submit(
            {
                action: "update",
                cartId: cart.id,
                lines: JSON.stringify([{ id: lineId, quantity }])
            },
            { method: "post", action: "/api/cart" }
        );
    };

    const openCart = () => setIsOpen(true);
    const closeCart = () => setIsOpen(false);

    return (
        <CartContext.Provider value={{ cart, isOpen, openCart, closeCart, addToCart, removeFromCart, updateLine, isLoading }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
