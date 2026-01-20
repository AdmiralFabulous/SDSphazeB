# VoxCPM Voice Service

Text-to-speech synthesis using VoxCPM via HuggingFace Spaces with PersonaPlex persona support.

## Overview

This module provides voice synthesis capabilities using **VoxCPM**, an open-source multilingual TTS system available via HuggingFace Spaces. VoxCPM supports:

- **Multiple languages:** English, Chinese, Japanese
- **PersonaPlex integration:** Consistent voice personas
- **Natural prosody:** Expressive, human-like speech
- **Voice cloning:** Persona-based voice characteristics
- **Free API access:** Via HuggingFace Spaces (no API key required)

## VoxCPM vs ElevenLabs

**Why VoxCPM?**
- ✅ **Open-source** - Community-driven development
- ✅ **Free to use** - HuggingFace Spaces API (no API key required)
- ✅ **PersonaPlex support** - Sophisticated persona framework
- ✅ **Multilingual** - Native support for multiple languages
- ✅ **Research-backed** - Based on OpenBMB research

**Trade-offs:**
- Slightly higher latency than commercial services
- Requires internet access to HuggingFace Spaces
- May have usage limits during peak times

## Architecture

```
VoiceService → HuggingFace Spaces → VoxCPM Model → Audio Output
              (Gradio API)          (PersonaPlex)
```

## Quick Start

### Basic Usage

```python
from vision_service.voice import VoiceService

# Initialize with default configuration
voice = VoiceService()

# Synthesize speech
audio_bytes = voice.synthesize("Hello from SUIT AI!")

# Save to file
with open("output.wav", "wb") as f:
    f.write(audio_bytes)
```

### With Custom Configuration

```python
from vision_service.voice import VoiceService, VoxCPMConfig

# Configure VoxCPM
config = VoxCPMConfig(
    persona="friendly",       # PersonaPlex persona
    language="en",            # Language code
    speed=1.2,                # Faster speech
    temperature=0.8,          # More variation
)

# Initialize service
voice = VoiceService(config)

# Synthesize with custom settings
audio_bytes = voice.synthesize(
    "Welcome to calibration!",
    persona="professional",   # Override persona for this synthesis
)
```

### Environment Variables

```env
# Optional HuggingFace token (for authenticated access)
HF_TOKEN=your_token_here

# Default persona
VOXCPM_PERSONA=default

# Default language
VOXCPM_LANGUAGE=en
```

If environment variables are set, VoiceService will use them automatically:

```python
voice = VoiceService()  # Uses env vars
```

## Configuration

### VoxCPMConfig

```python
@dataclass
class VoxCPMConfig:
    api_url: str = "https://openbmb-voxcpm-demo.hf.space"
    hf_token: Optional[str] = None
    persona: str = "default"
    language: str = "en"
    speed: float = 1.0         # 0.5-2.0
    temperature: float = 0.7   # 0.0-1.0
```

### Parameters

- **api_url:** HuggingFace Spaces URL for VoxCPM
- **hf_token:** Optional HuggingFace token (for better rate limits)
- **persona:** PersonaPlex persona ID (default, professional, friendly)
- **language:** Language code (en, zh, ja, auto)
- **speed:** Speech speed multiplier (0.5 = half speed, 2.0 = double speed)
- **temperature:** Sampling temperature (0.0 = deterministic, 1.0 = creative)

## PersonaPlex Personas

PersonaPlex is a framework for consistent voice characteristics. Available personas:

### Default Personas

| ID | Name | Description | Use Case |
|----|------|-------------|----------|
| `default` | Default Voice | Neutral, clear voice | General use |
| `professional` | Professional Voice | Authoritative, business-appropriate | Calibration instructions |
| `friendly` | Friendly Voice | Warm, conversational | User encouragement |

### Custom Personas

To use custom personas, extend the `get_available_personas()` method or configure via PersonaPlex API.

## Language Support

VoxCPM supports multiple languages:

- **en:** English
- **zh:** Chinese (Mandarin)
- **ja:** Japanese
- **auto:** Auto-detect (experimental)

Example:

```python
# English
audio_en = voice.synthesize("Hello!", language="en")

# Chinese
audio_zh = voice.synthesize("你好！", language="zh")

# Japanese
audio_ja = voice.synthesize("こんにちは！", language="ja")
```

## API Details

### VoxCPM HuggingFace Spaces

The service uses the Gradio API interface of the VoxCPM HuggingFace Space:

