/**
 * Fabric store slice
 * Manages fabric selection and texture state
 */

import type { Fabric, FabricSelection } from '@/types/fabric';

export interface FabricSliceState extends FabricSelection {
  // State
  fabrics: Fabric[];
  selectedFabricId: string | null;
  isLoadingList: boolean;
  error: string | null;

  // Actions
  setFabrics: (fabrics: Fabric[]) => void;
  setSelectedFabric: (fabricId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSelection: () => void;
  reset: () => void;
}

export const createFabricSlice = (): FabricSliceState => ({
  // Initial state
  fabrics: [],
  selectedFabricId: null,
  isLoadingList: false,
  error: null,

  // Texture state
  fabricId: null,
  fabric: null,
  texture: null,
  isLoading: false,

  // Actions
  setFabrics: (fabrics: Fabric[]) => {
    return { fabrics };
  },

  setSelectedFabric: (fabricId: string) => {
    return {
      selectedFabricId: fabricId,
      fabricId: fabricId,
    };
  },

  setLoading: (loading: boolean) => {
    return { isLoading: loading };
  },

  setError: (error: string | null) => {
    return { error };
  },

  clearSelection: () => {
    return {
      selectedFabricId: null,
      fabricId: null,
      fabric: null,
      texture: null,
      error: null,
    };
  },

  reset: () => {
    return {
      fabrics: [],
      selectedFabricId: null,
      fabricId: null,
      fabric: null,
      texture: null,
      isLoading: false,
      isLoadingList: false,
      error: null,
    };
  },
});
