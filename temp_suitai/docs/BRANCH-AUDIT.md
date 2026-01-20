# Vibe-Kanban Branch Audit Report
**Generated:** 2026-01-19
**Source Repo:** `D:\SameDaySuits\_SameDaySuits\SUIT AI v4_b\SUIT AI v4.b`
**Target Repo:** `https://github.com/AdmiralFabulous/SUIT-AI-v4b.git`

---

## Summary

| Status | Count |
|--------|-------|
| Already Merged | 5 |
| Ready to Merge (with code) | 16 |
| Duplicates/Skip | ~150 |
| Total TODO remaining | 194 |

---

## ALREADY MERGED TO PRODUCTION

| Task ID | Description | Files |
|---------|-------------|-------|
| DB-E01-S01-T01 | Create users table | `supabase/migrations/001_create_users_table.sql` |
| DB-E01-S02-T02 | Create fabrics table | `supabase/migrations/20260119070000_create_fabrics_table.sql` |
| VIS-E01-S01-T01 | Create Height Input Endpoint | `src/app/api/sessions/[id]/height/route.ts`, `prisma/schema.prisma` |
| VIS-E01-S01-T02 | Calculate Mesh Height | `vision_service/calibration/mesh_height.py` |
| VIS-E01-S01-T03 | Derive Scale Factor | `vision_service/calibration/scale.py` |

---

## READY TO MERGE (Unique Code)

### VIS-E01: Height-Based Calibration (continued)

| Task ID | Branch | Key Files | Has Tests |
|---------|--------|-----------|-----------|
| VIS-E01-S01-T04 | `vk/56c6-vis-e01-s01-t04` | `vision_service/calibration/apply_scale.py` | No |

### VIS-E01-S02: ArUco Calibration

| Task ID | Branch | Key Files | Has Tests |
|---------|--------|-----------|-----------|
| VIS-E01-S02-T01 | `vk/61e8-vis-e01-s02-t01` | `vision_service/calibration/aruco_detect.py` | Yes |
| VIS-E01-S02-T02 | `vk/d338-vis-e01-s02-t02` | `vision_service/calibration/pnp_solver.py` | Yes |
| VIS-E01-S02-T03 | `vk/2bee-vis-e01-s02-t03` | `vision_service/calibration/aruco_scale.py` | Yes |
| VIS-E01-S02-T04 | `vk/ae4f-vis-e01-s02-t04` | `vision_service/calibration/calibration_lock.py` | Yes |

### VIS-E02-S01: Reconstruction Pipeline

| Task ID | Branch | Key Files | Has Tests |
|---------|--------|-----------|-----------|
| VIS-E02-S01-T01 | `vk/9a12-vis-e02-s01-t01` | `vision_service/segmentation/sam_segment.py` | Yes |
| VIS-E02-S01-T02 | `vk/83cc-vis-e02-s01-t02` | `vision_service/reconstruction/body4d.py` | Yes |
| VIS-E02-S01-T03 | `vk/82bb-vis-e02-s01-t03` | `vision_service/reconstruction/hmr_pose.py` | Yes |
| VIS-E02-S01-T05 | `vk/9dd9-vis-e02-s01-t05` | `vision_service/reconstruction/mhr_bridge.py` | Yes |
| VIS-E02-S01-T06 | `vk/f8bf-vis-e02-s01-t06` | `vision_service/reconstruction/fuse_params.py` | Yes |

### VIS-E02-S02: Temporal Filtering

| Task ID | Branch | Key Files | Has Tests |
|---------|--------|-----------|-----------|
| VIS-E02-S02-T01 | `vk/02ee-vis-e02-s02-t01` | `vision_service/filtering/kalman_filter.py` | Yes |
| VIS-E02-S02-T02 | `vk/4c72-vis-e02-s02-t02` | `vision_service/filtering/one_euro_filter.py` | Yes |
| VIS-E02-S02-T04 | `vk/7b30-vis-e02-s02-t04` | `vision_service/filtering/measurement_lock.py` | Yes |

### VIS-E03-S01: Measurement Extraction

| Task ID | Branch | Key Files | Has Tests |
|---------|--------|-----------|-----------|
| VIS-E03-S01-T01 | `vk/33d4-vis-e03-s01-t01` | `vision_service/measurements/apose.py` | Yes |
| VIS-E03-S01-T02 | `vk/83a5-vis-e03-s01-t02` | `vision_service/measurements/landmarks.py` | No |

---

## RECOMMENDED MERGE ORDER

To avoid conflicts, merge in this order:

```
1. VIS-E01-S01-T04 (apply_scale.py)
2. VIS-E01-S02-T01 (aruco_detect.py)
3. VIS-E01-S02-T02 (pnp_solver.py) 
4. VIS-E01-S02-T03 (aruco_scale.py) - depends on T01, T02
5. VIS-E01-S02-T04 (calibration_lock.py)
6. VIS-E02-S01-T01 (sam_segment.py)
7. VIS-E02-S01-T02 (body4d.py)
8. VIS-E02-S01-T03 (hmr_pose.py)
9. VIS-E02-S01-T05 (mhr_bridge.py)
10. VIS-E02-S01-T06 (fuse_params.py)
11. VIS-E02-S02-T01 (kalman_filter.py)
12. VIS-E02-S02-T02 (one_euro_filter.py)
13. VIS-E02-S02-T04 (measurement_lock.py)
14. VIS-E03-S01-T01 (apose.py)
15. VIS-E03-S01-T02 (landmarks.py)
```

---

## SKIPPED BRANCHES (Duplicates/No Code)

These branches are duplicates or contain only documentation:
- Multiple `infra-e01-s01-t0*` branches (same task, different attempts)
- Multiple `db-e01-*` branches (already merged)
- `vk/8b0a-install-and-inte` (vibe-kanban companion, not project code)
- Various branches with only `.md` files

---

## REMAINING KANBAN TASKS (Not Started)

After merging the 16 branches above, these remain in `todo` status:

### Database (DB)
- DB-E01-S01-T02: Create sessions Table
- DB-E01-S01-T03: Add RLS Policy - Users
- DB-E01-S01-T04: Add RLS Policy - Sessions
- DB-E01-S02-T01: Create measurements Table
- DB-E01-S02-T03: Create suit_configs Table
- DB-E01-S02-T04: Seed Initial Fabrics
- DB-E02-S01-T01 through T05: Wedding tables
- DB-E03-S01-T01 through T05: Order tables

### API
- All API-E01, API-E02, API-E03 tasks

### Frontend
- All FE-E01 through FE-E05 tasks

### Admin/Runner/Finance/Voice/Test
- All remaining tasks

---

## NEXT STEPS

1. **Merge 16 branches** with actual code (listed above)
2. **Push to GitHub**
3. **Create fresh kanban** or update existing with accurate status
4. **Continue with DB tasks** (sessions, measurements, suit_configs)
