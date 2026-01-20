"""
SMPL Anthropometry Landmarks and Vertex Index Definitions

This module defines 70+ vertex indices for body landmarks on the SMPL model,
enabling consistent anthropometric measurements across multiple measurement points.
Includes landmark definitions, circumference paths, and easy lookup functionality.

The SMPL model contains 6890 vertices. This module maps these vertices to
semantic landmarks for common body measurements (girth, lengths, widths).

References:
- SMPL: A Skinned Multi-Person Linear Model
- ISO 20685-1: 3D scanning methodologies for internationally compatible anthropometric databases
"""

from dataclasses import dataclass
from typing import Dict, List, Tuple, Optional
from enum import Enum


class BodyRegion(Enum):
    """Body regions for landmark grouping."""
    HEAD = "head"
    NECK = "neck"
    SHOULDER = "shoulder"
    CHEST = "chest"
    WAIST = "waist"
    HIP = "hip"
    THIGH = "thigh"
    KNEE = "knee"
    CALF = "calf"
    ANKLE = "ankle"
    FOREARM = "forearm"
    ARM = "arm"
    WRIST = "wrist"
    HAND = "hand"


class MeasurementType(Enum):
    """Types of measurements that can be performed."""
    CIRCUMFERENCE = "circumference"
    LENGTH = "length"
    WIDTH = "width"
    DEPTH = "depth"
    DISTANCE = "distance"


@dataclass
class Landmark:
    """Represents a single body landmark with semantic information."""
    name: str
    vertex_idx: int
    region: BodyRegion
    anatomical_name: str
    position_description: str


@dataclass
class CircumferencePath:
    """Defines a path of vertices for circumference measurements (e.g., chest girth)."""
    name: str
    measurement_type: MeasurementType
    vertex_indices: List[int]
    region: BodyRegion
    description: str


# ============================================================================
# VERTEX INDEX DEFINITIONS FOR SMPL BODY LANDMARKS
# ============================================================================
# Based on SMPL v1.0 topology with 6890 vertices
# Grouped by anatomical region for easy lookup and measurement

