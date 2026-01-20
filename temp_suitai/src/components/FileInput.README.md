# FileInput Component Documentation

## Overview

`FileInput` is a production-ready React component for handling file uploads with comprehensive features including drag-and-drop support, file type validation, size constraints, and full accessibility support.

**Features:**
- ✅ Drag-and-drop file upload
- ✅ File type validation (MIME types and extensions)
- ✅ File size validation
- ✅ Multiple file selection support
- ✅ Full keyboard accessibility
- ✅ ARIA labels and semantic HTML
- ✅ Responsive design with mobile support
- ✅ Dark mode support
- ✅ High contrast mode support
- ✅ Reduced motion support
- ✅ Zero external dependencies
- ✅ Comprehensive error handling

## Installation

The component is located at `src/components/FileInput.jsx` with accompanying styles at `src/components/FileInput.css`.

### Required Files

```
src/components/
├── FileInput.jsx         # Component implementation
├── FileInput.css         # Component styles
└── FileInput.test.jsx    # Test suite (optional)
```

## API Reference

### Props

#### `value` (File | File[] | null)
Currently selected file(s).

```javascript
<FileInput value={file} onChange={setFile} />
```

#### `onChange` (function)
Callback function triggered when file selection changes.

Signature: `(file: File | File[] | null) => void`

```javascript
const handleFileChange = (file) => {
  console.log('File selected:', file);
};

<FileInput onChange={handleFileChange} />
```

#### `label` (string)
Label displayed above the input.

```javascript
<FileInput label="Upload Your Document" />
```

#### `accept` (string)
Accepted file types - can be MIME types, wildcards, or file extensions (comma-separated).

```javascript
// MIME types
<FileInput accept="application/pdf" />

// Wildcards
<FileInput accept="image/*" />

// Multiple types
<FileInput accept="image/*,application/pdf,.xlsx" />

// File extensions
<FileInput accept=".pdf,.docx,.txt" />
```

#### `multiple` (boolean)
Allow selection of multiple files. Default: `false`

```javascript
<FileInput multiple={true} />
```

When `multiple` is true:
- `onChange` receives an array of files
- UI displays "N files selected"
- File input allows multi-select

#### `maxSize` (number)
Maximum file size in bytes. Files exceeding this limit are rejected.

```javascript
// 5 MB limit
<FileInput maxSize={5 * 1024 * 1024} />

// 100 MB limit
<FileInput maxSize={100 * 1024 * 1024} />
```

Error message displays the exact size limit and attempted file size.

#### `disabled` (boolean)
Disable file input. Default: `false`

```javascript
<FileInput disabled={true} />
```

When disabled:
- Drop zone is visually disabled
- Cannot select files via click or drag
- Cannot select via keyboard (Enter/Space)

#### `error` (string)
Error message to display. Automatically shown in alert box.

```javascript
<FileInput error="File upload failed" />
```

#### `required` (boolean)
Mark field as required. Shows asterisk (*) next to label. Default: `false`

```javascript
<FileInput label="Upload Document" required={true} />
```

#### `helpText` (string)
Additional help text displayed below the drop zone.

```javascript
<FileInput helpText="Upload high-quality images for best results" />
```

#### `ref` (React.Ref)
Forward ref to access component instance.

```javascript
const fileInputRef = useRef(null);

<FileInput ref={fileInputRef} />
```

### Display Properties

#### File Size Formatting

File sizes are automatically formatted for display:
- Bytes: "512 B", "1024 B"
- Kilobytes: "1 KB", "500 KB"
- Megabytes: "1 MB", "50 MB"
- Gigabytes: "1 GB", "2 GB"

#### Multiple Files Display

When `multiple={true}` and files are selected:
- Single file: Shows filename
- Multiple files: Shows "N files selected"

## Usage Examples

### Basic File Upload

```javascript
import { useState } from 'react';
import FileInput from './components/FileInput';

function App() {
  const [document, setDocument] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!document) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('document', document);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    console.log('Upload result:', result);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FileInput
        label="Upload Document"
        value={document}
        onChange={setDocument}
        required={true}
      />
      <button type="submit">Upload</button>
    </form>
  );
}
```

