"""
FastAPI Service for Calibration Tool Execution

Provides HTTP endpoints for Claude AI function tools to interact with
the calibration system. This service acts as a bridge between the Next.js
API routes and the Python calibration logic.

Run with: python vision_service/dialogue/tool_service.py
Or: uvicorn vision_service.dialogue.tool_service:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from dialogue.calibration_tools import CalibrationTools, CalibrationToolResult

# FastAPI app
app = FastAPI(
    title="SUIT AI Calibration Tool Service",
    description="HTTP API for Claude AI calibration function tools",
    version="1.0.0",
)

# CORS middleware for Next.js development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Session-based tool storage (in production, use Redis or database)
calibration_sessions: Dict[str, CalibrationTools] = {}


def get_or_create_session(session_id: str) -> CalibrationTools:
    """Get or create calibration tools instance for session.

    Args:
        session_id: Unique session identifier

    Returns:
        CalibrationTools instance for this session
    """
    if session_id not in calibration_sessions:
        calibration_sessions[session_id] = CalibrationTools()
    return calibration_sessions[session_id]


# Request/Response Models

class ToolRequest(BaseModel):
    """Base request model for tool endpoints."""
    session_id: str = Field(..., description="Unique session identifier")


class ProcessFrameRequest(ToolRequest):
    """Request model for processing calibration frame."""
    scale_factor: float = Field(
        ...,
        description="Scale factor measurement from ArUco detection (mm per pixel)",
        gt=0,
    )


class ToolResponse(BaseModel):
    """Response model for all tool endpoints."""
    success: bool
    data: Dict
    message: str
    warnings: list[str]


# API Endpoints

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "service": "SUIT AI Calibration Tool Service",
        "status": "running",
        "version": "1.0.0",
        "active_sessions": len(calibration_sessions),
    }


@app.post("/calibration/tools/check_calibration_status", response_model=ToolResponse)
async def check_status(request: ToolRequest):
    """Check current calibration status.

    Returns current state without adding new measurements. Used by Claude AI
    to monitor progress and make conversational decisions.
    """
    try:
        tools = get_or_create_session(request.session_id)
        result = tools.check_calibration_status()
        return result.to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/calibration/tools/process_calibration_frame", response_model=ToolResponse)
async def process_frame(request: ProcessFrameRequest):
    """Process a new calibration measurement frame.

    Adds a new scale factor measurement and updates calibration state.
    Claude AI calls this when new ArUco marker data is available.
    """
    try:
        tools = get_or_create_session(request.session_id)
        result = tools.process_calibration_frame(request.scale_factor)
        return result.to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/calibration/tools/get_stability_progress", response_model=ToolResponse)
async def get_progress(request: ToolRequest):
    """Get progress toward calibration lock.

    Returns user-friendly progress information (frames remaining, percentage, etc.)
    for Claude AI to communicate to the user.
    """
    try:
        tools = get_or_create_session(request.session_id)
        result = tools.get_stability_progress()
        return result.to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/calibration/tools/finalize_calibration", response_model=ToolResponse)
async def finalize(request: ToolRequest):
    """Finalize and lock calibration.

    Retrieves the locked scale factor after 30 stable frames are achieved.
    Returns error if calibration is not yet complete.
    """
    try:
        tools = get_or_create_session(request.session_id)
        result = tools.finalize_calibration()
        return result.to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/calibration/tools/reset_calibration", response_model=ToolResponse)
async def reset(request: ToolRequest):
    """Reset calibration state to start over.

    Clears all measurements and state for the session. Used when user
    wants to recalibrate or restart the process.
    """
    try:
        tools = get_or_create_session(request.session_id)
        result = tools.reset_calibration()
        return result.to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/calibration/sessions/{session_id}")
async def delete_session(session_id: str):
    """Delete calibration session and free resources.

    Call this when a session is complete or abandoned to clean up memory.
    """
    if session_id in calibration_sessions:
        del calibration_sessions[session_id]
        return {"message": f"Session {session_id} deleted"}
    else:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")


# Development server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        log_level="info",
    )