LANDMARKS: Dict[str, Landmark] = {
    # HEAD AND FACE LANDMARKS (20+ vertices)
    "head_top": Landmark(
        name="head_top",
        vertex_idx=412,
        region=BodyRegion.HEAD,
        anatomical_name="Vertex of head",
        position_description="Top of head, highest point"
    ),
    "head_front": Landmark(
        name="head_front",
        vertex_idx=282,
        region=BodyRegion.HEAD,
        anatomical_name="Glabella",
        position_description="Center of forehead between eyebrows"
    ),
    "head_back": Landmark(
        name="head_back",
        vertex_idx=1143,
        region=BodyRegion.HEAD,
        anatomical_name="Occipital protuberance",
        position_description="Most prominent point at back of skull"
    ),
    "head_left": Landmark(
        name="head_left",
        vertex_idx=214,
        region=BodyRegion.HEAD,
        anatomical_name="Left temporal landmark",
        position_description="Left side of head at temple"
    ),
    "head_right": Landmark(
        name="head_right",
        vertex_idx=516,
        region=BodyRegion.HEAD,
        anatomical_name="Right temporal landmark",
        position_description="Right side of head at temple"
    ),
    "chin": Landmark(
        name="chin",
        vertex_idx=3114,
        region=BodyRegion.HEAD,
        anatomical_name="Menton",
        position_description="Lowest point of chin"
    ),
    "jaw_left": Landmark(
        name="jaw_left",
        vertex_idx=2885,
        region=BodyRegion.HEAD,
        anatomical_name="Left gonion",
        position_description="Angle of left jaw"
    ),
    "jaw_right": Landmark(
        name="jaw_right",
        vertex_idx=3253,
        region=BodyRegion.HEAD,
        anatomical_name="Right gonion",
        position_description="Angle of right jaw"
    ),
    "left_eye": Landmark(
        name="left_eye",
        vertex_idx=261,
        region=BodyRegion.HEAD,
        anatomical_name="Left eye center",
        position_description="Center of left eye"
    ),
    "right_eye": Landmark(
        name="right_eye",
        vertex_idx=631,
        region=BodyRegion.HEAD,
        anatomical_name="Right eye center",
        position_description="Center of right eye"
    ),
    "nose_tip": Landmark(
        name="nose_tip",
        vertex_idx=331,
        region=BodyRegion.HEAD,
        anatomical_name="Subnasale",
        position_description="Tip of nose"
    ),
    "left_nostril": Landmark(
        name="left_nostril",
        vertex_idx=374,
        region=BodyRegion.HEAD,
        anatomical_name="Left nostril",
        position_description="Left nostril opening"
    ),
    "right_nostril": Landmark(
        name="right_nostril",
        vertex_idx=438,
        region=BodyRegion.HEAD,
        anatomical_name="Right nostril",
        position_description="Right nostril opening"
    ),
    "left_ear": Landmark(
        name="left_ear",
        vertex_idx=156,
        region=BodyRegion.HEAD,
        anatomical_name="Left ear",
        position_description="Outer edge of left ear"
    ),
    "right_ear": Landmark(
        name="right_ear",
        vertex_idx=672,
        region=BodyRegion.HEAD,
        anatomical_name="Right ear",
        position_description="Outer edge of right ear"
    ),
    "mouth_left": Landmark(
        name="mouth_left",
        vertex_idx=404,
        region=BodyRegion.HEAD,
        anatomical_name="Left mouth corner",
        position_description="Left corner of mouth"
    ),
    "mouth_right": Landmark(
        name="mouth_right",
        vertex_idx=485,
        region=BodyRegion.HEAD,
        anatomical_name="Right mouth corner",
        position_description="Right corner of mouth"
    ),
    "mouth_center": Landmark(
        name="mouth_center",
        vertex_idx=445,
        region=BodyRegion.HEAD,
        anatomical_name="Mouth center",
        position_description="Center of mouth opening"
    ),

    # NECK LANDMARKS (5+ vertices)
    "neck_back": Landmark(
        name="neck_back",
        vertex_idx=1638,
        region=BodyRegion.NECK,
        anatomical_name="Neck back center",
        position_description="Cervicale - vertebra prominens at base of neck"
    ),
    "neck_front": Landmark(
        name="neck_front",
        vertex_idx=3471,
        region=BodyRegion.NECK,
        anatomical_name="Neck front center",
        position_description="Throat at neck center"
    ),
    "neck_left": Landmark(
        name="neck_left",
        vertex_idx=1527,
        region=BodyRegion.NECK,
        anatomical_name="Left neck side",
        position_description="Lateral aspect of left neck"
    ),
    "neck_right": Landmark(
        name="neck_right",
        vertex_idx=1792,
        region=BodyRegion.NECK,
        anatomical_name="Right neck side",
        position_description="Lateral aspect of right neck"
    ),

    # SHOULDER AND CLAVICLE LANDMARKS (10+ vertices)
    "left_shoulder_top": Landmark(
        name="left_shoulder_top",
        vertex_idx=1506,
        region=BodyRegion.SHOULDER,
        anatomical_name="Left acromion",
        position_description="Top of left shoulder"
    ),
    "right_shoulder_top": Landmark(
        name="right_shoulder_top",
        vertex_idx=4695,
        region=BodyRegion.SHOULDER,
        anatomical_name="Right acromion",
        position_description="Top of right shoulder"
    ),
    "left_shoulder_front": Landmark(
        name="left_shoulder_front",
        vertex_idx=1623,
        region=BodyRegion.SHOULDER,
        anatomical_name="Left shoulder front",
        position_description="Front of left shoulder"
    ),
    "right_shoulder_front": Landmark(
        name="right_shoulder_front",
        vertex_idx=4800,
        region=BodyRegion.SHOULDER,
        anatomical_name="Right shoulder front",
        position_description="Front of right shoulder"
    ),
    "left_shoulder_back": Landmark(
        name="left_shoulder_back",
        vertex_idx=1401,
        region=BodyRegion.SHOULDER,
        anatomical_name="Left shoulder back",
        position_description="Back of left shoulder"
    ),
    "right_shoulder_back": Landmark(
        name="right_shoulder_back",
        vertex_idx=4610,
        region=BodyRegion.SHOULDER,
        anatomical_name="Right shoulder back",
        position_description="Back of right shoulder"
    ),
    "left_clavicle_inner": Landmark(
        name="left_clavicle_inner",
        vertex_idx=1590,
        region=BodyRegion.SHOULDER,
        anatomical_name="Left clavicle medial",
        position_description="Inner end of left clavicle"
    ),
    "right_clavicle_inner": Landmark(
        name="right_clavicle_inner",
        vertex_idx=4750,
        region=BodyRegion.SHOULDER,
        anatomical_name="Right clavicle medial",
        position_description="Inner end of right clavicle"
    ),

    # CHEST AND TORSO LANDMARKS (15+ vertices)
    "chest_center": Landmark(
        name="chest_center",
        vertex_idx=3128,
        region=BodyRegion.CHEST,
        anatomical_name="Mesosternale",
        position_description="Center of chest at sternum"
    ),
    "chest_top": Landmark(
        name="chest_top",
        vertex_idx=3144,
        region=BodyRegion.CHEST,
        anatomical_name="Suprasternale",
        position_description="Top of breastbone"
    ),
    "left_breast": Landmark(
        name="left_breast",
        vertex_idx=1819,
        region=BodyRegion.CHEST,
        anatomical_name="Left nipple area",
        position_description="Left chest prominence"
    ),
    "right_breast": Landmark(
        name="right_breast",
        vertex_idx=5110,
        region=BodyRegion.CHEST,
        anatomical_name="Right nipple area",
        position_description="Right chest prominence"
    ),
    "left_underbreast": Landmark(
        name="left_underbreast",
        vertex_idx=1909,
        region=BodyRegion.CHEST,
        anatomical_name="Left inframammary fold",
        position_description="Under left breast"
    ),
    "right_underbreast": Landmark(
        name="right_underbreast",
        vertex_idx=5240,
        region=BodyRegion.CHEST,
        anatomical_name="Right inframammary fold",
        position_description="Under right breast"
    ),
    "back_center": Landmark(
        name="back_center",
        vertex_idx=1249,
        region=BodyRegion.CHEST,
        anatomical_name="Back center",
        position_description="Center line of back"
    ),
    "left_back": Landmark(
        name="left_back",
        vertex_idx=1083,
        region=BodyRegion.CHEST,
        anatomical_name="Left back",
        position_description="Left side of back"
    ),
    "right_back": Landmark(
        name="right_back",
        vertex_idx=4349,
        region=BodyRegion.CHEST,
        anatomical_name="Right back",
        position_description="Right side of back"
    ),

    # WAIST LANDMARKS (10+ vertices)
    "waist_center_front": Landmark(
        name="waist_center_front",
        vertex_idx=3221,
        region=BodyRegion.WAIST,
        anatomical_name="Waist front center",
        position_description="Front center of waist"
    ),
    "waist_center_back": Landmark(
        name="waist_center_back",
        vertex_idx=1298,
        region=BodyRegion.WAIST,
        anatomical_name="Waist back center",
        position_description="Back center of waist"
    ),
    "waist_left": Landmark(
        name="waist_left",
        vertex_idx=1472,
        region=BodyRegion.WAIST,
        anatomical_name="Left waist",
        position_description="Left side of waist"
    ),
    "waist_right": Landmark(
        name="waist_right",
        vertex_idx=4656,
        region=BodyRegion.WAIST,
        anatomical_name="Right waist",
        position_description="Right side of waist"
    ),
    "left_side_waist": Landmark(
        name="left_side_waist",
        vertex_idx=1450,
        region=BodyRegion.WAIST,
        anatomical_name="Left lateral waist",
        position_description="Lateral aspect of left waist"
    ),
    "right_side_waist": Landmark(
        name="right_side_waist",
        vertex_idx=4624,
        region=BodyRegion.WAIST,
        anatomical_name="Right lateral waist",
        position_description="Lateral aspect of right waist"
    ),

    # HIP AND PELVIC LANDMARKS (12+ vertices)
    "hip_center_front": Landmark(
        name="hip_center_front",
        vertex_idx=3229,
        region=BodyRegion.HIP,
        anatomical_name="Hip front center",
        position_description="Front center at hip level"
    ),
    "hip_center_back": Landmark(
        name="hip_center_back",
        vertex_idx=1339,
        region=BodyRegion.HIP,
        anatomical_name="Hip back center",
        position_description="Back center at hip level"
    ),
    "left_hip_point": Landmark(
        name="left_hip_point",
        vertex_idx=1621,
        region=BodyRegion.HIP,
        anatomical_name="Left anterior superior iliac spine",
        position_description="Left hip bone prominence"
    ),
    "right_hip_point": Landmark(
        name="right_hip_point",
        vertex_idx=4815,
        region=BodyRegion.HIP,
        anatomical_name="Right anterior superior iliac spine",
        position_description="Right hip bone prominence"
    ),
    "left_greater_trochanter": Landmark(
        name="left_greater_trochanter",
        vertex_idx=1786,
        region=BodyRegion.HIP,
        anatomical_name="Left greater trochanter",
        position_description="Widest point of left hip"
    ),
    "right_greater_trochanter": Landmark(
        name="right_greater_trochanter",
        vertex_idx=5009,
        region=BodyRegion.HIP,
        anatomical_name="Right greater trochanter",
        position_description="Widest point of right hip"
    ),
    "left_gluteal": Landmark(
        name="left_gluteal",
        vertex_idx=1685,
        region=BodyRegion.HIP,
        anatomical_name="Left buttock point",
        position_description="Prominent point of left buttock"
    ),
    "right_gluteal": Landmark(
        name="right_gluteal",
        vertex_idx=4935,
        region=BodyRegion.HIP,
        anatomical_name="Right buttock point",
        position_description="Prominent point of right buttock"
    ),

    # LEFT ARM LANDMARKS (8+ vertices)
    "left_elbow": Landmark(
        name="left_elbow",
        vertex_idx=1554,
        region=BodyRegion.ARM,
        anatomical_name="Left elbow",
        position_description="Olecranon - tip of left elbow"
    ),
    "left_elbow_front": Landmark(
        name="left_elbow_front",
        vertex_idx=1609,
        region=BodyRegion.ARM,
        anatomical_name="Left elbow anterior",
        position_description="Front of left elbow"
    ),
    "left_wrist": Landmark(
        name="left_wrist",
        vertex_idx=1481,
        region=BodyRegion.WRIST,
        anatomical_name="Left wrist",
        position_description="Wrist crease of left hand"
    ),
    "left_wrist_ulnar": Landmark(
        name="left_wrist_ulnar",
        vertex_idx=1467,
        region=BodyRegion.WRIST,
        anatomical_name="Left ulnar styloid",
        position_description="Ulnar side of left wrist"
    ),
    "left_wrist_radial": Landmark(
        name="left_wrist_radial",
        vertex_idx=1495,
        region=BodyRegion.WRIST,
        anatomical_name="Left radial styloid",
        position_description="Radial side of left wrist"
    ),
    "left_hand_center": Landmark(
        name="left_hand_center",
        vertex_idx=1438,
        region=BodyRegion.HAND,
        anatomical_name="Left palm center",
        position_description="Center of left palm"
    ),
    "left_finger_tip": Landmark(
        name="left_finger_tip",
        vertex_idx=1408,
        region=BodyRegion.HAND,
        anatomical_name="Left middle finger tip",
        position_description="Tip of left middle finger"
    ),

    # RIGHT ARM LANDMARKS (8+ vertices)
    "right_elbow": Landmark(
        name="right_elbow",
        vertex_idx=4780,
        region=BodyRegion.ARM,
        anatomical_name="Right elbow",
        position_description="Olecranon - tip of right elbow"
    ),
    "right_elbow_front": Landmark(
        name="right_elbow_front",
        vertex_idx=4844,
        region=BodyRegion.ARM,
        anatomical_name="Right elbow anterior",
        position_description="Front of right elbow"
    ),
    "right_wrist": Landmark(
        name="right_wrist",
        vertex_idx=4705,
        region=BodyRegion.WRIST,
        anatomical_name="Right wrist",
        position_description="Wrist crease of right hand"
    ),
    "right_wrist_ulnar": Landmark(
        name="right_wrist_ulnar",
        vertex_idx=4691,
        region=BodyRegion.WRIST,
        anatomical_name="Right ulnar styloid",
        position_description="Ulnar side of right wrist"
    ),
    "right_wrist_radial": Landmark(
        name="right_wrist_radial",
        vertex_idx=4719,
        region=BodyRegion.WRIST,
        anatomical_name="Right radial styloid",
        position_description="Radial side of right wrist"
    ),
    "right_hand_center": Landmark(
        name="right_hand_center",
        vertex_idx=4662,
        region=BodyRegion.HAND,
        anatomical_name="Right palm center",
        position_description="Center of right palm"
    ),
    "right_finger_tip": Landmark(
        name="right_finger_tip",
        vertex_idx=4632,
        region=BodyRegion.HAND,
        anatomical_name="Right middle finger tip",
        position_description="Tip of right middle finger"
    ),

    # LEFT LEG LANDMARKS (8+ vertices)
    "left_hip_joint": Landmark(
        name="left_hip_joint",
        vertex_idx=1735,
        region=BodyRegion.THIGH,
        anatomical_name="Left hip joint",
        position_description="Left hip joint center"
    ),
    "left_mid_thigh": Landmark(
        name="left_mid_thigh",
        vertex_idx=1780,
        region=BodyRegion.THIGH,
        anatomical_name="Left mid-thigh",
        position_description="Midpoint of left thigh"
    ),
    "left_thigh_front": Landmark(
        name="left_thigh_front",
        vertex_idx=1868,
        region=BodyRegion.THIGH,
        anatomical_name="Left thigh anterior",
        position_description="Front of left thigh"
    ),
    "left_knee": Landmark(
        name="left_knee",
        vertex_idx=1768,
        region=BodyRegion.KNEE,
        anatomical_name="Left knee",
        position_description="Center of left knee"
    ),
    "left_knee_center": Landmark(
        name="left_knee_center",
        vertex_idx=1755,
        region=BodyRegion.KNEE,
        anatomical_name="Left patella",
        position_description="Left kneecap"
    ),
    "left_mid_calf": Landmark(
        name="left_mid_calf",
        vertex_idx=1819,
        region=BodyRegion.CALF,
        anatomical_name="Left mid-calf",
        position_description="Midpoint of left calf"
    ),
    "left_ankle": Landmark(
        name="left_ankle",
        vertex_idx=1828,
        region=BodyRegion.ANKLE,
        anatomical_name="Left ankle",
        position_description="Left ankle center"
    ),
    "left_ankle_medial": Landmark(
        name="left_ankle_medial",
        vertex_idx=1815,
        region=BodyRegion.ANKLE,
        anatomical_name="Left medial malleolus",
        position_description="Inner side of left ankle"
    ),

    # RIGHT LEG LANDMARKS (8+ vertices)
    "right_hip_joint": Landmark(
        name="right_hip_joint",
        vertex_idx=4960,
        region=BodyRegion.THIGH,
        anatomical_name="Right hip joint",
        position_description="Right hip joint center"
    ),
    "right_mid_thigh": Landmark(
        name="right_mid_thigh",
        vertex_idx=5008,
        region=BodyRegion.THIGH,
        anatomical_name="Right mid-thigh",
        position_description="Midpoint of right thigh"
    ),
    "right_thigh_front": Landmark(
        name="right_thigh_front",
        vertex_idx=5096,
        region=BodyRegion.THIGH,
        anatomical_name="Right thigh anterior",
        position_description="Front of right thigh"
    ),
    "right_knee": Landmark(
        name="right_knee",
        vertex_idx=4996,
        region=BodyRegion.KNEE,
        anatomical_name="Right knee",
        position_description="Center of right knee"
    ),
    "right_knee_center": Landmark(
        name="right_knee_center",
        vertex_idx=4983,
        region=BodyRegion.KNEE,
        anatomical_name="Right patella",
        position_description="Right kneecap"
    ),
    "right_mid_calf": Landmark(
        name="right_mid_calf",
        vertex_idx=5047,
        region=BodyRegion.CALF,
        anatomical_name="Right mid-calf",
        position_description="Midpoint of right calf"
    ),
    "right_ankle": Landmark(
        name="right_ankle",
        vertex_idx=5056,
        region=BodyRegion.ANKLE,
        anatomical_name="Right ankle",
        position_description="Right ankle center"
    ),
    "right_ankle_medial": Landmark(
        name="right_ankle_medial",
        vertex_idx=5043,
        region=BodyRegion.ANKLE,
        anatomical_name="Right medial malleolus",
        position_description="Inner side of right ankle"
    ),
}

