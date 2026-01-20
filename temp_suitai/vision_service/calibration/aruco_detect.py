"""ArUco marker detection module for vision calibration.

Detects ArUco markers using OpenCV's DICT_4X4_50 dictionary and returns
corner coordinates for calibration purposes.

Example:
    >>> detector = ArUcoDetector()
    >>> corners, ids, rejected = detector.detect_markers(image)
    >>> if ids is not None:
    ...     print(f"Found {len(ids)} markers")
    >>>
    >>> # Visualization
    >>> vis_image = visualize_markers(image, corners, ids)
"""

from typing import Any, Dict, List, Optional, Tuple

import cv2
import numpy as np


class ArUcoDetector:
    """Detects and processes ArUco markers in images.

    Uses OpenCV's ArUco detection with DICT_4X4_50 dictionary for marker
    detection and returns corner coordinates for each detected marker.

    Attributes:
        dictionary_name: Name of the ArUco dictionary being used.
        aruco_dict: The OpenCV ArUco dictionary object.
        detector: The OpenCV ArUco detector instance.
    """

    def __init__(self, dictionary_name: str = "DICT_4X4_50"):
        """Initialize the ArUco detector with specified dictionary.

        Args:
            dictionary_name: Name of the ArUco dictionary to use.
                           Defaults to "DICT_4X4_50".

        Raises:
            ValueError: If the dictionary name is not valid.
        """
        self.dictionary_name = dictionary_name
        try:
            self.aruco_dict = cv2.aruco.getPredefinedDictionary(
                getattr(cv2.aruco, dictionary_name)
            )
        except AttributeError:
            raise ValueError(
                f"Invalid dictionary name: {dictionary_name}. "
                f"Must be a valid cv2.aruco dictionary (e.g., DICT_4X4_50)"
            )
        self.detector = cv2.aruco.ArucoDetector(self.aruco_dict)

    def detect_markers(
        self, image: np.ndarray
    ) -> Tuple[
        Optional[List[np.ndarray]], Optional[np.ndarray], Optional[List[np.ndarray]]
    ]:
        """Detect ArUco markers in an image.

        Args:
            image: Input image as numpy array (BGR or grayscale).

        Returns:
            Tuple containing:
            - corners: List of corner arrays for each detected marker.
                      Each marker has shape (4, 2) with corner coordinates [[x, y], ...].
                      Returns None if no markers detected.
            - ids: Array of detected marker IDs. Returns None if no markers detected.
            - rejected: List of rejected detection candidates. Returns None if no rejections.

        Raises:
            TypeError: If image is not a numpy array.
            ValueError: If image is empty.

        Example:
            >>> detector = ArUcoDetector()
            >>> corners, ids, rejected = detector.detect_markers(image)
            >>> if ids is not None:
            ...     for marker_id, corner_set in zip(ids.flatten(), corners):
            ...         print(f"Marker {marker_id}: {corner_set}")
        """
        if not isinstance(image, np.ndarray):
            raise TypeError(f"Image must be a numpy array, got {type(image)}")

        if image.size == 0:
            raise ValueError("Image is empty")

        # Detect markers in the image
        corners, ids, rejected = self.detector.detectMarkers(image)

        # Normalize corners to (4, 2) arrays for consistency
        if corners:
            corners = [c.reshape(4, 2) for c in corners]

        return corners, ids, rejected

    def get_marker_corners(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """Get corner coordinates for all detected markers.

        Args:
            image: Input image as numpy array.

        Returns:
            List of dictionaries, each containing:
            - 'id': Marker ID (int)
            - 'corners': 4 corner coordinates as list of [x, y] pairs

        Example:
            >>> detector = ArUcoDetector()
            >>> markers = detector.get_marker_corners(image)
            >>> for marker in markers:
            ...     print(f"Marker {marker['id']}: {marker['corners']}")
        """
        corners, ids, _ = self.detect_markers(image)

        if ids is None or len(ids) == 0:
            return []

        markers_data = []
        for marker_id, corner_set in zip(ids.flatten(), corners):
            # corner_set is already (4, 2) array [[x,y], [x,y], [x,y], [x,y]]
            markers_data.append({"id": int(marker_id), "corners": corner_set.tolist()})

        return markers_data

    def detect_multiple_markers(self, image: np.ndarray) -> Dict[str, Any]:
        """Detect multiple ArUco markers and return detailed information.

        Args:
            image: Input image as numpy array.

        Returns:
            Dictionary containing:
            - 'count': Number of detected markers (int)
            - 'markers': List of marker info with id and corners
            - 'ids': Array of marker IDs
            - 'corners': List of corner arrays from detection
            - 'rejected': Rejected detection candidates

        Example:
            >>> detector = ArUcoDetector()
            >>> result = detector.detect_multiple_markers(image)
            >>> print(f"Found {result['count']} markers")
        """
        corners, ids, rejected = self.detect_markers(image)

        markers_info = []
        if ids is not None:
            for marker_id, corner_set in zip(ids.flatten(), corners):
                markers_info.append(
                    {"id": int(marker_id), "corners": corner_set.tolist()}
                )

        return {
            "count": len(markers_info),
            "markers": markers_info,
            "ids": ids.flatten().tolist() if ids is not None else [],
            "corners": corners,
            "rejected": rejected,
        }


def visualize_markers(
    image: np.ndarray,
    corners: Optional[List[np.ndarray]] = None,
    ids: Optional[np.ndarray] = None,
    rejected: Optional[List[np.ndarray]] = None,
) -> np.ndarray:
    """Draw detected ArUco markers on image for visualization.

    Args:
        image: Input image as numpy array.
        corners: List of corner arrays from detection.
        ids: Array of marker IDs.
        rejected: List of rejected detections.

    Returns:
        Image with drawn markers and IDs.

    Example:
        >>> detector = ArUcoDetector()
        >>> corners, ids, rejected = detector.detect_markers(image)
        >>> vis_image = visualize_markers(image, corners, ids, rejected)
        >>> cv2.imshow("Markers", vis_image)
    """
    output_image = image.copy()

    if corners is not None and ids is not None:
        # Convert corners to the format expected by drawDetectedMarkers
        # cv2.aruco.drawDetectedMarkers expects corners as list of (1, 4, 2) arrays
        corners_for_draw = [np.array([c], dtype=np.float32) for c in corners]
        # Draw detected markers
        output_image = cv2.aruco.drawDetectedMarkers(
            output_image, corners_for_draw, ids
        )

    if rejected is not None and len(rejected) > 0:
        # Convert rejected corners to the format expected by drawDetectedMarkers
        rejected_for_draw = [
            np.array([c], dtype=np.float32) if c.ndim == 2 else c for c in rejected
        ]
        # Draw rejected detections in different color
        output_image = cv2.aruco.drawDetectedMarkers(
            output_image, rejected_for_draw, borderColor=(100, 100, 100)
        )

    return output_image


def visualize_marker_corners(
    image: np.ndarray,
    corners: Optional[List[np.ndarray]] = None,
    ids: Optional[np.ndarray] = None,
    corner_radius: int = 5,
    corner_color: Tuple[int, int, int] = (0, 255, 0),
    id_color: Tuple[int, int, int] = (0, 0, 255),
) -> np.ndarray:
    """Draw corner points and IDs on detected markers.

    This visualization helper highlights each corner of detected markers
    with circles and labels, making it easy to verify corner detection accuracy.

    Args:
        image: Input image as numpy array.
        corners: List of corner arrays from detection.
        ids: Array of marker IDs.
        corner_radius: Radius of corner circles in pixels.
        corner_color: BGR color tuple for corner circles (default green).
        id_color: BGR color tuple for ID text (default red).

    Returns:
        Image with drawn corner points and IDs.

    Example:
        >>> detector = ArUcoDetector()
        >>> corners, ids, _ = detector.detect_markers(image)
        >>> vis_image = visualize_marker_corners(
        ...     image, corners, ids,
        ...     corner_radius=5,
        ...     corner_color=(0, 255, 0)
        ... )
    """
    output_image = image.copy()

    if corners is None or ids is None:
        return output_image

    for marker_id, corner_set in zip(ids.flatten(), corners):
        # Draw circles at each corner
        for corner_idx, corner in enumerate(corner_set):
            x, y = int(corner[0]), int(corner[1])
            cv2.circle(output_image, (x, y), corner_radius, corner_color, -1)
            # Draw corner index
            cv2.putText(
                output_image,
                str(corner_idx),
                (x + 10, y - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.4,
                id_color,
                1,
            )

        # Draw marker ID at center
        center = corner_set.mean(axis=0).astype(int)
        cv2.putText(
            output_image,
            f"ID:{marker_id}",
            (center[0], center[1]),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            id_color,
            2,
        )

    return output_image
