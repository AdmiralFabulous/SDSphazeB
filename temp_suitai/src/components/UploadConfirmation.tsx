'use client';

import './UploadConfirmation.css';

interface UploadConfirmationProps {
  status: 'success' | 'error';
  message: string;
  photoUrl?: string;
  onClose: () => void;
}

export default function UploadConfirmation({
  status,
  message,
  photoUrl,
  onClose,
}: UploadConfirmationProps) {
  const isSuccess = status === 'success';

  return (
    <div className="confirmation-overlay">
      <div className="confirmation-modal">
        <div className={`confirmation-icon ${status}`}>
          {isSuccess ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          )}
        </div>
        <h2 className="confirmation-title">
          {isSuccess ? 'Upload Successful' : 'Upload Failed'}
        </h2>
        <p className="confirmation-message">{message}</p>
        {photoUrl && isSuccess && (
          <div className="uploaded-image">
            <img src={photoUrl} alt="Uploaded photo" />
          </div>
        )}
        <button onClick={onClose} className="confirmation-button">
          {isSuccess ? 'Continue' : 'Try Again'}
        </button>
      </div>
    </div>
  );
}