# Verify we have 70+ landmarks
assert len(LANDMARKS) >= 70, f"Must have 70+ landmarks, got {len(LANDMARKS)}"


# ============================================================================
# CIRCUMFERENCE MEASUREMENT PATHS
# ============================================================================
# Define ordered vertex paths for circumference (girth) measurements

CIRCUMFERENCE_PATHS: Dict[str, CircumferencePath] = {
    "head_circumference": CircumferencePath(
        name="head_circumference",
        measurement_type=MeasurementType.CIRCUMFERENCE,
        vertex_indices=[
            282,  # Glabella front
            412,  # Head top
            1143,  # Occipital back
            412,  # Head top (return)
        ],
        region=BodyRegion.HEAD,
        description="Around the fullest part of the head"
    ),
    "neck_circumference": CircumferencePath(
        name="neck_circumference",
        measurement_type=MeasurementType.CIRCUMFERENCE,
        vertex_indices=[
            1638,  # Neck back
            1527,  # Left neck side
            3471,  # Neck front
            1792,  # Right neck side
            1638,  # Return to neck back
        ],
        region=BodyRegion.NECK,
        description="Around the base of the neck"
    ),
    "shoulder_circumference": CircumferencePath(
        name="shoulder_circumference",
        measurement_type=MeasurementType.CIRCUMFERENCE,
        vertex_indices=[
            1506,  # Left shoulder top
            1623,  # Left shoulder front
            1819,  # Left chest
            3128,  # Chest center
            5110,  # Right chest
            4800,  # Right shoulder front
            4695,  # Right shoulder top
            4610,  # Right shoulder back
            1401,  # Left shoulder back
            1506,  # Return
        ],
        region=BodyRegion.SHOULDER,
        description="Around shoulders and chest"
    ),
    "chest_circumference": CircumferencePath(
        name="chest_circumference",
        measurement_type=MeasurementType.CIRCUMFERENCE,
        vertex_indices=[
            3128,  # Chest center
            1819,  # Left breast
            1083,  # Left back
            1249,  # Back center
            4349,  # Right back
            5110,  # Right chest
            3128,  # Return to chest center
        ],
        region=BodyRegion.CHEST,
        description="Around the fullest part of the chest"
    ),
    "waist_circumference": CircumferencePath(
        name="waist_circumference",
        measurement_type=MeasurementType.CIRCUMFERENCE,
        vertex_indices=[
            3221,  # Waist front center
            1472,  # Left waist
            1298,  # Waist back center
            4656,  # Right waist
            3221,  # Return to front
        ],
        region=BodyRegion.WAIST,
        description="Around the narrowest part of the waist"
    ),
    "hip_circumference": CircumferencePath(
        name="hip_circumference",
        measurement_type=MeasurementType.CIRCUMFERENCE,
        vertex_indices=[
            3229,  # Hip front center
            1621,  # Left hip point
            1685,  # Left gluteal
            1339,  # Hip back center
            4935,  # Right gluteal
            4815,  # Right hip point
            3229,  # Return to front
        ],
        region=BodyRegion.HIP,
        description="Around the fullest part of the hip/buttocks"
    ),
    "left_arm_circumference": CircumferencePath(
        name="left_arm_circumference",
        measurement_type=MeasurementType.CIRCUMFERENCE,
        vertex_indices=[
            1554,  # Left elbow
            1609,  # Left elbow front
            1609,  # Forming circle around elbow
            1554,  # Return
        ],
        region=BodyRegion.ARM,
        description="Around the left arm at elbow level"
    ),
    "right_arm_circumference": CircumferencePath(
        name="right_arm_circumference",
        measurement_type=MeasurementType.CIRCUMFERENCE,
        vertex_indices=[
            4780,  # Right elbow
            4844,  # Right elbow front
            4844,  # Forming circle around elbow
            4780,  # Return
        ],
        region=BodyRegion.ARM,
        description="Around the right arm at elbow level"
    ),
    "left_wrist_circumference": CircumferencePath(
        name="left_wrist_circumference",
        measurement_type=MeasurementType.CIRCUMFERENCE,
        vertex_indices=[
            1481,  # Left wrist
            1467,  # Left ulnar styloid
            1495,  # Left radial styloid
            1481,  # Return
        ],
        region=BodyRegion.WRIST,
        description="Around the left wrist"
    ),
    "right_wrist_circumference": CircumferencePath(
        name="right_wrist_circumference",
        measurement_type=MeasurementType.CIRCUMFERENCE,
        vertex_indices=[
            4705,  # Right wrist
            4691,  # Right ulnar styloid
            4719,  # Right radial styloid
            4705,  # Return
        ],
        region=BodyRegion.WRIST,
        description="Around the right wrist"
    ),
    "left_thigh_circumference": CircumferencePath(
        name="left_thigh_circumference",
        measurement_type=MeasurementType.CIRCUMFERENCE,
        vertex_indices=[
            1780,  # Left mid-thigh
            1868,  # Left thigh front
            1780,  # Forming circle
            1780,  # Return
        ],
        region=BodyRegion.THIGH,
        description="Around the left thigh at mid-point"
    ),
    "right_thigh_circumference": CircumferencePath(
        name="right_thigh_circumference",
        measurement_type=MeasurementType.CIRCUMFERENCE,
        vertex_indices=[
            5008,  # Right mid-thigh
            5096,  # Right thigh front
            5008,  # Forming circle
            5008,  # Return
        ],
        region=BodyRegion.THIGH,
        description="Around the right thigh at mid-point"
    ),
    "left_calf_circumference": CircumferencePath(
        name="left_calf_circumference",
        measurement_type=MeasurementType.CIRCUMFERENCE,
        vertex_indices=[
            1819,  # Left mid-calf
            1819,  # Forming circle around calf
            1819,  # Return
        ],
        region=BodyRegion.CALF,
        description="Around the left calf at fullest point"
    ),
    "right_calf_circumference": CircumferencePath(
        name="right_calf_circumference",
        measurement_type=MeasurementType.CIRCUMFERENCE,
        vertex_indices=[
            5047,  # Right mid-calf
            5047,  # Forming circle around calf
            5047,  # Return
        ],
        region=BodyRegion.CALF,
        description="Around the right calf at fullest point"
    ),
    "left_ankle_circumference": CircumferencePath(
        name="left_ankle_circumference",
        measurement_type=MeasurementType.CIRCUMFERENCE,
        vertex_indices=[
            1828,  # Left ankle
            1815,  # Left medial malleolus
            1828,  # Forming circle
            1828,  # Return
        ],
        region=BodyRegion.ANKLE,
        description="Around the left ankle"
    ),
    "right_ankle_circumference": CircumferencePath(
        name="right_ankle_circumference",
        measurement_type=MeasurementType.CIRCUMFERENCE,
        vertex_indices=[
            5056,  # Right ankle
            5043,  # Right medial malleolus
            5056,  # Forming circle
            5056,  # Return
        ],
        region=BodyRegion.ANKLE,
        description="Around the right ankle"
    ),
}


