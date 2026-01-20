# Quick Start: Calibration Dialogue

Get the calibration dialogue system up and running in 5 minutes.

## Prerequisites

- Python 3.8+
- Node.js 18+
- Anthropic API key
- HuggingFace account (optional, for better rate limits)

## Setup

### 1. Install Dependencies (2 min)

```bash
# Python dependencies
pip install fastapi uvicorn pydantic requests

# Node dependencies
npm install
```

### 2. Configure Environment (1 min)

Create `.env.local` file:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
HF_TOKEN=your-huggingface-token-optional
VOXCPM_PERSONA=default
VOXCPM_LANGUAGE=en
TOOL_SERVICE_URL=http://127.0.0.1:8000
DATABASE_URL=file:./dev.db
```

### 3. Setup Database (1 min)

```bash
npx prisma migrate dev --name add_calibration_session
npx prisma generate
```

### 4. Start Services (1 min)

**Terminal 1: Python Tool Service**
```bash
python vision_service/dialogue/tool_service.py
```

**Terminal 2: Next.js Server**
```bash
npm run dev
```

## Test It

```bash
# Start calibration
curl -X POST http://localhost:3000/api/sessions/demo/calibration/dialogue \
  -H "Content-Type: application/json" \
  -d '{"message": "I am ready to calibrate"}'
```

You should see:
- JSON response with AI message
- Audio URL (if TTS configured)
- Session state

## API Endpoints

### Dialogue
```
POST /api/sessions/{id}/calibration/dialogue
Body: { "message": "...", "scaleFactor"?: 0.543 }
```

### Status
```
GET /api/sessions/{id}/calibration/status
```

### TTS
```
POST /api/tts
Body: { "text": "Hello!" }
```

## Dialogue Flow

1. User: "I'm ready to calibrate"
2. AI: Explains process, asks user to show marker
3. User: Shows marker (system sends scale_factor)
4. AI: "Hold steady... 5/30 frames"
5. ... (frames accumulate)
6. AI: "Perfect! Calibration complete!"

## Troubleshooting

### Tool Service Won't Start
- Check: Python 3.8+ installed
- Check: Port 8000 is free
- Run: `pip install fastapi uvicorn`

### Next.js Won't Start
- Run: `npm install`
- Check: `.env.local` exists
- Run: `npx prisma generate`

### TTS Fails
- Check: HuggingFace Spaces is accessible (https://status.huggingface.co/)
- Check: `public/audio` directory exists
- Create manually: `mkdir -p public/audio`
- Optional: Set `HF_TOKEN` for better rate limits

### Claude API Errors
- Check: `ANTHROPIC_API_KEY` is valid
- Check: API rate limits
- Test: `curl https://api.anthropic.com/v1/messages -H "x-api-key: YOUR_KEY"`

## Next Steps

- Read full docs: `vision_service/dialogue/README.md`
- Implementation details: `VOICE_E01_S03_T02_IMPLEMENTATION_SUMMARY.md`
- Integrate with your frontend UI
- Add visual progress indicators
- Customize system prompt for your use case

## Architecture

```
User → Next.js API → Claude AI → Python Tools → CalibrationLock
                  ↓
          VoxCPM TTS (HuggingFace Spaces)
```

## File Locations

- **Python Tools:** `vision_service/dialogue/calibration_tools.py`
- **Tool Service:** `vision_service/dialogue/tool_service.py`
- **Claude Client:** `src/lib/claude-client.ts`
- **API Routes:** `src/app/api/sessions/[id]/calibration/`
- **TTS:** `vision_service/dialogue/synthesize_speech.py`

## Support

Check logs:
- Python service: Terminal output
- Next.js: `.next/server/app/api/...` logs
- Claude API: Response headers for rate limits

Happy calibrating! 🎯
