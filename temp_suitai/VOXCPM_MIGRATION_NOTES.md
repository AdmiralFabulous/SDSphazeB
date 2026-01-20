# Migration to VoxCPM TTS

**Date:** 2026-01-20
**Reason:** Switched from ElevenLabs to VoxCPM for open-source, free TTS

---

## What Changed

### Replaced Components

| Component | Before | After |
|-----------|--------|-------|
| TTS Service | ElevenLabs (Commercial) | VoxCPM (Open-source) |
| API Access | ElevenLabs API Key required | HuggingFace Spaces (no key required) |
| Configuration | `elevenlabs_config.py` | `voxcpm_config.py` |
| Voice Selection | Voice ID | PersonaPlex Persona |
| Cost | $$ (pay per use) | Free (HuggingFace Spaces) |

### Files Modified

**Removed:**
- `vision_service/voice/elevenlabs_config.py`

**Added:**
- `vision_service/voice/voxcpm_config.py`
- `vision_service/voice/README.md`

**Updated:**
- `vision_service/voice/voice_service.py` (complete rewrite for VoxCPM)
- `vision_service/voice/__init__.py` (export VoxCPMConfig)
- `.env.example` (VoxCPM environment variables)
- `vision_service/requirements.txt` (removed ElevenLabs comment)
- `QUICK_START_CALIBRATION_DIALOGUE.md` (updated setup instructions)

---

## Benefits of VoxCPM

### ✅ Advantages

1. **Open-Source**
   - Community-driven development
   - Transparent implementation
   - No vendor lock-in

2. **Free to Use**
   - No API key required (for basic use)
   - HuggingFace Spaces hosting
   - Optional HF_TOKEN for better rate limits

3. **PersonaPlex Integration**
   - Sophisticated persona framework
   - Consistent voice characteristics
   - Customizable personas

4. **Multilingual Support**
   - English, Chinese, Japanese
   - Native language support
   - Auto-detect capability

5. **Research-Backed**
   - Based on OpenBMB research
   - State-of-the-art TTS technology
   - Active development

### ⚠️ Trade-offs

1. **Latency**
   - Slightly higher than commercial services (2-8s vs 1-3s)
   - Network-dependent (HuggingFace Spaces)

2. **Availability**
   - Requires internet connection
   - Subject to HuggingFace Spaces availability
   - May have usage limits during peak times

3. **Voice Quality**
   - High quality but different from ElevenLabs
   - Different prosody characteristics
   - Less voice customization options (currently)

---

## Environment Variable Changes

### Before (ElevenLabs)

```env
ELEVENLABS_API_KEY=your_api_key_here
```

### After (VoxCPM)

```env
# Optional - for better rate limits
HF_TOKEN=your_huggingface_token_here

# Default persona (default, professional, friendly)
VOXCPM_PERSONA=default

# Default language (en, zh, ja, auto)
VOXCPM_LANGUAGE=en
```

**Note:** `HF_TOKEN` is optional. The system works without it but may have rate limits.

---

## API Changes

### Before (ElevenLabs)

```python
from vision_service.voice import VoiceService, ElevenLabsConfig

config = ElevenLabsConfig(
    api_key="your_key",
    voice_id="21m00Tcm4TlvDq8ikWAM",
    stability=0.75,
    similarity_boost=0.75,
)

voice = VoiceService(config)
audio = voice.synthesize("Hello!")  # Returns MP3
```

### After (VoxCPM)

```python
from vision_service.voice import VoiceService, VoxCPMConfig

config = VoxCPMConfig(
    persona="default",      # PersonaPlex persona
    language="en",
    speed=1.0,
    temperature=0.7,
)

voice = VoiceService(config)
audio = voice.synthesize("Hello!")  # Returns WAV
```

---

## Configuration Parameter Mapping

| ElevenLabs | VoxCPM | Description |
|------------|--------|-------------|
| `api_key` | `hf_token` (optional) | Authentication |
| `voice_id` | `persona` | Voice selection |
| `model_id` | N/A (auto) | Model selection |
| `stability` | `temperature` | Voice variation |
| `similarity_boost` | N/A | Voice consistency |
| N/A | `speed` | Speech speed (0.5-2.0) |
| N/A | `language` | Language selection |

---

## Audio Format Changes

| Aspect | ElevenLabs | VoxCPM |
|--------|------------|--------|
| Format | MP3 | WAV |
| Bitrate | Variable | 16-bit PCM |
| Sample Rate | 44.1 kHz | 22.05 kHz (typical) |
| File Size | Smaller | Larger |

**Impact:** Audio files may be larger with VoxCPM. Consider compression if storage is a concern.