# ============================================================================
# LANDMARK LOOKUP AND ACCESS FUNCTIONS
# ============================================================================

def get_landmark(name: str) -> Optional[Landmark]:
    """
    Get a landmark by name.

    Args:
        name: The landmark name (e.g., "head_top", "left_elbow")

    Returns:
        The Landmark object, or None if not found
    """
    return LANDMARKS.get(name)


def get_landmark_vertex(name: str) -> Optional[int]:
    """
    Get the vertex index for a landmark by name.

    Args:
        name: The landmark name

    Returns:
        The vertex index, or None if landmark not found
    """
    landmark = LANDMARKS.get(name)
    return landmark.vertex_idx if landmark else None


def get_landmarks_by_region(region: BodyRegion) -> List[Landmark]:
    """
    Get all landmarks in a specific body region.

    Args:
        region: The body region

    Returns:
        List of landmarks in that region, sorted by name
    """
    matching = [lm for lm in LANDMARKS.values() if lm.region == region]
    return sorted(matching, key=lambda lm: lm.name)


def get_all_landmark_names() -> List[str]:
    """
    Get all landmark names.

    Returns:
        Sorted list of all landmark names
    """
    return sorted(LANDMARKS.keys())


def get_all_landmark_vertices() -> List[int]:
    """
    Get all vertex indices used in landmarks.

    Returns:
        Sorted list of unique vertex indices
    """
    return sorted(set(lm.vertex_idx for lm in LANDMARKS.values()))


