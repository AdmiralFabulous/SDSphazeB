"""VoxCPM TTS Configuration

Configures VoxCPM (via HuggingFace Spaces) for natural voice synthesis with
PersonaPlex persona support.

VoxCPM is an open-source multilingual TTS system that supports voice cloning
and persona-based synthesis via the PersonaPlex framework.
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class VoxCPMConfig:
    """VoxCPM TTS configuration for natural voice synthesis.

    Attributes:
        api_url: HuggingFace Spaces API URL for VoxCPM
        hf_token: HuggingFace API token (optional, for authenticated access)
        persona: PersonaPlex persona ID or name for voice selection
        language: Language code (e.g., 'en', 'zh', 'ja')
        speed: Speech speed multiplier (0.5-2.0, default: 1.0)
        temperature: Sampling temperature for variability (0.0-1.0, default: 0.7)
    """

    api_url: str = "https://openbmb-voxcpm-demo.hf.space"
    hf_token: Optional[str] = None
    persona: str = "default"  # PersonaPlex persona ID
    language: str = "en"
    speed: float = 1.0
    temperature: float = 0.7

    def __post_init__(self):
        """Validate configuration values."""
        if not 0.5 <= self.speed <= 2.0:
            raise ValueError("Speed must be between 0.5 and 2.0")

        if not 0.0 <= self.temperature <= 1.0:
            raise ValueError("Temperature must be between 0.0 and 1.0")

        if self.language not in ['en', 'zh', 'ja', 'auto']:
            raise ValueError(
                f"Unsupported language: {self.language}. "
                "Supported: 'en', 'zh', 'ja', 'auto'"
            )