### Image Upload with Preview

```javascript
import { useState } from 'react';
import FileInput from './components/FileInput';

function ImageUpload() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageChange = (file) => {
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  return (
    <div>
      <FileInput
        label="Upload Profile Picture"
        value={image}
        onChange={handleImageChange}
        accept="image/*"
        maxSize={2 * 1024 * 1024}
        helpText="Max 2 MB. Recommended: JPG, PNG"
      />
      {preview && (
        <div>
          <img src={preview} alt="Preview" style={{ maxWidth: '200px' }} />
        </div>
      )}
    </div>
  );
}
```

### Multiple File Upload

```javascript
import { useState } from 'react';
import FileInput from './components/FileInput';

function MultiFileUpload() {
  const [files, setFiles] = useState([]);

  const handleUpload = async () => {
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file-${index}`, file);
    });

    const response = await fetch('/api/bulk-upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    console.log('Upload complete:', result);
  };

  return (
    <div>
      <FileInput
        label="Upload Multiple Files"
        value={files}
        onChange={setFiles}
        accept=".pdf,.docx,.xlsx"
        multiple={true}
        maxSize={5 * 1024 * 1024}
        helpText="Select up to 10 files"
      />
      <button onClick={handleUpload} disabled={files.length === 0}>
        Upload {files.length} File{files.length !== 1 ? 's' : ''}
      </button>
    </div>
  );
}
```

### With Custom Validation

```javascript
import { useState } from 'react';
import FileInput from './components/FileInput';

function CustomValidationExample() {
  const [file, setFile] = useState(null);
  const [customError, setCustomError] = useState(null);

  const handleFileChange = (selectedFile) => {
    setCustomError(null);

    if (selectedFile) {
      // Custom validation
      if (selectedFile.name.includes(' ')) {
        setCustomError('File name cannot contain spaces');
        return;
      }

      if (!selectedFile.name.match(/\.[a-zA-Z0-9]+$/)) {
        setCustomError('File must have an extension');
        return;
      }
    }

    setFile(selectedFile);
  };

  return (
    <FileInput
      label="Upload File"
      value={file}
      onChange={handleFileChange}
      error={customError}
      accept=".pdf,.txt"
    />
  );
}
```

### Loading State

```javascript
import { useState } from 'react';
import FileInput from './components/FileInput';

function UploadWithLoading() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleUpload = async (file) => {
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      console.log('Success:', result);
      setFile(null); // Clear after success
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <FileInput
        label="Upload Document"
        value={file}
        onChange={setFile}
        disabled={isUploading}
        error={uploadError}
      />
      <button
        onClick={() => handleUpload(file)}
        disabled={!file || isUploading}
      >
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}
```

## Accessibility Features

### ARIA Labels
- `aria-label` on drop zone
- `aria-invalid` for error state
- `aria-describedby` linking to error messages

### Keyboard Support
- **Enter/Space**: Open file dialog
- **Tab**: Navigate to drop zone
- **Shift+Tab**: Navigate backwards

### Semantic HTML
- Proper `<label>` elements for form context
- `<input type="file">` for native file access
- `role="button"` on drop zone for screen readers
- `role="alert"` for error messages

### Color Contrast
- Meets WCAG AA standards
- High contrast mode support via `@media (prefers-contrast: more)`
- Dark mode support via `@media (prefers-color-scheme: dark)`

### Motion
- Reduced motion support via `@media (prefers-reduced-motion: reduce)`
- Animations disabled for users who prefer reduced motion

## Styling & Customization

### CSS Classes

All CSS classes follow the BEM convention:

```
.file-input-wrapper           # Main wrapper
.file-input-label             # Label element
.file-input-required          # Required asterisk
.file-input-drop-zone         # Drop zone container
.file-input-drop-zone.dragging    # State: dragging
.file-input-drop-zone.error       # State: error
.file-input-drop-zone.disabled    # State: disabled
.file-input-placeholder       # Placeholder content
.file-input-selected          # Selected file display
.file-input-icon              # Icon SVG
.file-input-main-text         # Main instruction text
.file-input-help-text         # Help text
.file-input-max-size          # Max size info
.file-input-accept-types      # Accepted types info
.file-input-file-name         # Selected file name
.file-input-file-size         # Selected file size
.file-input-clear-btn         # Remove button
.file-input-error             # Error message
.file-input-helper            # Helper text
```

### Customizing Appearance

Override styles in your own CSS:

```css
/* Change primary color */
.file-input-drop-zone:hover {
  border-color: #8b5cf6;
  background-color: #faf5ff;
}

