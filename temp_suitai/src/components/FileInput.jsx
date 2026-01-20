import React, { useState, useRef, useCallback } from 'react';
import './FileInput.css';

/**
 * FileInput Component
 *
 * A production-ready file input component with drag-and-drop support,
 * file type validation, and size constraints.
 *
 * @component
 * @example
 * const [file, setFile] = useState(null);
 * <FileInput
 *   value={file}
 *   onChange={setFile}
 *   label="Upload Document"
 *   accept="application/pdf,image/*"
 *   maxSize={5 * 1024 * 1024}
 * />
 *
 * @param {Object} props - Component props
 * @param {File|null} props.value - Currently selected file
 * @param {(file: File|null) => void} props.onChange - Callback when file is selected/cleared
 * @param {string} [props.label] - Label for the input
 * @param {string} [props.accept] - Accepted file types (MIME types or extensions)
 * @param {boolean} [props.multiple=false] - Allow multiple file selection
 * @param {number} [props.maxSize] - Maximum file size in bytes
 * @param {boolean} [props.disabled=false] - Disable the input
 * @param {string} [props.error] - Error message to display
 * @param {boolean} [props.required=false] - Mark as required field
 * @param {string} [props.helpText] - Additional help text
 * @returns {React.ReactElement}
 */
const FileInput = React.forwardRef(({
  value = null,
  onChange,
  label,
  accept,
  multiple = false,
  maxSize,
  disabled = false,
  error,
  required = false,
  helpText,
}, ref) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState(error);

  // Update validation error when error prop changes
  React.useEffect(() => {
    setValidationError(error);
  }, [error]);

  /**
   * Validates file selection against constraints
   * @param {File|File[]} files - File(s) to validate
   * @returns {boolean} - True if valid
   */
  const validateFile = useCallback((files) => {
    if (!files) return false;

    const fileArray = Array.isArray(files) ? files : [files];

    for (const file of fileArray) {
      // Check file type
      if (accept) {
        const acceptedTypes = accept.split(',').map(type => type.trim());
        const isAccepted = acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            // File extension (e.g., .pdf, .xlsx)
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          // MIME type (e.g., image/*, application/pdf)
          if (type.includes('*')) {
            const [mainType] = type.split('/');
            const [fileMainType] = file.type.split('/');
            return mainType === '*' || fileMainType === mainType;
          }
          return file.type === type;
        });

        if (!isAccepted) {
          setValidationError(`File type not accepted. Allowed types: ${accept}`);
          return false;
        }
      }

      // Check file size
      if (maxSize && file.size > maxSize) {
        const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
        setValidationError(`File size exceeds limit. Max: ${maxSizeMB}MB, Got: ${fileSizeMB}MB`);
        return false;
      }
    }

    setValidationError(null);
    return true;
  }, [accept, maxSize]);

  /**
   * Handles file selection from input or drag-drop
   * @param {File|File[]} files - Selected file(s)
   */
  const handleFileSelect = useCallback((files) => {
    if (disabled) return;

    if (validateFile(files)) {
      if (multiple) {
        onChange(Array.from(files));
      } else {
        onChange(Array.isArray(files) ? files[0] : files);
      }
    }
  }, [validateFile, onChange, disabled, multiple]);

  /**
   * Handles file input change event
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleInputChange = useCallback((e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  /**
   * Handles drag over event
   * @param {React.DragEvent<HTMLDivElement>} e
   */
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  /**
   * Handles drag leave event
   * @param {React.DragEvent<HTMLDivElement>} e
   */
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  /**
   * Handles drop event
   * @param {React.DragEvent<HTMLDivElement>} e
   */
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect, disabled]);

  /**
   * Handles click on the drop zone
   */
  const handleZoneClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  /**
   * Clears the selected file
   */
  const handleClear = useCallback(() => {
    onChange(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onChange]);

  /**
   * Formats file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} - Formatted size
   */
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  /**
   * Gets the file name for display
   * @returns {string}
   */
  const getDisplayFileName = () => {
    if (Array.isArray(value)) {
      return value.length === 1
        ? value[0].name
        : `${value.length} files selected`;
    }
    return value?.name || '';
  };

  const hasError = !!validationError;
  const isSelected = (Array.isArray(value) && value.length > 0) || (!Array.isArray(value) && value);

  return (
    <div className="file-input-wrapper">
      {label && (
        <label className="file-input-label">
          {label}
          {required && <span className="file-input-required">*</span>}
        </label>
      )}

      <div
        className={`file-input-drop-zone ${isDragging ? 'dragging' : ''} ${hasError ? 'error' : ''} ${disabled ? 'disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleZoneClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={label || 'File input'}
        aria-invalid={hasError}
        aria-describedby={validationError ? `error-${Math.random()}` : undefined}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            handleZoneClick();
          }
        }}
      >
        {isSelected ? (
          <div className="file-input-selected">
            <svg
              className="file-input-icon file-input-success-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            <p className="file-input-file-name">{getDisplayFileName()}</p>
            {!Array.isArray(value) && value && (
              <p className="file-input-file-size">{formatFileSize(value.size)}</p>
            )}
            <button
              type="button"
              className="file-input-clear-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              aria-label="Clear file selection"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="file-input-placeholder">
            <svg
              className="file-input-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="file-input-main-text">
              Drag files here or click to browse
            </p>
            {helpText && (
              <p className="file-input-help-text">{helpText}</p>
            )}
            {maxSize && (
              <p className="file-input-max-size">
                Max file size: {formatFileSize(maxSize)}
              </p>
            )}
            {accept && (
              <p className="file-input-accept-types">
                Accepted: {accept}
              </p>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled}
        className="file-input-hidden"
        aria-hidden="true"
      />

      {validationError && (
        <div
          className="file-input-error"
          id={`error-${Math.random()}`}
          role="alert"
        >
          {validationError}
        </div>
      )}

      {helpText && !validationError && (
        <div className="file-input-helper">
          {helpText}
        </div>
      )}
    </div>
  );
});

FileInput.displayName = 'FileInput';

export default FileInput;
