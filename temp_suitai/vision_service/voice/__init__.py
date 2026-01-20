"""Voice synthesis module

Provides natural voice synthesis using Coqui TTS (open source) with optimized
settings for clarity and low-latency performance. All processing is done locally
with no API costs.
"""

from vision_service.voice.tts_config import TTSConfig
from vision_service.voice.voice_service import VoiceService

__all__ = [
    "TTSConfig",
    "VoiceService",
]
