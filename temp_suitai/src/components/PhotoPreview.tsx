'use client';

import { CSSProperties } from 'react';
import './PhotoPreview.css';

interface PhotoPreviewProps {
  photoData: string;
  onRetake: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function PhotoPreview({
  photoData,
  onRetake,
  onConfirm,
  isLoading = false,
}: PhotoPreviewProps) {
  return (
    <div className="photo-preview-container">
      <div className="preview-image-wrapper">
        <img
          src={photoData}
          alt="Photo preview"
          className="preview-image"
        />
      </div>
      <div className="preview-actions">
        <button
          onClick={onRetake}
          className="action-button retake-button"
          disabled={isLoading}
        >
          Retake Photo
        </button>
        <button
          onClick={onConfirm}
          className="action-button confirm-button"
          disabled={isLoading}
          style={isLoading ? { opacity: 0.6, cursor: 'not-allowed' } as CSSProperties : {}}
        >
          {isLoading ? 'Uploading...' : 'Confirm & Upload'}
        </button>
      </div>
    </div>
  );
}
