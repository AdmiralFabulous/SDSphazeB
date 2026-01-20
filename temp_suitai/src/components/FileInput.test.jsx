import React, { useState } from 'react';
import FileInput from './FileInput';

/**
 * FileInput Test Suite
 * Comprehensive tests covering all functionality of the FileInput component
 */

describe('FileInput Component', () => {
  describe('Rendering', () => {
    test('renders without crashing', () => {
      const { container } = renderComponent(<FileInput />);
      expect(container).toBeTruthy();
    });

    test('renders with label', () => {
      const { getByText } = renderComponent(
        <FileInput label="Upload Document" />
      );
      expect(getByText('Upload Document')).toBeTruthy();
    });

    test('renders required asterisk when required prop is true', () => {
      const { getByText } = renderComponent(
        <FileInput label="Upload Document" required={true} />
      );
      const requiredElement = getByText('*');
      expect(requiredElement.className).toContain('file-input-required');
    });

    test('renders drop zone with correct role', () => {
      const { getByRole } = renderComponent(<FileInput />);
      const dropZone = getByRole('button');
      expect(dropZone).toBeTruthy();
    });

    test('renders help text when provided', () => {
      const helpText = 'Max 10 files allowed';
      const { getByText } = renderComponent(
        <FileInput helpText={helpText} />
      );
      expect(getByText(helpText)).toBeTruthy();
    });

    test('renders max size information when provided', () => {
      const { getByText } = renderComponent(
        <FileInput maxSize={5 * 1024 * 1024} />
      );
      expect(getByText(/Max file size:/)).toBeTruthy();
    });

    test('renders accepted types when provided', () => {
      const { getByText } = renderComponent(
        <FileInput accept="image/*,.pdf" />
      );
      expect(getByText(/Accepted:/)).toBeTruthy();
    });
  });

  describe('File Selection', () => {
    test('calls onChange when file is selected via input', () => {
      const onChange = jest.fn();
      const { container } = renderComponent(
        <FileInput onChange={onChange} />
      );

      const input = container.querySelector('input[type="file"]');
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      const event = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', {
        value: { files: [file] },
        enumerable: true,
      });

      input.dispatchEvent(event);
      expect(onChange).toHaveBeenCalledWith(file);
    });

    test('displays selected file name', () => {
      const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      const { getByText } = renderComponent(
        <FileInput value={file} onChange={() => {}} />
      );
      expect(getByText('document.pdf')).toBeTruthy();
    });

    test('displays file size', () => {
      const file = new File(['x'.repeat(1024 * 1024)], 'large.txt', { type: 'text/plain' });
      const { getByText } = renderComponent(
        <FileInput value={file} onChange={() => {}} />
      );
      expect(getByText(/1\s*MB/)).toBeTruthy();
    });

    test('displays "files selected" message for multiple files', () => {
      const files = [
        new File(['1'], 'file1.txt', { type: 'text/plain' }),
        new File(['2'], 'file2.txt', { type: 'text/plain' }),
        new File(['3'], 'file3.txt', { type: 'text/plain' }),
      ];
      const { getByText } = renderComponent(
        <FileInput value={files} onChange={() => {}} multiple={true} />
      );
      expect(getByText('3 files selected')).toBeTruthy();
    });

    test('shows remove button when file is selected', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const { getByText } = renderComponent(
        <FileInput value={file} onChange={() => {}} />
      );
      const removeBtn = getByText('Remove');
      expect(removeBtn).toBeTruthy();
    });

    test('clears selection when remove button is clicked', () => {
      const onChange = jest.fn();
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const { getByText } = renderComponent(
        <FileInput value={file} onChange={onChange} />
      );

      const removeBtn = getByText('Remove');
      removeBtn.click();

      expect(onChange).toHaveBeenCalledWith(null);
    });
  });

  describe('Validation - File Type', () => {
    test('validates file extension', () => {
      const onChange = jest.fn();
      const { container, getByRole } = renderComponent(
        <FileInput onChange={onChange} accept=".pdf" />
      );

      const input = container.querySelector('input[type="file"]');
      const invalidFile = new File(['content'], 'document.txt', { type: 'text/plain' });

      const event = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', {
        value: { files: [invalidFile] },
        enumerable: true,
      });

      input.dispatchEvent(event);
      expect(onChange).not.toHaveBeenCalled();

      const errorElement = getByRole('alert', { hidden: false });
      expect(errorElement.textContent).toContain('File type not accepted');
    });

    test('validates MIME type wildcard', () => {
      const onChange = jest.fn();
      const { container } = renderComponent(
        <FileInput onChange={onChange} accept="image/*" />
      );

      const input = container.querySelector('input[type="file"]');
      const imageFile = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });

      const event = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', {
        value: { files: [imageFile] },
        enumerable: true,
      });

      input.dispatchEvent(event);
      expect(onChange).toHaveBeenCalledWith(imageFile);
    });

    test('validates multiple MIME types', () => {
      const onChange = jest.fn();
      const { container } = renderComponent(
        <FileInput onChange={onChange} accept="application/pdf,image/*" />
      );

      const input = container.querySelector('input[type="file"]');
      const pdfFile = new File(['content'], 'doc.pdf', { type: 'application/pdf' });

      const event = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', {
        value: { files: [pdfFile] },
        enumerable: true,
      });

      input.dispatchEvent(event);
      expect(onChange).toHaveBeenCalledWith(pdfFile);
    });

    test('rejects invalid file type', () => {
      const onChange = jest.fn();
      const { container, getByRole } = renderComponent(
        <FileInput onChange={onChange} accept="application/pdf" />
      );

      const input = container.querySelector('input[type="file"]');
      const textFile = new File(['content'], 'note.txt', { type: 'text/plain' });

      const event = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', {
        value: { files: [textFile] },
        enumerable: true,
      });

      input.dispatchEvent(event);
      expect(onChange).not.toHaveBeenCalled();
      const error = getByRole('alert');
      expect(error).toBeTruthy();
    });
  });

  describe('Validation - File Size', () => {
    test('validates maximum file size', () => {
      const onChange = jest.fn();
      const maxSize = 1024; // 1 KB
      const { container, getByRole } = renderComponent(
        <FileInput onChange={onChange} maxSize={maxSize} />
      );

      const input = container.querySelector('input[type="file"]');
      const largeFile = new File(['x'.repeat(2048)], 'large.txt', { type: 'text/plain' });

      const event = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', {
        value: { files: [largeFile] },
        enumerable: true,
      });

      input.dispatchEvent(event);
      expect(onChange).not.toHaveBeenCalled();

      const errorElement = getByRole('alert');
      expect(errorElement.textContent).toContain('File size exceeds limit');
    });

    test('accepts file within size limit', () => {
      const onChange = jest.fn();
      const maxSize = 1024 * 1024; // 1 MB
      const { container } = renderComponent(
        <FileInput onChange={onChange} maxSize={maxSize} />
      );

      const input = container.querySelector('input[type="file"]');
      const smallFile = new File(['content'], 'small.txt', { type: 'text/plain' });

      const event = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', {
        value: { files: [smallFile] },
        enumerable: true,
      });

      input.dispatchEvent(event);
      expect(onChange).toHaveBeenCalledWith(smallFile);
    });
  });

  describe('Drag and Drop', () => {
    test('highlights drop zone on drag over', () => {
      const { getByRole } = renderComponent(<FileInput />);
      const dropZone = getByRole('button');

      const dragOverEvent = new DragEvent('dragover', { bubbles: true });
      Object.defineProperty(dragOverEvent, 'dataTransfer', {
        value: { files: [] },
        enumerable: true,
      });

      dropZone.dispatchEvent(dragOverEvent);
      expect(dropZone.className).toContain('dragging');
    });

    test('removes highlight on drag leave', () => {
      const { getByRole } = renderComponent(<FileInput />);
      const dropZone = getByRole('button');

      // Simulate drag over
      const dragOverEvent = new DragEvent('dragover', { bubbles: true });
      dropZone.dispatchEvent(dragOverEvent);
      expect(dropZone.className).toContain('dragging');

      // Simulate drag leave
      const dragLeaveEvent = new DragEvent('dragleave', { bubbles: true });
      dropZone.dispatchEvent(dragLeaveEvent);
      expect(dropZone.className).not.toContain('dragging');
    });

    test('handles file drop', () => {
      const onChange = jest.fn();
      const { getByRole } = renderComponent(<FileInput onChange={onChange} />);
      const dropZone = getByRole('button');

      const file = new File(['content'], 'dropped.txt', { type: 'text/plain' });
      const dropEvent = new DragEvent('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: { files: [file] },
        enumerable: true,
      });

      dropZone.dispatchEvent(dropEvent);
      expect(onChange).toHaveBeenCalledWith(file);
    });

    test('validates dropped files', () => {
      const onChange = jest.fn();
      const { getByRole } = renderComponent(
        <FileInput onChange={onChange} accept=".pdf" />
      );
      const dropZone = getByRole('button');

      const invalidFile = new File(['content'], 'document.txt', { type: 'text/plain' });
      const dropEvent = new DragEvent('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: { files: [invalidFile] },
        enumerable: true,
      });

      dropZone.dispatchEvent(dropEvent);
      expect(onChange).not.toHaveBeenCalled();
    });

    test('does not accept drop when disabled', () => {
      const onChange = jest.fn();
      const { getByRole } = renderComponent(
        <FileInput onChange={onChange} disabled={true} />
      );
      const dropZone = getByRole('button');

      const file = new File(['content'], 'dropped.txt', { type: 'text/plain' });
      const dropEvent = new DragEvent('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: { files: [file] },
        enumerable: true,
      });

      dropZone.dispatchEvent(dropEvent);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Interaction', () => {
    test('opens file dialog on Enter key', () => {
      const { container, getByRole } = renderComponent(<FileInput />);
      const dropZone = getByRole('button');
      const input = container.querySelector('input[type="file"]');

      const clickSpy = jest.spyOn(input, 'click');

      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
      });

      dropZone.dispatchEvent(enterEvent);
      expect(clickSpy).toHaveBeenCalled();

      clickSpy.mockRestore();
    });

    test('opens file dialog on Space key', () => {
      const { container, getByRole } = renderComponent(<FileInput />);
      const dropZone = getByRole('button');
      const input = container.querySelector('input[type="file"]');

      const clickSpy = jest.spyOn(input, 'click');

      const spaceEvent = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
      });

      dropZone.dispatchEvent(spaceEvent);
      expect(clickSpy).toHaveBeenCalled();

      clickSpy.mockRestore();
    });

    test('does not open dialog when disabled', () => {
      const { container, getByRole } = renderComponent(
        <FileInput disabled={true} />
      );
      const dropZone = getByRole('button');
      const input = container.querySelector('input[type="file"]');

      const clickSpy = jest.spyOn(input, 'click');

      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
      });

      dropZone.dispatchEvent(enterEvent);
      expect(clickSpy).not.toHaveBeenCalled();

      clickSpy.mockRestore();
    });
  });

  describe('Disabled State', () => {
    test('does not accept clicks when disabled', () => {
      const { container, getByRole } = renderComponent(
        <FileInput disabled={true} />
      );
      const dropZone = getByRole('button');
      const input = container.querySelector('input[type="file"]');

      const clickSpy = jest.spyOn(input, 'click');

      dropZone.click();
      expect(clickSpy).not.toHaveBeenCalled();

      clickSpy.mockRestore();
    });

    test('disables file input element', () => {
      const { container } = renderComponent(
        <FileInput disabled={true} />
      );
      const input = container.querySelector('input[type="file"]');
      expect(input.disabled).toBe(true);
    });

    test('applies disabled class to drop zone', () => {
      const { getByRole } = renderComponent(
        <FileInput disabled={true} />
      );
      const dropZone = getByRole('button');
      expect(dropZone.className).toContain('disabled');
    });
  });

  describe('Multiple File Selection', () => {
    test('allows multiple file selection when enabled', () => {
      const { container } = renderComponent(
        <FileInput multiple={true} />
      );
      const input = container.querySelector('input[type="file"]');
      expect(input.multiple).toBe(true);
    });

    test('does not allow multiple file selection by default', () => {
      const { container } = renderComponent(<FileInput />);
      const input = container.querySelector('input[type="file"]');
      expect(input.multiple).toBe(false);
    });

    test('returns array when multiple files selected', () => {
      const onChange = jest.fn();
      const { container } = renderComponent(
        <FileInput onChange={onChange} multiple={true} />
      );

      const input = container.querySelector('input[type="file"]');
      const files = [
        new File(['1'], 'file1.txt', { type: 'text/plain' }),
        new File(['2'], 'file2.txt', { type: 'text/plain' }),
      ];

      const event = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', {
        value: { files },
        enumerable: true,
      });

      input.dispatchEvent(event);
      expect(onChange).toHaveBeenCalledWith(files);
    });

    test('validates each file when multiple selected', () => {
      const onChange = jest.fn();
      const { container } = renderComponent(
        <FileInput onChange={onChange} accept=".pdf" multiple={true} />
      );

      const input = container.querySelector('input[type="file"]');
      const invalidFile = new File(['content'], 'document.txt', { type: 'text/plain' });

      const event = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', {
        value: { files: [invalidFile] },
        enumerable: true,
      });

      input.dispatchEvent(event);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('displays error message', () => {
      const { getByRole } = renderComponent(
        <FileInput error="File upload failed" />
      );
      const errorElement = getByRole('alert');
      expect(errorElement.textContent).toContain('File upload failed');
    });

    test('clears validation error after successful selection', () => {
      const onChange = jest.fn();
      const { container, queryByRole, rerender } = renderComponent(
        <FileInput onChange={onChange} accept=".pdf" />
      );

      // First, trigger validation error
      const input = container.querySelector('input[type="file"]');
      const invalidFile = new File(['content'], 'document.txt', { type: 'text/plain' });

      let event = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', {
        value: { files: [invalidFile] },
        enumerable: true,
      });

      input.dispatchEvent(event);

      // Verify error is shown
      let errorElement = queryByRole('alert');
      expect(errorElement).toBeTruthy();

      // Now select valid file
      const validFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });

      event = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', {
        value: { files: [validFile] },
        enumerable: true,
      });

      input.dispatchEvent(event);

      // Error should be cleared
      errorElement = queryByRole('alert');
      expect(errorElement).toBeFalsy();
    });
  });

  describe('Accessibility', () => {
    test('has proper aria-label', () => {
      const { getByLabelText } = renderComponent(
        <FileInput label="Upload Document" />
      );
      expect(getByLabelText('Upload Document')).toBeTruthy();
    });

    test('has aria-invalid when error present', () => {
      const { getByRole } = renderComponent(
        <FileInput error="Invalid file" />
      );
      const dropZone = getByRole('button');
      expect(dropZone.getAttribute('aria-invalid')).toBe('true');
    });

    test('has aria-describedby for error message', () => {
      const { getByRole } = renderComponent(
        <FileInput error="Invalid file" />
      );
      const dropZone = getByRole('button');
      const describedBy = dropZone.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
    });

    test('drop zone is focusable', () => {
      const { getByRole } = renderComponent(<FileInput />);
      const dropZone = getByRole('button');
      expect(dropZone.tabIndex).toBe(0);
    });

    test('drop zone not focusable when disabled', () => {
      const { getByRole } = renderComponent(
        <FileInput disabled={true} />
      );
      const dropZone = getByRole('button');
      expect(dropZone.tabIndex).toBe(-1);
    });

    test('remove button is accessible', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const { getByLabelText } = renderComponent(
        <FileInput value={file} onChange={() => {}} />
      );
      expect(getByLabelText('Clear file selection')).toBeTruthy();
    });

    test('has role alert for error messages', () => {
      const { getByRole } = renderComponent(
        <FileInput error="Upload failed" />
      );
      const alert = getByRole('alert');
      expect(alert).toBeTruthy();
    });
  });

  describe('Integration', () => {
    test('works with controlled component pattern', () => {
      const TestWrapper = () => {
        const [file, setFile] = React.useState(null);
        return (
          <div>
            <FileInput value={file} onChange={setFile} />
            <div>{file ? file.name : 'No file'}</div>
          </div>
        );
      };

      const { getByText } = renderComponent(<TestWrapper />);
      expect(getByText('No file')).toBeTruthy();
    });

    test('works with forwardRef', () => {
      const ref = React.createRef();
      renderComponent(<FileInput ref={ref} />);
      expect(ref).toBeTruthy();
    });

    test('supports file size formatting', () => {
      const testCases = [
        { bytes: 512, expected: '512 B' },
        { bytes: 1024, expected: '1 KB' },
        { bytes: 1024 * 1024, expected: '1 MB' },
        { bytes: 1024 * 1024 * 1024, expected: '1 GB' },
      ];

      testCases.forEach(({ bytes, expected }) => {
        const file = new File(['x'.repeat(bytes)], 'test.txt', { type: 'text/plain' });
        const { getByText, unmount } = renderComponent(
          <FileInput value={file} onChange={() => {}} />
        );
        expect(getByText(expected)).toBeTruthy();
        unmount();
      });
    });
  });
});

/**
 * Test utility functions
 */

function renderComponent(component) {
  const container = document.createElement('div');
  document.body.appendChild(container);

  let renderResult;
  const render = () => {
    const React = require('react');
    const ReactDOM = require('react-dom/client');
    const root = ReactDOM.createRoot(container);
    root.render(component);
    return root;
  };

  const root = render();

  return {
    container,
    getByText: (text) => Array.from(container.querySelectorAll('*')).find(el => el.textContent.includes(text)),
    getByRole: (role, options) => container.querySelector(`[role="${role}"]`),
    getByLabelText: (text) => container.querySelector(`label:contains("${text}")`),
    queryByRole: (role) => container.querySelector(`[role="${role}"]`),
    unmount: () => root.unmount(),
    rerender: (newComponent) => {
      root.render(newComponent);
    },
  };
}
