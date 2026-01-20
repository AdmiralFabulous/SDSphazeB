"""
Calibration Function Tools for Claude AI

Provides a clean API wrapper around CalibrationLock for use as Claude AI function tools.
These tools allow the conversational AI to check status, process measurements, and guide
users through the calibration process.
"""

from dataclasses import dataclass, asdict
from typing import Dict, Any, List, Optional
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from calibration.calibration_lock import CalibrationLock, StabilityMetrics


@dataclass
class CalibrationToolResult:
    """Result from calibration tool execution.

    This standardized result format allows Claude AI to understand the outcome
    of tool executions and make appropriate conversational decisions.

    Attributes:
        success: Whether the tool execution succeeded
        data: Dictionary of tool-specific result data
        message: Human-readable status message
        warnings: List of diagnostic warnings
    """
    success: bool
    data: Dict[str, Any]
    message: str
    warnings: List[str]

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return asdict(self)


class CalibrationTools:
    """Function tools for Claude AI calibration dialogue.

    This class wraps the CalibrationLock implementation with a tool-oriented API
    that Claude AI can call to monitor and control the calibration process.

    Each method returns a CalibrationToolResult with standardized success/data/message
    structure that the AI can interpret and respond to conversationally.

    Example:
        >>> tools = CalibrationTools()
        >>> result = tools.check_calibration_status()
        >>> if not result.data['is_locked']:
        ...     result = tools.process_calibration_frame(0.5432)
        >>> print(result.message)
    """

    def __init__(
        self,
        cv_threshold: float = 0.05,
        stable_frame_threshold: int = 30,
        window_size: int = 10,
        min_measurements: int = 2,
    ):
        """Initialize calibration tools with CalibrationLock instance.

        Args:
            cv_threshold: Coefficient of variation threshold for stability (default: 0.05 = 5%)
            stable_frame_threshold: Number of stable frames required to lock (default: 30)
            window_size: Sliding window size for CV calculation (default: 10)
            min_measurements: Minimum measurements before stability evaluation (default: 2)
        """
        self.calibration_lock = CalibrationLock(
            cv_threshold=cv_threshold,
            stable_frame_threshold=stable_frame_threshold,
            window_size=window_size,
            min_measurements=min_measurements,
        )

    def check_calibration_status(self) -> CalibrationToolResult:
        """Get current calibration status for AI decision-making.

        This tool allows Claude AI to check the current state without adding
        new measurements. Useful for periodic status updates or when the user
        asks "how's it going?"

        Returns:
            CalibrationToolResult with current calibration state data:
                - is_locked: Whether calibration is complete
                - is_stable: Whether current frame is stable
                - stability_score: Progress metric (0.0-1.0)
                - stable_frame_count: Consecutive stable frames counted
                - coefficient_of_variation: CV metric value
                - measurements_count: Total measurements processed
        """
        metrics = self.calibration_lock.get_stability_metrics()
        return CalibrationToolResult(
            success=True,
            data={
                "is_locked": metrics.is_locked,
                "is_stable": metrics.is_stable,
                "stability_score": metrics.stability_score,
                "stable_frame_count": metrics.stable_frame_count,
                "coefficient_of_variation": metrics.coefficient_of_variation,
                "measurements_count": metrics.measurements_count,
            },
            message=self._generate_status_message(metrics),
            warnings=metrics.warnings,
        )

    def process_calibration_frame(self, scale_factor: float) -> CalibrationToolResult:
        """Process a new calibration measurement from a video frame.

        This is the primary tool for feeding calibration data to the system.
        Claude AI should call this when a new scale factor measurement is available
        from the ArUco marker detection pipeline.

        Args:
            scale_factor: Scale factor measurement in mm per pixel (must be positive)

        Returns:
            CalibrationToolResult with updated calibration state:
                - is_locked: Whether this frame completed calibration
                - is_stable: Whether this frame was stable
                - stability_score: Current progress (0.0-1.0)
                - stable_frame_count: Updated stable frame count
                - progress_percentage: User-friendly percentage (0-100)
        """
        try:
            metrics = self.calibration_lock.add_measurement(scale_factor)
            return CalibrationToolResult(
                success=True,
                data={
                    "is_locked": metrics.is_locked,
                    "is_stable": metrics.is_stable,
                    "stability_score": metrics.stability_score,
                    "stable_frame_count": metrics.stable_frame_count,
                    "progress_percentage": (
                        metrics.stable_frame_count / 30
                    ) * 100,
                    "coefficient_of_variation": metrics.coefficient_of_variation,
                },
                message=self._generate_progress_message(metrics),
                warnings=metrics.warnings,
            )
        except ValueError as e:
            return CalibrationToolResult(
                success=False,
                data={},
                message=f"Invalid measurement: {str(e)}",
                warnings=[str(e)],
            )
        except RuntimeError as e:
            return CalibrationToolResult(
                success=False,
                data={},
                message=f"Calibration error: {str(e)}",
                warnings=[str(e)],
            )
        except Exception as e:
            return CalibrationToolResult(
                success=False,
                data={},
                message=f"Unexpected error: {str(e)}",
                warnings=[str(e)],
            )

    def get_stability_progress(self) -> CalibrationToolResult:
        """Get progress toward calibration lock.

        Returns user-friendly progress information for Claude AI to communicate
        to the user. Includes both raw frame count and percentage completion.

        Returns:
            CalibrationToolResult with progress data:
                - progress: Normalized progress score (0.0-1.0)
                - frames_remaining: How many more stable frames needed
                - stable_frame_count: Current stable frames achieved
                - total_required: Total frames needed (always 30)
        """
        metrics = self.calibration_lock.get_stability_metrics()
        frames_remaining = max(0, 30 - metrics.stable_frame_count)

        return CalibrationToolResult(
            success=True,
            data={
                "progress": metrics.stability_score,
                "frames_remaining": frames_remaining,
                "stable_frame_count": metrics.stable_frame_count,
                "total_required": 30,
            },
            message=f"{metrics.stable_frame_count}/30 stable frames",
            warnings=[],
        )

    def finalize_calibration(self) -> CalibrationToolResult:
        """Finalize and lock calibration.

        Claude AI should call this when calibration is complete to retrieve
        the final locked scale factor. This can only succeed after 30 stable
        frames have been achieved.

        Returns:
            CalibrationToolResult with finalization data:
                - locked_scale_factor: The mean scale factor from locked state

        Raises:
            Returns failure result if calibration is not yet locked.
        """
        if not self.calibration_lock.is_locked():
            metrics = self.calibration_lock.get_stability_metrics()
            frames_remaining = 30 - metrics.stable_frame_count
            return CalibrationToolResult(
                success=False,
                data={
                    "frames_remaining": frames_remaining,
                },
                message=f"Calibration not yet locked (need {frames_remaining} more stable frames)",
                warnings=[f"Need {frames_remaining} more stable frames before finalizing"],
            )

        locked_scale = self.calibration_lock.get_locked_scale()
        return CalibrationToolResult(
            success=True,
            data={
                "locked_scale_factor": locked_scale,
            },
            message=f"Calibration locked at scale factor: {locked_scale:.6f} mm/px",
            warnings=[],
        )

    def reset_calibration(self) -> CalibrationToolResult:
        """Reset calibration state to start over.

        Claude AI should call this when the user wants to recalibrate or
        if the calibration process needs to restart for any reason.

        Returns:
            CalibrationToolResult confirming reset.
        """
        self.calibration_lock.reset()
        return CalibrationToolResult(
            success=True,
            data={
                "is_locked": False,
                "stable_frame_count": 0,
            },
            message="Calibration reset successfully. Ready to start new calibration.",
            warnings=[],
        )

    # Private helper methods for generating user-friendly messages

    def _generate_status_message(self, metrics: StabilityMetrics) -> str:
        """Generate human-readable status message for AI.

        Args:
            metrics: Current stability metrics

        Returns:
            Status message string describing current state
        """
        if metrics.is_locked:
            return "Calibration locked and complete"
        elif metrics.is_stable:
            return f"Stable! {metrics.stable_frame_count}/30 frames captured"
        elif metrics.measurements_count < 2:
            return "Waiting for initial measurements"
        else:
            return f"Unstable (CV: {metrics.coefficient_of_variation:.4f})"

    def _generate_progress_message(self, metrics: StabilityMetrics) -> str:
        """Generate progress message for AI to communicate to user.

        Args:
            metrics: Current stability metrics

        Returns:
            Progress message string
        """
        if metrics.is_locked:
            return "Calibration complete! 30/30 stable frames achieved."

        progress = (metrics.stable_frame_count / 30) * 100

        if metrics.is_stable:
            return f"Great! Progress: {progress:.0f}% ({metrics.stable_frame_count}/30 stable frames)"
        else:
            return f"Hold steady... Progress: {progress:.0f}% ({metrics.stable_frame_count}/30 stable frames)"
