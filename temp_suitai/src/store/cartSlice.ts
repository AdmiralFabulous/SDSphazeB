import { StateCreator } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface CartState {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}

export interface CartActions {
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  calculateTotals: () => void;
}

export type CartSlice = CartState & CartActions;

const initialState: CartState = {
  items: [],
  totalPrice: 0,
  totalItems: 0,
};

export const createCartSlice: StateCreator<CartSlice> = (set) => ({
  ...initialState,
  addItem: (item: CartItem) =>
    set((state) => {
      const existingItem = state.items.find((i) => i.id === item.id);
      if (existingItem) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
          ),
        };
      }
      return { items: [...state.items, item] };
    }),
  removeItem: (id: string) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
  updateQuantity: (id: string, quantity: number) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
      ),
    })),
  clearCart: () => set(initialState),
  calculateTotals: () =>
    set((state) => {
      const totalPrice = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      return { totalPrice, totalItems };
    }),
});
