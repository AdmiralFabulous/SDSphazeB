# Calibration Dialogue System

AI-powered conversational interface for guiding users through the calibration process using ArUco markers.

## Overview

The Calibration Dialogue system uses Claude AI with function tools to provide a natural, voice-enabled calibration experience. The system guides users through holding a calibration paper steady until 30 stable frames are captured, providing real-time feedback and encouragement.

## Architecture

```
User (Voice/Text)
        ↓
Next.js API (/api/sessions/[id]/calibration/dialogue)
        ↓
Claude AI (Function Tools)
        ↓
Python Tool Service (FastAPI on port 8000)
        ↓
CalibrationLock (vision_service/calibration)
        ↓
ElevenLabs TTS (Audio Response)
```

## Components

### 1. Python Function Tools (`calibration_tools.py`)

Wrapper around `CalibrationLock` providing a tool-oriented API for Claude AI:

- `check_calibration_status()` - Get current state and metrics
- `process_calibration_frame(scale_factor)` - Add new measurement
- `get_stability_progress()` - Get progress toward lock
- `finalize_calibration()` - Lock and retrieve final scale factor
- `reset_calibration()` - Restart calibration process

### 2. FastAPI Tool Service (`tool_service.py`)

HTTP service providing REST endpoints for tool execution:

- `POST /calibration/tools/check_calibration_status`
- `POST /calibration/tools/process_calibration_frame`
- `POST /calibration/tools/get_stability_progress`
- `POST /calibration/tools/finalize_calibration`
- `POST /calibration/tools/reset_calibration`
- `DELETE /calibration/sessions/{session_id}`

### 3. Claude AI Client (`src/lib/claude-client.ts`)

TypeScript client for Claude API with calibration-specific:

- System prompt for friendly, instructional dialogue
- Function tool definitions
- Tool execution dispatcher
- Conversation history management

### 4. Next.js API Routes

- `POST /api/sessions/[id]/calibration/dialogue` - Main dialogue endpoint
- `GET /api/sessions/[id]/calibration/status` - Status polling
- `POST /api/tts` - Text-to-speech synthesis

### 5. TTS Synthesis (`synthesize_speech.py`)

Command-line script for generating audio responses via ElevenLabs.

## Setup

### Prerequisites

- Python 3.8+
- Node.js 18+
- Anthropic API key
- ElevenLabs API key

### Installation

1. **Install Python dependencies:**
```bash
cd vision_service
pip install -r requirements.txt
```

2. **Install Node dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

4. **Run database migration:**
```bash
npx prisma migrate dev --name add_calibration_session
npx prisma generate
```

## Usage

### Starting the Services

1. **Start Python Tool Service:**
```bash
python vision_service/dialogue/tool_service.py
# Or: uvicorn vision_service.dialogue.tool_service:app --reload --port 8000
```

2. **Start Next.js Dev Server:**
```bash
npm run dev
```

### API Usage Example

```bash
# Start calibration dialogue
curl -X POST http://localhost:3000/api/sessions/test-123/calibration/dialogue \
  -H "Content-Type: application/json" \
  -d '{"message": "I am ready to calibrate"}'

# Response:
{
  "message": "Perfect! Let's get you calibrated. Please hold the calibration paper...",
  "audioUrl": "/audio/audio_1234567890.mp3",
  "toolCalls": [{"name": "check_calibration_status", "input": {}}],
  "sessionState": {
    "state": "INITIALIZING",
    "stabilityScore": null,
    "stableFrameCount": 0,
    "isLocked": false
  }
}

# Process a measurement frame
curl -X POST http://localhost:3000/api/sessions/test-123/calibration/dialogue \
  -H "Content-Type: application/json" \
  -d '{"message": "I am holding the marker", "scaleFactor": 0.543}'

# Check status
curl http://localhost:3000/api/sessions/test-123/calibration/status
```

### Dialogue Flow Example

1. **User:** "I'm ready to calibrate"
   - **AI:** Checks status, explains process
   - **Audio:** Encouraging introduction

