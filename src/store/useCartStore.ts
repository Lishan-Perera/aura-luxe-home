import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartStoreItem {
  productId: string;
  title: string;
  price: number; // LKR
  quantity: number;
  image: string;
  variantSku?: string;
  variantTitle?: string;
  maxStock?: number;
}

interface CartState {
  items: CartStoreItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartStoreItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string, variantSku?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantSku?: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (newItem) => {
        const qtyToAdd = newItem.quantity || 1;
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex(
          (i) => i.productId === newItem.productId && i.variantSku === (newItem.variantSku || '')
        );

        if (existingIndex > -1) {
          const updated = [...currentItems];
          const newQty = updated[existingIndex].quantity + qtyToAdd;
          const cappedQty = newItem.maxStock ? Math.min(newQty, newItem.maxStock) : newQty;
          updated[existingIndex].quantity = cappedQty;
          set({ items: updated, isOpen: true });
        } else {
          set({
            items: [
              ...currentItems,
              {
                ...newItem,
                variantSku: newItem.variantSku || '',
                quantity: qtyToAdd,
              },
            ],
            isOpen: true,
          });
        }
      },

      removeItem: (productId, variantSku = '') => {
        set({
          items: get().items.filter(
            (i) => !(i.productId === productId && (i.variantSku || '') === variantSku)
          ),
        });
      },

      updateQuantity: (productId, quantity, variantSku = '') => {
        if (quantity <= 0) {
          get().removeItem(productId, variantSku);
          return;
        }

        set({
          items: get().items.map((item) => {
            if (item.productId === productId && (item.variantSku || '') === variantSku) {
              const finalQty = item.maxStock ? Math.min(quantity, item.maxStock) : quantity;
              return { ...item, quantity: finalQty };
            }
            return item;
          }),
        });
      },

      clearCart: () => set({ items: [] }),

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'auraluxe_cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

