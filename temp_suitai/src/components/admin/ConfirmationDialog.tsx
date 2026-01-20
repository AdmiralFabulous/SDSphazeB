'use client';

import { useEffect } from 'react';
import styles from './ConfirmationDialog.module.css';

export interface ConfirmationDialogProps {
  title: string;
  message: string;
  isCritical?: boolean;
  notes: string;
  onNotesChange: (notes: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmationDialog({
  title,
  message,
  isCritical = false,
  notes,
  onNotesChange,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmationDialogProps) {
  // Handle ESC key to close dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, onCancel]);

  return (
    <>
      <div className={styles.overlay} onClick={onCancel} />
      <dialog className={styles.dialog} open>
        <div className={`${styles.content} ${isCritical ? styles.critical : ''}`}>
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <button
              className={styles.closeButton}
              onClick={onCancel}
              disabled={isLoading}
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>

          <p className={styles.message}>{message}</p>

          <div className={styles.notesSection}>
            <label htmlFor="notes" className={styles.label}>
              Additional Notes (optional)
            </label>
            <textarea
              id="notes"
              className={styles.textarea}
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Add any notes about this state transition..."
              disabled={isLoading}
              rows={3}
            />
          </div>

          {isCritical && (
            <div className={styles.warning}>
              <span className={styles.warningIcon}>⚠️</span>
              <span>This action cannot be easily reversed. Please review carefully.</span>
            </div>
          )}

          <div className={styles.footer}>
            <button
              className={styles.cancelButton}
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              className={`${styles.confirmButton} ${isCritical ? styles.critical : ''}`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner}>⏳</span> Updating...
                </>
              ) : (
                'Confirm Transition'
              )}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