2. **User:** Shows marker (system detects and sends scale_factor)
   - **AI:** Processes frame, checks stability
   - **Audio:** "Great! Hold steady... 5/30 frames"

3. **User:** Holds steady (frames accumulate)
   - **AI:** Provides progress updates
   - **Audio:** "You're doing great! 25/30 frames..."

4. **User:** Reaches 30 stable frames
   - **AI:** Finalizes calibration
   - **Audio:** "Perfect! Calibration complete!"

## Configuration

### Python Tool Service

Default configuration in `CalibrationTools.__init__()`:
- `cv_threshold`: 0.05 (5% variation)
- `stable_frame_threshold`: 30 frames
- `window_size`: 10 frames
- `min_measurements`: 2 frames

### Claude AI System Prompt

Located in `src/lib/claude-client.ts`:
- Friendly, encouraging tone
- Clear, concise instructions
- Progress-oriented feedback
- 2-3 sentence responses for voice

### ElevenLabs Voice

Configured in `vision_service/voice/elevenlabs_config.py`:
- Voice ID: `21m00Tcm4TlvDq8ikWAM` (Rachel - Professional male voice)
- Model: `eleven_monolingual_v1` (Low-latency)
- Stability: 0.75
- Similarity Boost: 0.75

## Database Schema

```prisma
model CalibrationSession {
  id                  String   @id @default(cuid())
  sessionId           String
  state               String   // INITIALIZING, DETECTING_MARKER, STABILIZING, LOCKED, COMPLETE, ERROR
  stabilityScore      Float?
  confidence          Float?
  stableFrameCount    Int      @default(0)
  lockedScaleFactor   Float?
  measurementId       String?
  conversationHistory String?  // JSON
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

## Testing

### Manual Testing

1. Start both services (Python tool service + Next.js)
2. Send dialogue requests via curl or Postman
3. Verify responses and audio generation
4. Check database for persisted state

### Integration Testing

```bash
# Run Python tests
cd vision_service
pytest dialogue/test_calibration_tools.py -v

# Run Node tests (if implemented)
npm test
```

## Troubleshooting

### Tool Service Connection Issues

- Ensure Python service is running on port 8000
- Check `TOOL_SERVICE_URL` in `.env.local`
- Verify firewall/network settings

### TTS Generation Fails

- Verify `ELEVENLABS_API_KEY` is set
- Check API quota/usage limits
- Ensure `public/audio` directory exists
- Check Python voice service imports

### Claude API Errors

- Verify `ANTHROPIC_API_KEY` is valid
- Check API rate limits
- Review system prompt length

### Database Issues

- Run `npx prisma generate` after schema changes
- Check SQLite database file permissions
- Verify Prisma Client is initialized

## Development

### Adding New Tools

1. Add method to `CalibrationTools` class
2. Define tool in Claude client `CALIBRATION_TOOLS` array
3. Add FastAPI endpoint in `tool_service.py`
4. Update Claude system prompt if needed

### Modifying Dialogue Behavior

Edit `CALIBRATION_SYSTEM_PROMPT` in `src/lib/claude-client.ts`:
- Adjust tone and personality
- Update process instructions
- Modify response templates

## Production Considerations

1. **Session Management:** Replace in-memory dict with Redis
2. **Audio Storage:** Use S3/CloudFront for audio files
3. **Error Handling:** Add retry logic and fallbacks
4. **Monitoring:** Log tool executions and dialogue metrics
5. **Rate Limiting:** Implement per-user rate limits
6. **Caching:** Cache tool responses where appropriate
7. **Cleanup:** Scheduled job to delete old audio files

## Files

- `calibration_tools.py` - Function tool wrappers
- `tool_service.py` - FastAPI HTTP service
- `synthesize_speech.py` - TTS synthesis script
- `src/lib/claude-client.ts` - Claude AI client
- `src/app/api/sessions/[id]/calibration/dialogue/route.ts` - Dialogue endpoint
- `src/app/api/sessions/[id]/calibration/status/route.ts` - Status endpoint
- `src/app/api/tts/route.ts` - TTS endpoint

## License

Part of SUIT AI v4.b - Vision & Measurement Service
