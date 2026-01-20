#!/usr/bin/env python3
"""
Command-line script for text-to-speech synthesis using ElevenLabs.
Called by Next.js API route to generate audio files.

Usage:
    python synthesize_speech.py --text "Hello, world!" --output audio.mp3
"""

import argparse
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from voice.voice_service import VoiceService


def main():
    """Main entry point for TTS synthesis."""
    parser = argparse.ArgumentParser(
        description='Synthesize speech using ElevenLabs API',
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        '--text',
        required=True,
        help='Text to synthesize into speech',
    )
    parser.add_argument(
        '--output',
        required=True,
        help='Output MP3 file path',
    )
    parser.add_argument(
        '--voice-id',
        help='Optional voice ID override (default: uses config)',
    )

    args = parser.parse_args()

    try:
        # Initialize voice service (reads ELEVENLABS_API_KEY from environment)
        voice_service = VoiceService()

        print(f"Synthesizing text: {args.text[:50]}...", file=sys.stderr)

        # Synthesize audio
        audio_bytes = voice_service.synthesize(args.text, voice_id=args.voice_id)

        # Write to file
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_bytes(audio_bytes)

        print(f"Audio synthesized successfully: {args.output}")
        sys.exit(0)

    except ValueError as e:
        print(f"Configuration error: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error synthesizing audio: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
