import { StateCreator } from 'zustand';

export interface SessionState {
  sessionId: string | null;
  height: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface SessionActions {
  setSessionId: (id: string) => void;
  setHeight: (height: number) => void;
  setSessionData: (data: Partial<SessionState>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetSession: () => void;
}

export type SessionSlice = SessionState & SessionActions;

const initialState: SessionState = {
  sessionId: null,
  height: null,
  createdAt: null,
  updatedAt: null,
  isLoading: false,
  error: null,
};

export const createSessionSlice: StateCreator<SessionSlice> = (set) => ({
  ...initialState,
  setSessionId: (id: string) => set({ sessionId: id }),
  setHeight: (height: number) => set({ height }),
  setSessionData: (data: Partial<SessionState>) => set(data),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  resetSession: () => set(initialState),
});
