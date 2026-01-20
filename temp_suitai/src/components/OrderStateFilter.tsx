'use client';

import React, { useState } from 'react';
import {
  OrderState,
  getAllOrderStates,
  getStateColor,
  getStateLabel,
} from '@/lib/orderStates';
import { useOrderFilter } from '@/lib/orderContext';
import styles from './OrderStateFilter.module.css';

export function OrderStateFilter() {
  const { filterState, setSelectedStates, clearFilters } = useOrderFilter();
  const [isOpen, setIsOpen] = useState(false);
  const allStates = getAllOrderStates();

  const handleStateToggle = (state: OrderState) => {
    const isSelected = filterState.selectedStates.includes(state);
    if (isSelected) {
      setSelectedStates(
        filterState.selectedStates.filter((s) => s !== state),
      );
    } else {
      setSelectedStates([...filterState.selectedStates, state]);
    }
  };

  const handleClear = () => {
    clearFilters();
    setIsOpen(false);
  };

  const displayLabel =
    filterState.selectedStates.length === 0
      ? 'Filter by State'
      : `${filterState.selectedStates.length} state(s) selected`;

  return (
    <div className={styles.filterContainer}>
      <button
        className={styles.triggerButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{displayLabel}</span>
        <span className={styles.chevron}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <span className={styles.title}>Order States</span>
            {filterState.selectedStates.length > 0 && (
              <button
                className={styles.clearButton}
                onClick={handleClear}
              >
                Clear
              </button>
            )}
          </div>

          <div className={styles.stateList}>
            {allStates.map(({ value, label, color }) => (
              <label key={value} className={styles.stateItem}>
                <input
                  type="checkbox"
                  checked={filterState.selectedStates.includes(value)}
                  onChange={() => handleStateToggle(value)}
                  className={styles.checkbox}
                />
                <span
                  className={styles.colorBadge}
                  style={{ backgroundColor: color }}
                  title={`State: ${value}`}
                />
                <span className={styles.label}>{label}</span>
              </label>
            ))}
          </div>

          <div className={styles.footer}>
            <button
              className={styles.doneButton}
              onClick={() => setIsOpen(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