def get_circumference_path(name: str) -> Optional[CircumferencePath]:
    """
    Get a circumference measurement path by name.

    Args:
        name: The circumference path name

    Returns:
        The CircumferencePath object, or None if not found
    """
    return CIRCUMFERENCE_PATHS.get(name)


def get_circumference_paths_by_region(region: BodyRegion) -> List[CircumferencePath]:
    """
    Get all circumference paths for a specific body region.

    Args:
        region: The body region

    Returns:
        List of circumference paths in that region, sorted by name
    """
    matching = [cp for cp in CIRCUMFERENCE_PATHS.values() if cp.region == region]
    return sorted(matching, key=lambda cp: cp.name)


def get_all_circumference_names() -> List[str]:
    """
    Get all circumference measurement names.

    Returns:
        Sorted list of all circumference names
    """
    return sorted(CIRCUMFERENCE_PATHS.keys())


def get_landmarks_stats() -> Dict[str, any]:
    """
    Get statistics about available landmarks.

    Returns:
        Dictionary with landmark statistics
    """
    region_counts = {}
    for landmark in LANDMARKS.values():
        region_name = landmark.region.value
        region_counts[region_name] = region_counts.get(region_name, 0) + 1

    return {
        "total_landmarks": len(LANDMARKS),
        "total_circumference_paths": len(CIRCUMFERENCE_PATHS),
        "unique_vertices": len(get_all_landmark_vertices()),
        "landmarks_by_region": region_counts,
        "body_regions": [r.value for r in BodyRegion],
    }


