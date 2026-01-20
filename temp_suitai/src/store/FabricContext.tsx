/**
 * Fabric Store Context
 * Provides centralized state management for fabric selection and textures
 */

import React, { createContext, useCallback, useContext, useReducer } from 'react';
import type { Fabric, FabricSelection } from '@/types/fabric';

interface FabricState {
  fabrics: Fabric[];
  selectedFabricId: string | null;
  selectedFabric: Fabric | null;
  fabricSelection: FabricSelection;
  isLoading: boolean;
  error: string | null;
}

type FabricAction =
  | { type: 'SET_FABRICS'; payload: Fabric[] }
  | { type: 'SELECT_FABRIC'; payload: { fabric: Fabric; texture: any } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'RESET' };

const initialState: FabricState = {
  fabrics: [],
  selectedFabricId: null,
  selectedFabric: null,
  fabricSelection: {
    fabricId: null,
    fabric: null,
    texture: null,
    isLoading: false,
    error: null,
  },
  isLoading: false,
  error: null,
};

const fabricReducer = (state: FabricState, action: FabricAction): FabricState => {
  switch (action.type) {
    case 'SET_FABRICS':
      return {
        ...state,
        fabrics: action.payload,
      };

    case 'SELECT_FABRIC': {
      const { fabric, texture } = action.payload;
      return {
        ...state,
        selectedFabricId: fabric.id,
        selectedFabric: fabric,
        fabricSelection: {
          fabricId: fabric.id,
          fabric,
          texture,
          isLoading: false,
          error: null,
        },
        error: null,
      };
    }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        fabricSelection: {
          ...state.fabricSelection,
          isLoading: action.payload,
        },
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        fabricSelection: {
          ...state.fabricSelection,
          error: action.payload,
        },
      };

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedFabricId: null,
        selectedFabric: null,
        fabricSelection: {
          fabricId: null,
          fabric: null,
          texture: null,
          isLoading: false,
          error: null,
        },
        error: null,
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
};

interface FabricContextType {
  state: FabricState;
  setFabrics: (fabrics: Fabric[]) => void;
  selectFabric: (fabric: Fabric, texture: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSelection: () => void;
  reset: () => void;
}

const FabricContext = createContext<FabricContextType | undefined>(undefined);

interface FabricProviderProps {
  children: React.ReactNode;
}

/**
 * Fabric Store Provider
 * Wraps application with fabric state management
 */
export function FabricProvider({ children }: FabricProviderProps) {
  const [state, dispatch] = useReducer(fabricReducer, initialState);

  const setFabrics = useCallback((fabrics: Fabric[]) => {
    dispatch({ type: 'SET_FABRICS', payload: fabrics });
  }, []);

  const selectFabric = useCallback((fabric: Fabric, texture: any) => {
    dispatch({ type: 'SELECT_FABRIC', payload: { fabric, texture } });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const value: FabricContextType = {
    state,
    setFabrics,
    selectFabric,
    setLoading,
    setError,
    clearSelection,
    reset,
  };

  return <FabricContext.Provider value={value}>{children}</FabricContext.Provider>;
}

/**
 * Hook to use Fabric store
 */
export function useFabricStore(): FabricContextType {
  const context = useContext(FabricContext);

  if (!context) {
    throw new Error('useFabricStore must be used within FabricProvider');
  }

  return context;
}

export type { FabricContextType, FabricState };
