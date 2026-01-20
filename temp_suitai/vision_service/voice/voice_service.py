"""Coqui TTS Voice Service

Provides text-to-speech synthesis using Coqui TTS (open source) with optimized
settings for clarity and low-latency performance. All processing is done locally
with no API costs.
"""

import os
from io import BytesIO
from typing import Optional

import numpy as np
from scipy.io import wavfile

from vision_service.voice.tts_config import TTSConfig


class VoiceService:
    """Voice synthesis service using Coqui TTS.

    Provides low-latency, natural-sounding text-to-speech synthesis using
    open-source models. All processing is done locally with GPU acceleration
    support for even faster synthesis.
    """

    def __init__(self, config: Optional[TTSConfig] = None):
        """Initialize the voice service with Coqui TTS configuration.

        Args:
            config: TTSConfig instance. If None, uses default configuration
                   with environment variable overrides.
        """
        if config is None:
            config = TTSConfig()

        self.config = config
        self._tts = None
        self._initialize_tts()

    def _initialize_tts(self):
        """Initialize the TTS model."""
        try:
            from TTS.api import TTS
        except ImportError:
            raise ImportError(
                "TTS package not installed. Install with: pip install TTS"
            )

        # Initialize TTS with selected model
        self._tts = TTS(
            model_name=self.config.model_name,
            vocoder_name=self.config.vocoder_name,
            progress_bar=False,
        )

        # Move to GPU if CUDA is enabled
        if self.config.use_cuda:
            self._tts.to(self.config.device)

    def synthesize(self, text: str, output_path: Optional[str] = None) -> bytes:
        """Synthesize text to speech using Coqui TTS.

        Uses the configured VITS model for fast, high-quality synthesis.

        Args:
            text: Text to synthesize
            output_path: Optional path to save audio file. If None, returns bytes only.

        Returns:
            Audio bytes in WAV format

        Raises:
            ValueError: If text is empty
            RuntimeError: If synthesis fails
        """
        if not text or not text.strip():
            raise ValueError("Text cannot be empty")

        try:
            # Generate speech
            if self.config.speaker:
                wav = self._tts.tts(
                    text=text.strip(),
                    speaker=self.config.speaker,
                    language=self.config.language,
                    speed=self.config.speed,
                )
            else:
                wav = self._tts.tts(
                    text=text.strip(),
                    language=self.config.language,
                    speed=self.config.speed,
                )

            # Convert to numpy array if not already
            if not isinstance(wav, np.ndarray):
                wav = np.array(wav)

            # Save to file if path provided
            if output_path:
                self._tts.tts_to_file(
                    text=text.strip(),
                    file_path=output_path,
                    speaker=self.config.speaker,
                    language=self.config.language,
                    speed=self.config.speed,
                )

            # Convert to bytes (WAV format)
            byte_io = BytesIO()
            sample_rate = self._tts.synthesizer.output_sample_rate
            wavfile.write(byte_io, sample_rate, wav)
            byte_io.seek(0)

            return byte_io.read()

        except Exception as e:
            raise RuntimeError(f"TTS synthesis failed: {str(e)}")

    def get_available_models(self) -> list:
        """Get list of available TTS models.

        Returns:
            List of available model names
        """
        try:
            from TTS.api import TTS

            return TTS.list_models()
        except ImportError:
            raise ImportError(
                "TTS package not installed. Install with: pip install TTS"
            )

    def get_available_speakers(self) -> list:
        """Get list of available speakers for the current model.

        Returns:
            List of speaker names (empty if model is single-speaker)
        """
        if self._tts and hasattr(self._tts, "speakers") and self._tts.speakers:
            return self._tts.speakers
        return []

    def close(self):
        """Clean up resources."""
        if self._tts:
            del self._tts
            self._tts = None

    def __enter__(self):
        """Context manager entry."""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.close()