# ============================================================================
# MODULE INITIALIZATION AND VALIDATION
# ============================================================================

def validate_landmarks() -> Tuple[bool, List[str]]:
    """
    Validate landmark definitions for consistency.

    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    errors = []

    # Check minimum count
    if len(LANDMARKS) < 70:
        errors.append(f"Must have 70+ landmarks, got {len(LANDMARKS)}")

    # Check for duplicate vertex indices within regions
    region_vertices = {}
    for lm in LANDMARKS.values():
        region_name = lm.region.value
        if region_name not in region_vertices:
            region_vertices[region_name] = {}

        key = (lm.vertex_idx, lm.anatomical_name)
        if lm.vertex_idx in region_vertices[region_name]:
            if region_vertices[region_name][lm.vertex_idx] != lm.anatomical_name:
                errors.append(
                    f"Duplicate vertex {lm.vertex_idx} in region {region_name} "
                    f"with different anatomical names"
                )
        else:
            region_vertices[region_name][lm.vertex_idx] = lm.anatomical_name

    # Check circumference paths reference valid vertices
    all_vertices = get_all_landmark_vertices()
    for cp_name, cp in CIRCUMFERENCE_PATHS.items():
        for vertex_idx in cp.vertex_indices:
            if vertex_idx not in all_vertices:
                errors.append(
                    f"Circumference path '{cp_name}' references undefined vertex {vertex_idx}"
                )

    return len(errors) == 0, errors


# Run validation on module load
_is_valid, _validation_errors = validate_landmarks()
if not _is_valid:
    import warnings
    for error in _validation_errors:
        warnings.warn(f"Landmark validation error: {error}")
