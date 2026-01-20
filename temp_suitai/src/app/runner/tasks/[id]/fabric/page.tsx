'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import PhotoUpload from '@/components/PhotoUpload';
import PhotoPreview from '@/components/PhotoPreview';
import UploadConfirmation from '@/components/UploadConfirmation';
import type { UploadResponse } from '@/types/photoUpload';
import './page.css';

type UploadState = 'idle' | 'success' | 'error';

export default function FabricPage() {
  const params = useParams();
  const taskId = params.id as string;

  const [photoData, setPhotoData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const handlePhotoCapture = (capturedPhoto: string) => {
    setPhotoData(capturedPhoto);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleRetake = () => {
    setPhotoData(null);
    setError(null);
  };

  const handleConfirmUpload = async () => {
    if (!photoData) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('taskId', taskId);

      const blob = await fetch(photoData).then((res) => res.blob());
      formData.append('photo', blob, `photo-${Date.now()}.jpg`);

      const response = await fetch('/api/runner/tasks/upload-photo', {
        method: 'POST',
        body: formData,
      });

      const data: UploadResponse = await response.json();

      if (response.ok && data.success) {
        setUploadState('success');
        setUploadMessage(data.message);
        setUploadedPhotoUrl(data.photoUrl);
        setPhotoData(null);
      } else {
        setUploadState('error');
        setUploadMessage(data.message || 'Upload failed');
      }
    } catch (err) {
      setUploadState('error');
      setUploadMessage(
        err instanceof Error ? err.message : 'An error occurred during upload'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmationClose = () => {
    if (uploadState === 'success') {
      setUploadState('idle');
      setPhotoData(null);
      setUploadedPhotoUrl(undefined);
    } else {
      setUploadState('idle');
    }
  };

  return (
    <div className="fabric-page">
      <header className="page-header">
        <h1>Upload Fabric Photo</h1>
        <p className="task-info">Task ID: {taskId}</p>
      </header>

      <main className="page-content">
        {error && <div className="error-banner">{error}</div>}

        {!photoData ? (
          <PhotoUpload
            onPhotoCapture={handlePhotoCapture}
            onError={handleError}
          />
        ) : (
          <PhotoPreview
            photoData={photoData}
            onRetake={handleRetake}
            onConfirm={handleConfirmUpload}
            isLoading={isLoading}
          />
        )}
      </main>

      {uploadState !== 'idle' && (
        <UploadConfirmation
          status={uploadState as 'success' | 'error'}
          message={uploadMessage}
          photoUrl={uploadedPhotoUrl}
          onClose={handleConfirmationClose}
        />
      )}
    </div>
  );
}
