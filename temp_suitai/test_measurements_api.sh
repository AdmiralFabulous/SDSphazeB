#!/bin/bash

# Test script for measurements API
# This script demonstrates how to store measurements to the database

# 1. Create a session first
echo "Creating a session..."
SESSION_RESPONSE=$(curl -s -X POST http://localhost:3000/api/sessions/test-session-001/height \
  -H "Content-Type: application/json" \
  -d '{"height": 175}')

echo "Session response:"
echo "$SESSION_RESPONSE" | jq .

# Extract session ID
SESSION_ID=$(echo "$SESSION_RESPONSE" | jq -r '.sessionId')
echo "Session ID: $SESSION_ID"

# 2. Store measurements with SMPL-X parameters
echo -e "\n\nStoring measurements..."

# Create sample data:
# - 28 measurements: 12 lengths/widths + 16 circumferences
# - 10 beta parameters (shape)
# - 72 theta parameters (pose: 24 joints × 3 axis-angle)

MEASUREMENTS_RESPONSE=$(curl -s -X POST http://localhost:3000/api/measurements \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "'$SESSION_ID'",
    "measurements": [
      175.0, 42.5, 65.0, 172.0, 42.0, 42.0, 38.0, 38.0, 92.0, 88.0, 88.0, 88.0,
      92.0, 76.0, 28.0, 28.0, 24.0, 24.0, 56.0, 56.0, 38.0, 38.0, 34.0, 34.0,
      92.0, 82.0, 32.0, 32.0
    ],
    "confidence": 0.95,
    "smplBeta": [0.1, -0.2, 0.3, 0.05, -0.1, 0.0, 0.15, -0.05, 0.2, 0.1],
    "smplTheta": [
      0.0, 0.0, 0.0, 0.1, 0.0, 0.0, -0.1, 0.0, 0.0, 0.2, 0.0, 0.0,
      -0.2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.05, 0.0, 0.0, -0.05, 0.0, 0.0,
      0.15, 0.0, 0.0, -0.15, 0.0, 0.0, 0.1, 0.0, 0.0, -0.1, 0.0, 0.0,
      0.08, 0.0, 0.0, -0.08, 0.0, 0.0, 0.06, 0.0, 0.0, -0.06, 0.0, 0.0,
      0.04, 0.0, 0.0, -0.04, 0.0, 0.0, 0.03, 0.0, 0.0, -0.03, 0.0, 0.0,
      0.02, 0.0, 0.0, -0.02, 0.0, 0.0, 0.01, 0.0, 0.0, -0.01, 0.0, 0.0
    ],
    "smplGlobalRotation": [1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0],
    "smplGlobalTranslation": [0.0, 0.0, 0.0],
    "poseConfidence": 0.92,
    "shapeConfidence": 0.88
  }')

echo "Measurements response:"
echo "$MEASUREMENTS_RESPONSE" | jq .

# Extract measurement ID
MEASUREMENT_ID=$(echo "$MEASUREMENTS_RESPONSE" | jq -r '.measurementId')
echo "Measurement ID: $MEASUREMENT_ID"
