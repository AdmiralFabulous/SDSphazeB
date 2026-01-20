import { StateCreator } from 'zustand';

export interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  modalOpen: boolean;
  modalContent: string | null;
  toast: {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  };
}

export interface UIActions {
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openModal: (content: string) => void;
  closeModal: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  hideToast: () => void;
}

export type UISlice = UIState & UIActions;

const initialState: UIState = {
  theme: 'light',
  sidebarOpen: true,
  modalOpen: false,
  modalContent: null,
  toast: {
    visible: false,
    message: '',
    type: 'info',
  },
};

export const createUISlice: StateCreator<UISlice> = (set) => ({
  ...initialState,
  setTheme: (theme: 'light' | 'dark') => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  openModal: (content: string) => set({ modalOpen: true, modalContent: content }),
  closeModal: () => set({ modalOpen: false, modalContent: null }),
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') =>
    set({
      toast: {
        visible: true,
        message,
        type,
      },
    }),
  hideToast: () =>
    set({
      toast: {
        visible: false,
        message: '',
        type: 'info',
      },
    }),
});
