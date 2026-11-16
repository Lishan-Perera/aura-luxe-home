import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  slug: string;
}

interface WishlistState {
  items: WishlistItem[];
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (productId: string) => boolean;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleWishlist: (item) => {
        const exists = get().items.some((i) => i.productId === item.productId);
        if (exists) {
          set({ items: get().items.filter((i) => i.productId !== item.productId) });
        } else {
          set({ items: [...get().items, item] });
        }
      },
      isInWishlist: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'auraluxe_wishlist',
    }
  )
);

