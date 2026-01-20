"use client";

import React, { useState } from "react";
import {
  OrderState,
  getAllOrderStates,
  getStateColor,
  getStateLabel,
  getStateTrack,
} from "@/lib/orderStates";
import { useOrderFilter } from "@/lib/orderContext";
import styles from "./OrderStateFilter.module.css";

// Group states by category for better UX
const STATE_GROUPS = {
  "Payment & Measurement": [
    "S01_PAID",
    "S02_MEASUREMENT_PENDING",
    "S03_MEASUREMENT_RECEIVED",
  ],
  "Pattern & Printing": [
    "S04_PATTERN_PENDING",
    "S05_PATTERN_GENERATED",
    "S06_SENT_TO_PRINTER",
    "S07_PRINT_COLLECTED",
    "S08_PRINT_REJECTED",
  ],
  Manufacturing: [
    "S09_DELIVERED_TO_RAJA",
    "S10_CUTTING_IN_PROGRESS",
    "S11_CUTTING_COMPLETE",
    "S12_STITCHING_IN_PROGRESS",
    "S13_STITCHING_COMPLETE",
  ],
  "Quality Control": ["S14_QC_IN_PROGRESS", "S15_QC_PASSED", "S16_QC_FAILED"],
  "Track A - UK Delivery": ["S17_SHIPPED", "S18_DELIVERED", "S19_COMPLETE"],
  "Track B - UAE Logistics": [
    "S20_FLIGHT_MANIFEST",
    "S21_IN_FLIGHT",
    "S22_LANDED",
    "S23_CUSTOMS_CLEARED",
    "S24_VAN_ASSIGNED",
    "S25_OUT_FOR_DELIVERY",
    "S26_DELIVERED_UAE",
  ],
};

export function OrderStateFilter() {
  const { filterState, setSelectedStates, clearFilters } = useOrderFilter();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    "Manufacturing",
    "Track B - UAE Logistics",
  ]);
  const allStates = getAllOrderStates();

  const handleStateToggle = (state: OrderState) => {
    const isSelected = filterState.selectedStates.includes(state);
    if (isSelected) {
      setSelectedStates(filterState.selectedStates.filter((s) => s !== state));
    } else {
      setSelectedStates([...filterState.selectedStates, state]);
    }
  };

  const handleGroupToggle = (group: string) => {
    setExpandedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group],
    );
  };

  const handleSelectGroup = (group: string) => {
    const groupStates = STATE_GROUPS[group as keyof typeof STATE_GROUPS] || [];
    const allSelected = groupStates.every((s) =>
      filterState.selectedStates.includes(s as OrderState),
    );

    if (allSelected) {
      // Deselect all in group
      setSelectedStates(
        filterState.selectedStates.filter((s) => !groupStates.includes(s)),
      );
    } else {
      // Select all in group
      const newStates = [...filterState.selectedStates];
      groupStates.forEach((s) => {
        if (!newStates.includes(s as OrderState)) {
          newStates.push(s as OrderState);
        }
      });
      setSelectedStates(newStates);
    }
  };

  const handleClear = () => {
    clearFilters();
    setIsOpen(false);
  };

  const displayLabel =
    filterState.selectedStates.length === 0
      ? "Filter by State"
      : `${filterState.selectedStates.length} state(s) selected`;

  // Get track indicator for a state
  const getTrackIndicator = (stateValue: string) => {
    const track = getStateTrack(stateValue as OrderState);
    if (track === "A") return "🇬🇧";
    if (track === "B") return "🇦🇪";
    return "";
  };

  return (
    <div className={styles.filterContainer}>
      <button
        className={styles.triggerButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{displayLabel}</span>
        <span className={styles.chevron}>{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <span className={styles.title}>Order States</span>
            {filterState.selectedStates.length > 0 && (
              <button className={styles.clearButton} onClick={handleClear}>
                Clear
              </button>
            )}
          </div>

          <div className={styles.stateList}>
            {Object.entries(STATE_GROUPS).map(([groupName, groupStates]) => {
              const isExpanded = expandedGroups.includes(groupName);
              const selectedCount = groupStates.filter((s) =>
                filterState.selectedStates.includes(s as OrderState),
              ).length;
              const isTrackB = groupName.includes("Track B");
              const isTrackA = groupName.includes("Track A");

              return (
                <div key={groupName} className={styles.stateGroup}>
                  <div
                    className={`${styles.groupHeader} ${isTrackB ? styles.trackB : ""} ${isTrackA ? styles.trackA : ""}`}
                    onClick={() => handleGroupToggle(groupName)}
                  >
                    <span className={styles.groupChevron}>
                      {isExpanded ? "▼" : "▶"}
                    </span>
                    <span className={styles.groupName}>{groupName}</span>
                    {selectedCount > 0 && (
                      <span className={styles.selectedBadge}>
                        {selectedCount}
                      </span>
                    )}
                    <button
                      className={styles.selectAllBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectGroup(groupName);
                      }}
                    >
                      {groupStates.every((s) =>
                        filterState.selectedStates.includes(s as OrderState),
                      )
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className={styles.groupStates}>
                      {groupStates.map((stateValue) => {
                        const stateInfo = allStates.find(
                          (s) => s.value === stateValue,
                        );
                        if (!stateInfo) return null;

                        return (
                          <label key={stateValue} className={styles.stateItem}>
                            <input
                              type="checkbox"
                              checked={filterState.selectedStates.includes(
                                stateInfo.value,
                              )}
                              onChange={() =>
                                handleStateToggle(stateInfo.value)
                              }
                              className={styles.checkbox}
                            />
                            <span
                              className={styles.colorBadge}
                              style={{ backgroundColor: stateInfo.color }}
                              title={`State: ${stateValue}`}
                            />
                            <span className={styles.label}>
                              {stateInfo.label}
                            </span>
                            <span className={styles.trackIndicator}>
                              {getTrackIndicator(stateValue)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.footer}>
            <div className={styles.trackLegend}>
              <span>🇬🇧 Track A (UK)</span>
              <span>🇦🇪 Track B (UAE)</span>
            </div>
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