---

## Migration Checklist

If migrating from an existing ElevenLabs setup:

- [ ] Remove `ELEVENLABS_API_KEY` from `.env.local`
- [ ] Add `HF_TOKEN`, `VOXCPM_PERSONA`, `VOXCPM_LANGUAGE` (optional)
- [ ] Update any hardcoded ElevenLabs references
- [ ] Test TTS synthesis with new VoxCPM service
- [ ] Verify audio playback in browser (WAV support)
- [ ] Check audio file sizes (may be larger)
- [ ] Test different personas (default, professional, friendly)
- [ ] Verify latency is acceptable for use case

---

## Testing VoxCPM

### Quick Test

```python
from vision_service.voice import VoiceService

voice = VoiceService()
audio = voice.synthesize("Testing VoxCPM text-to-speech")

with open("test.wav", "wb") as f:
    f.write(audio)

print(f"Generated {len(audio)} bytes")
```

### Test Different Personas

```python
for persona in ["default", "professional", "friendly"]:
    audio = voice.synthesize("Hello from SUIT AI!", persona=persona)
    with open(f"test_{persona}.wav", "wb") as f:
        f.write(audio)
```

### Test Different Languages

```python
tests = [
    ("Hello!", "en"),
    ("你好！", "zh"),
    ("こんにちは！", "ja"),
]

for text, lang in tests:
    audio = voice.synthesize(text, language=lang)
    with open(f"test_{lang}.wav", "wb") as f:
        f.write(audio)
```

---

## Performance Comparison

### Latency (approximate)

| Text Length | ElevenLabs | VoxCPM | Difference |
|-------------|------------|--------|------------|
| Short (< 50 chars) | 1-2s | 2-4s | +1-2s |
| Medium (50-200 chars) | 2-4s | 4-8s | +2-4s |
| Long (> 200 chars) | 4-6s | 8-15s | +4-9s |

**Note:** VoxCPM latency varies based on HuggingFace Spaces load.

### Audio Quality

Both services provide high-quality output suitable for voice dialogue:
- **ElevenLabs:** More polished, commercial-grade quality
- **VoxCPM:** Research-grade quality, natural prosody

---

## Fallback Strategy

If VoxCPM is unavailable, the TTS endpoint has a development mode fallback:

```typescript
// In src/app/api/tts/route.ts
if (process.env.NODE_ENV === 'development') {
  console.warn('[TTS API] Voice service unavailable, returning mock audio URL');
  return NextResponse.json({
    audioUrl: '/audio/mock.mp3',
    mock: true,
  });
}
```

---

## Local Deployment

For offline use or better performance, deploy VoxCPM locally:

```bash
# Clone VoxCPM HuggingFace Space
git clone https://huggingface.co/spaces/openbmb/VoxCPM-Demo

# Install dependencies
cd VoxCPM-Demo
pip install -r requirements.txt

# Run Gradio server
python app.py
```

Update configuration:

```python
config = VoxCPMConfig(api_url="http://localhost:7860")
```

---

## Troubleshooting

### "API request failed"

**Solution:**
- Check HuggingFace status: https://status.huggingface.co/
- Wait and retry (rate limiting)
- Add `HF_TOKEN` for better limits

### Slow synthesis

**Solution:**
- Use shorter text segments
- Lower temperature (0.5-0.7)
- Consider local deployment

### Different voice quality

**Solution:**
- Try different personas
- Adjust temperature setting
- Experiment with speed parameter

---

## Future Enhancements

Potential improvements for VoxCPM integration:

1. **Caching** - Cache frequently used phrases
2. **Compression** - Convert WAV to MP3 for smaller files
3. **Local Deployment** - Self-host for better performance
4. **Custom Personas** - Train custom PersonaPlex voices
5. **Streaming** - Stream audio instead of full file generation
6. **Multi-language Auto-detect** - Improve language detection

---

## References

- **VoxCPM HuggingFace Space:** https://huggingface.co/spaces/openbmb/VoxCPM-Demo
- **OpenBMB Research:** https://github.com/OpenBMB
- **HuggingFace Status:** https://status.huggingface.co/
- **PersonaPlex:** Voice persona framework

---

## Summary

The migration to VoxCPM provides:
- ✅ Free, open-source TTS
- ✅ No API key required
- ✅ PersonaPlex persona support
- ✅ Multilingual capabilities
- ⚠️ Slightly higher latency
- ⚠️ WAV format (larger files)

**Recommendation:** VoxCPM is excellent for development, research, and production use cases where cost and open-source are priorities. For ultra-low latency or maximum voice quality, commercial services remain an option.
