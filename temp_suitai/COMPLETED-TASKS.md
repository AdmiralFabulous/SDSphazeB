# Completed Tasks - DO NOT RE-IMPLEMENT

These tasks have already been implemented and merged. Skip them in the kanban.

## Database (DB)
- [x] DB-E01-S01-T01: Create users Table → `supabase/migrations/001_create_users_table.sql`
- [x] DB-E01-S02-T02: Create fabrics Table → `supabase/migrations/20260119070000_create_fabrics_table.sql`

## Vision Service - Height Calibration (VIS-E01-S01)
- [x] VIS-E01-S01-T01: Create Height Input Endpoint → `src/app/api/sessions/[id]/height/route.ts`
- [x] VIS-E01-S01-T02: Calculate Mesh Height → `vision_service/calibration/mesh_height.py`
- [x] VIS-E01-S01-T03: Derive Scale Factor → `vision_service/calibration/scale.py`
- [x] VIS-E01-S01-T04: Apply Scale to Mesh → `vision_service/calibration/apply_scale.py`

## Vision Service - ArUco Calibration (VIS-E01-S02)
- [x] VIS-E01-S02-T01: Implement ArUco Detection → `vision_service/calibration/aruco_detect.py`
- [x] VIS-E01-S02-T02: Implement PnP Solver → `vision_service/calibration/pnp_solver.py`
- [x] VIS-E01-S02-T03: Calculate Scale from Marker → `vision_service/calibration/aruco_scale.py`
- [x] VIS-E01-S02-T04: Implement Calibration Lock → `vision_service/calibration/calibration_lock.py`

## Vision Service - Reconstruction (VIS-E02-S01)
- [x] VIS-E02-S01-T01: Implement SAM 3 Segmentation → `vision_service/segmentation/sam_segment.py`
- [x] VIS-E02-S01-T02: Implement SAM-Body4D → `vision_service/reconstruction/body4d.py`
- [x] VIS-E02-S01-T03: Implement HMR 2.0 Pose → `vision_service/reconstruction/hmr_pose.py`
- [x] VIS-E02-S01-T05: Implement MHR-to-SMPL-X Bridge → `vision_service/reconstruction/mhr_bridge.py`
- [x] VIS-E02-S01-T06: Fuse Pose and Shape → `vision_service/reconstruction/fuse_params.py`

## Vision Service - Filtering (VIS-E02-S02)
- [x] VIS-E02-S02-T01: Implement Kalman Filter → `vision_service/filtering/kalman_filter.py`
- [x] VIS-E02-S02-T02: Implement OneEuro Filter → `vision_service/filtering/one_euro_filter.py`
- [x] VIS-E02-S02-T04: Average Over 300 Frames → `vision_service/filtering/measurement_lock.py`

## Vision Service - Measurements (VIS-E03-S01)
- [x] VIS-E03-S01-T01: Implement A-Pose Normalization → `vision_service/measurements/apose.py`
- [x] VIS-E03-S01-T02: Load SMPL-Anthropometry Landmarks → `vision_service/measurements/landmarks.py`

---

## Still TODO (from docs/05-KANBAN-TASKS.md)

### Database - Remaining
- [ ] DB-E01-S01-T02: Create sessions Table
- [ ] DB-E01-S01-T03: Add RLS Policy - Users
- [ ] DB-E01-S01-T04: Add RLS Policy - Sessions
- [ ] DB-E01-S02-T01: Create measurements Table
- [ ] DB-E01-S02-T03: Create suit_configs Table
- [ ] DB-E01-S02-T04: Seed Initial Fabrics
- [ ] DB-E02-S01-T01 through T05: Wedding tables
- [ ] DB-E03-S01-T01 through T05: Order tables

### Vision Service - Remaining
- [ ] VIS-E02-S01-T04: Implement SHAPY Shape
- [ ] VIS-E02-S02-T03: Implement Warm-up Period
- [ ] VIS-E03-S01-T03: Implement Geodesic Measurements
- [ ] VIS-E03-S01-T04: Implement Planar Slicing
- [ ] VIS-E03-S01-T05: Extract 28 Measurements
- [ ] VIS-E03-S01-T06: Store in Database
- [ ] VIS-E03-S02-T01 through T04: Inverse Anthropometry

### API - All tasks pending
### Frontend - All tasks pending
### Admin Dashboard - All tasks pending
### Runner App - All tasks pending
### Financial Integration - All tasks pending
### Voice Integration - All tasks pending
### Testing - All tasks pending
