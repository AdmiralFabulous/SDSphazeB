"""Coqui TTS Configuration

Configures Coqui TTS (open source) for natural voice synthesis with optimized
settings for clarity and low-latency performance.
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class TTSConfig:
    """Coqui TTS configuration for natural voice synthesis.

    Uses VITS models which are fast and high-quality, suitable for real-time
    applications. All processing is done locally with no API costs.

    Attributes:
        model_name: TTS model identifier. Default uses VITS for English
                    (fast, high-quality, low-latency)
        speaker: Speaker name for multi-speaker models (optional)
        language: Language code (e.g., "en" for English)
        device: Device to run inference on ("cuda" or "cpu")
        use_cuda: Whether to use GPU acceleration if available
        vocoder_name: Vocoder model name (optional, uses default if None)
        speed: Speech speed multiplier (1.0 = normal, >1.0 = faster, <1.0 = slower)
                Tuned to 1.0 for natural clarity
    """

    model_name: str = "tts_models/en/ljspeech/vits"  # Fast, high-quality VITS model
    speaker: Optional[str] = None
    language: str = "en"
    device: str = "cpu"
    use_cuda: bool = False
    vocoder_name: Optional[str] = None
    speed: float = 1.0  # Natural speed for clarity

    def __post_init__(self):
        """Validate configuration values."""
        if self.speed <= 0:
            raise ValueError("Speed must be greater than 0")

        if self.device not in ("cpu", "cuda"):
            raise ValueError("Device must be 'cpu' or 'cuda'")

        # Auto-detect CUDA availability
        if self.use_cuda:
            try:
                import torch

                if not torch.cuda.is_available():
                    self.device = "cpu"
                    self.use_cuda = False
                else:
                    self.device = "cuda"
            except ImportError:
                self.device = "cpu"
                self.use_cuda = False
