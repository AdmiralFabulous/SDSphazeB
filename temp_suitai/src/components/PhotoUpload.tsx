'use client';

import { useRef, useEffect, useState } from 'react';
import './PhotoUpload.css';

interface PhotoUploadProps {
  onPhotoCapture: (photoData: string) => void;
  onError: (error: string) => void;
}

export default function PhotoUpload({ onPhotoCapture, onError }: PhotoUploadProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        setCameraError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unable to access camera';
        setCameraError(errorMessage);
        onError(errorMessage);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [onError]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const photoData = canvasRef.current.toDataURL('image/jpeg');
        onPhotoCapture(photoData);
      }
    }
  };

  if (cameraError) {
    return (
      <div className="photo-upload-error">
        <p>Camera Access Error</p>
        <p className="error-message">{cameraError}</p>
        <p className="error-hint">Please check your browser permissions and try again.</p>
      </div>
    );
  }

  return (
    <div className="photo-upload-container">
      <div className="camera-feed">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="video-stream"
        />
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {isCameraActive && (
        <button onClick={capturePhoto} className="capture-button">
          Capture Photo
        </button>
      )}
    </div>
  );
}