/* Increase padding */
.file-input-drop-zone {
  padding: 3rem 2rem;
}

/* Custom font */
.file-input-label {
  font-family: 'Courier New', monospace;
}

/* Larger icons */
.file-input-icon {
  width: 4rem;
  height: 4rem;
}
```

## Error Handling

### Validation Types

1. **File Type Validation**
   - MIME type checking
   - Extension validation
   - Wildcard support (image/*, application/*)

2. **File Size Validation**
   - Bytes comparison
   - User-friendly error messages
   - Size formatting in errors

3. **Multiple File Validation**
   - Each file validated individually
   - Entire selection rejected if any file fails

### Error Messages

```javascript
// File type error
"File type not accepted. Allowed types: image/*,.pdf"

// File size error
"File size exceeds limit. Max: 5.00MB, Got: 7.50MB"

// Custom validation error
<FileInput error="Custom error message" />
```

## Testing

### Unit Tests

The component includes 40+ comprehensive test cases covering:
- Rendering and props
- File selection (input, drag-drop)
- Type validation
- Size validation
- Multiple files
- Keyboard interaction
- Accessibility
- Error handling

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test FileInput.test.jsx

# Run with coverage
npm test -- --coverage
```

### Test Examples

```javascript
// Test file selection
test('calls onChange when file is selected', () => {
  const onChange = jest.fn();
  const { getByText } = render(
    <FileInput onChange={onChange} />
  );
  // ... trigger file selection
  expect(onChange).toHaveBeenCalled();
});

// Test validation
test('rejects invalid file type', () => {
  const { getByRole } = render(
    <FileInput accept=".pdf" />
  );
  // ... select .txt file
  const error = getByRole('alert');
  expect(error).toContain('File type not accepted');
});
```

## Performance

- **No dependencies**: Uses only React built-ins
- **Optimized re-renders**: `useCallback` for all handlers
- **Lazy validation**: Only validates on selection
- **Memory efficient**: File references, not copies
- **Fast drag-drop**: Minimal DOM updates

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Troubleshooting

### Issue: File selection not working

**Solution**: Check that the component isn't wrapped in a `<form>` element that prevents event propagation, or ensure `event.preventDefault()` is called properly.

### Issue: Drag-drop not working

**Solution**: Ensure the component is fully rendered and not hidden behind other elements. Check that `onDragOver` doesn't have `e.preventDefault()` conflicting with other handlers.

### Issue: Multiple files not working

**Solution**: Set `multiple={true}` on the component and ensure your `onChange` handler expects an array.

### Issue: Styles not applying

**Solution**: Verify that `FileInput.css` is imported in your application. Check for CSS specificity conflicts.

## Best Practices

1. **Always use controlled component pattern** with `value` and `onChange`
2. **Set appropriate `accept` values** to guide users
3. **Validate file size** using `maxSize` prop
4. **Provide clear error messages** with the `error` prop
5. **Use `label`** for form context
6. **Add `helpText`** for user guidance
7. **Test keyboard navigation** for accessibility
8. **Consider file preview** for images
9. **Implement loading states** during upload
10. **Validate on server side** in addition to client

## License

This component is part of the SUIT AI Runner project.

## Support

For issues, feature requests, or improvements, please refer to the project's issue tracker.