**URL:** https://huggingface.co/spaces/openbmb/VoxCPM-Demo

**API Endpoint:** `/api/predict`

**Request Format:**
```json
{
  "data": [
    "text to synthesize",
    "persona",
    "language",
    1.0,   // speed
    0.7    // temperature
  ]
}
```

**Response Format:**
```json
{
  "data": [
    {"name": "/file/path/to/audio.wav"}
  ]
}
```

## Error Handling

The service handles common errors:

```python
try:
    audio = voice.synthesize("Test")
except ValueError as e:
    print(f"Invalid input: {e}")
except requests.RequestException as e:
    print(f"API request failed: {e}")
```

Common errors:
- **Empty text:** ValueError
- **Invalid speed/temperature:** ValueError during config creation
- **API timeout:** requests.Timeout (after 30 seconds)
- **Network error:** requests.RequestException

## Performance

**Typical latency:**
- Short text (< 50 chars): 2-4 seconds
- Medium text (50-200 chars): 4-8 seconds
- Long text (> 200 chars): 8-15 seconds

**Optimization tips:**
- Use shorter text segments
- Lower temperature for faster synthesis
- Consider caching frequently used phrases

## Integration with Calibration Dialogue

The VoiceService is integrated with the calibration dialogue system:

```python
# In synthesize_speech.py
voice_service = VoiceService()
audio_bytes = voice_service.synthesize(text)
```

The dialogue system automatically:
1. Receives AI response text
2. Calls VoiceService to synthesize
3. Saves audio to `public/audio/`
4. Returns audio URL to client

## Testing

```python
# Test basic synthesis
from vision_service.voice import VoiceService

voice = VoiceService()
audio = voice.synthesize("Testing VoxCPM TTS")
print(f"Generated {len(audio)} bytes of audio")

# Test personas
for persona in ["default", "professional", "friendly"]:
    audio = voice.synthesize("Hello", persona=persona)
    with open(f"test_{persona}.wav", "wb") as f:
        f.write(audio)
```

## Advanced Usage

### Context Manager

```python
with VoiceService() as voice:
    audio1 = voice.synthesize("First message")
    audio2 = voice.synthesize("Second message")
# Session automatically closed
```

### Batch Processing

```python
voice = VoiceService()
messages = ["Hello", "Welcome", "Goodbye"]

for i, msg in enumerate(messages):
    audio = voice.synthesize(msg)
    with open(f"audio_{i}.wav", "wb") as f:
        f.write(audio)
```

### Custom API URL

If using a self-hosted VoxCPM instance:

```python
config = VoxCPMConfig(
    api_url="http://localhost:7860",  # Local Gradio instance
)
voice = VoiceService(config)
```

## Troubleshooting

### "API request failed"

**Cause:** HuggingFace Spaces may be down or rate-limited

**Solution:**
- Check HuggingFace status: https://status.huggingface.co/
- Wait a few minutes and retry
- Use HF_TOKEN for better rate limits

### "Unexpected API response format"

**Cause:** VoxCPM API changed or updated

**Solution:**
- Check the HuggingFace Space page for updates
- Update the API integration code
- File an issue on the SUIT AI repository

### Slow synthesis

**Cause:** Network latency or server load

**Solution:**
- Use shorter text segments
- Lower temperature setting
- Consider local deployment of VoxCPM

### Audio quality issues

**Cause:** Persona or temperature settings

**Solution:**
- Try different personas
- Adjust temperature (0.5-0.9 range)
- Check input text for unusual characters

## Local Deployment

For production or offline use, consider deploying VoxCPM locally:

```bash
# Clone VoxCPM repository
git clone https://huggingface.co/spaces/openbmb/VoxCPM-Demo

# Install dependencies
pip install -r requirements.txt

# Run Gradio server
python app.py
```

Update configuration:
```python
config = VoxCPMConfig(api_url="http://localhost:7860")
```

## References

- **VoxCPM Paper:** [OpenBMB Research](https://github.com/OpenBMB)
- **HuggingFace Space:** https://huggingface.co/spaces/openbmb/VoxCPM-Demo
- **PersonaPlex:** Voice persona framework for consistent characteristics

## License

VoxCPM is open-source. Check the [HuggingFace Space](https://huggingface.co/spaces/openbmb/VoxCPM-Demo) for license details.

SUIT AI voice integration: Part of SUIT AI v4.b Vision & Measurement Service
