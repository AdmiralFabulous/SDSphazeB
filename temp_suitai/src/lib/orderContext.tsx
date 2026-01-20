'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { OrderState } from './orderStates';

interface OrderFilterState {
  selectedStates: OrderState[];
}

interface OrderFilterContextType {
  filterState: OrderFilterState;
  setSelectedStates: (states: OrderState[]) => void;
  toggleState: (state: OrderState) => void;
  clearFilters: () => void;
}

const OrderFilterContext = createContext<OrderFilterContextType | undefined>(
  undefined,
);

export function OrderFilterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [filterState, setFilterState] = useState<OrderFilterState>({
    selectedStates: [],
  });

  const setSelectedStates = useCallback((states: OrderState[]) => {
    setFilterState({ selectedStates: states });
  }, []);

  const toggleState = useCallback((state: OrderState) => {
    setFilterState((prev) => {
      const isSelected = prev.selectedStates.includes(state);
      return {
        selectedStates: isSelected
          ? prev.selectedStates.filter((s) => s !== state)
          : [...prev.selectedStates, state],
      };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilterState({ selectedStates: [] });
  }, []);

  return (
    <OrderFilterContext.Provider
      value={{ filterState, setSelectedStates, toggleState, clearFilters }}
    >
      {children}
    </OrderFilterContext.Provider>
  );
}

export function useOrderFilter() {
  const context = useContext(OrderFilterContext);
  if (context === undefined) {
    throw new Error('useOrderFilter must be used within OrderFilterProvider');
  }
  return context;
}
