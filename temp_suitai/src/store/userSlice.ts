import { StateCreator } from 'zustand';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences?: Record<string, unknown>;
}

export interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UserActions {
  setUser: (user: UserProfile) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  logout: () => void;
}

export type UserSlice = UserState & UserActions;

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const createUserSlice: StateCreator<UserSlice> = (set) => ({
  ...initialState,
  setUser: (user: UserProfile) => set({ user, isAuthenticated: true }),
  setAuthenticated: (authenticated: boolean) => set({ isAuthenticated: authenticated }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  updateProfile: (updates: Partial<UserProfile>) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
  logout: () => set(initialState),
});
