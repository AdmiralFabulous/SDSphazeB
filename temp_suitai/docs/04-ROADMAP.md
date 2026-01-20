# SUIT AI v4.b - Development Roadmap
## Waterfall Phase Plan

> **Document Version:** 1.0  
> **Date:** 2026-01-19

---

## Timeline Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEVELOPMENT TIMELINE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 1          PHASE 2          PHASE 3          PHASE 4          PHASE 5
│  Foundation       Core Tech        Manual Bridge    Integration      Launch  
│  Weeks 1-4        Weeks 5-8        Weeks 9-12       Weeks 13-16      Weeks 17+
│  ═══════════      ═══════════      ═══════════      ═══════════      ════════
│                                                                             │
│  • Infrastructure • Vision Pipeline • Operator Dash  • Voice AI       • Beta
│  • Database       • Body Scanner   • Runner App     • Polish          • QA  
│  • Auth + Stripe  • Configurator   • Optitex Flow   • E2E Tests       • Launch
│  • Legal/Entity   • Track A+B UI   • Ruler Test     • Track B Full    • Monitor
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Foundation & Entity (Weeks 1-4)

**Objective:** Establish corporate, legal, and technical bedrock

### 1.1 Legal & Compliance

| Task | Description | Owner | Status |
|------|-------------|-------|--------|
| Incorporate ATQ Logistics Limited | India entity for manufacturing | Legal | Pending |
| Secure second shareholder | Resident director requirement | Legal | Pending |
| Register for GST | Goods & Services Tax | Legal | Pending |
| File LUT | Letter of Undertaking for zero-rated exports | Legal | Pending |
| RBI LRN Application | Loan Registration Number | Legal | Pending |
| Raja Exclusive SLA | Service Level Agreement with tailor | Legal | Pending |

### 1.2 Infrastructure

| Task | Description | Owner | Status |
|------|-------------|-------|--------|
| Provision RTX 5090 instance | GPU compute for vision | DevOps | Pending |
| Install Golden Stack | Driver 570.86.16+, CUDA 12.8 | DevOps | Pending |
| Configure WSL2 | Windows Subsystem for Linux | DevOps | Pending |
| Create Vision Dockerfile | nvidia/cuda:12.8-devel-ubuntu22.04 | DevOps | Pending |
| Docker GPU passthrough | nvidia-container-toolkit | DevOps | Pending |

### 1.3 Database & Backend

| Task | Description | Owner | Status |
|------|-------------|-------|--------|
| Initialize Supabase | Create project, configure region | Backend | Pending |
| Implement 12-table schema | Execute migrations | Backend | Pending |
| Configure RLS | Row Level Security policies | Backend | Pending |
| Set up Supabase Auth | Magic link + OAuth | Backend | Pending |

### 1.4 Payments

| Task | Description | Owner | Status |
|------|-------------|-------|--------|
| Create UK Stripe account | Business verification | Finance | Pending |
| Configure webhooks | Payment events | Backend | Pending |
| Secure API keys | Environment variables | Backend | Pending |

### Phase 1 Deliverables
- [ ] Production-ready infrastructure
- [ ] Legal entities established
- [ ] Database schema deployed
- [ ] Auth system functional

---

## Phase 2: Core Technology (Weeks 5-8)

**Objective:** Build vision pipeline and user-facing application

### 2.1 Vision Pipeline

| Task | Description | Owner | Status |
|------|-------------|-------|--------|
| Implement SAM 3 segmentation | Person instance segmentation | Vision | Pending |
| Implement SAM-Body4D | 4D reconstruction from video | Vision | Pending |
| Build MHR-to-SMPL-X bridge | Mesh retargeting | Vision | Pending |
| Implement ArUco calibration | A4 paper marker detection | Vision | Pending |
| Height-based calibration | Fallback scaling method | Vision | Pending |
| Kalman filter for β | Shape parameter stabilization | Vision | Pending |
| A-pose normalization | Standardize mesh pose | Vision | Pending |
| 28-measurement extraction | SMPL-Anthropometry integration | Vision | Pending |

### 2.2 Frontend Foundation

| Task | Description | Owner | Status |
|------|-------------|-------|--------|
| Initialize Next.js project | TypeScript, Tailwind | Frontend | Pending |
| Set up Zustand store | State management slices | Frontend | Pending |
| Build UI component library | Base components | Frontend | Pending |
| Implement dual-track routing | Track A/B URL handling | Frontend | Pending |

### 2.3 Body Scanner UI

| Task | Description | Owner | Status |
|------|-------------|-------|--------|
| Camera permission flow | Request access UX | Frontend | Pending |
| WebSocket video streaming | 30fps frame transmission | Frontend | Pending |
| AR overlay component | R3F canvas over video | Frontend | Pending |
| Measurement display | Virtual tape measure | Frontend | Pending |
| Manual override interface | Edit individual values | Frontend | Pending |

### 2.4 3D Configurator

| Task | Description | Owner | Status |
|------|-------------|-------|--------|
| R3F canvas setup | frameloop="demand" | Frontend | Pending |
| GPU tier detection | detect-gpu library | Frontend | Pending |
| Tiered rendering | A/B/C quality levels | Frontend | Pending |
| GLTF model loading | Draco compression | Frontend | Pending |
| Fabric selector | Swatch grid component | Frontend | Pending |
| Style selector | Lapel, vents, buttons | Frontend | Pending |
| Dynamic material swap | Real-time texture changes | Frontend | Pending |

### Phase 2 Deliverables
- [ ] Functional vision pipeline with 28 measurements
- [ ] Body scanner UI with real-time feedback
- [ ] 3D configurator with fabric/style selection
- [ ] Dual-track routing operational

---

## Phase 3: Manual Bridge Operations (Weeks 9-12)

**Objective:** Create tools for human-in-the-loop fulfillment

### 3.1 Operator Dashboard

| Task | Description | Owner | Status |
|------|-------------|-------|--------|
| Admin authentication | Role-based access | Backend | Pending |
| Order queue view | Filter by state | Frontend | Pending |
| Order detail view | 28 measurements display | Frontend | Pending |
| State transition controls | Valid next states | Frontend | Pending |
| Pattern file upload | PDF/DXF storage | Backend | Pending |
| Measurement export | Optitex format | Backend | Pending |

### 3.2 Runner Mobile App

| Task | Description | Owner | Status |
|------|-------------|-------|--------|
| PWA shell | Offline-capable | Mobile | Pending |
| Runner authentication | Login flow | Backend | Pending |
| Task list view | Filtered by state | Mobile | Pending |
| Ruler Test module | 10cm validation | Mobile | Pending |
| Photo upload | Fabric reservation | Mobile | Pending |
| Delivery confirmation | Signature capture | Mobile | Pending |

### 3.3 Checkout Flow

| Task | Description | Owner | Status |
|------|-------------|-------|--------|
| Cart management | Add/remove items | Frontend | Pending |
| Stripe Elements | Card input | Frontend | Pending |
| Payment Intent API | Server-side creation | Backend | Pending |
| Webhook handler | payment_intent.succeeded | Backend | Pending |
| Confirmation page | Order number, receipt | Frontend | Pending |

### 3.4 Wedding Track B

| Task | Description | Owner | Status |
|------|-------------|-------|--------|
| Event creation flow | Name, date validation | Frontend | Pending |
| Template designer | Per-role configuration | Frontend | Pending |
| Invite generation | Token URL creation | Backend | Pending |
| Attendee dashboard | Progress tracking | Frontend | Pending |
| Batch payment | Multiple attendee charge | Backend | Pending |
| Locked template view | Read-only configurator | Frontend | Pending |

### Phase 3 Deliverables
- [ ] Operator dashboard for manual pattern generation
- [ ] Runner mobile app with Ruler Test
- [ ] Complete checkout flow with Stripe
- [ ] Full Track B wedding functionality

---

## Phase 4: Integration & Polish (Weeks 13-16)

**Objective:** Integrate all systems and prepare for launch

### 4.1 Voice Integration (Nice-to-Have)

| Task | Description | Owner | Status |
|------|-------------|-------|--------|
| Vapi.ai setup | Account, assistant config | Voice | Pending |
| Telemetry API | Vision status endpoint | Backend | Pending |
| State-driven dialogue | Contextual responses | Voice | Pending |
| Vapi Web SDK | Browser integration | Frontend | Pending |

### 4.2 Advanced Visualizations

| Task | Description | Owner | Status |
|------|-------------|-------|--------|
| Exploded View animation | Layer separation | Frontend | Pending |
| Lining Flash animation | Panel rotation reveal | Frontend | Pending |
| Pose controls | Standing/Walking/Sitting | Frontend | Pending |

### 4.3 Testing

| Task | Description | Owner | Status |
|------|-------------|-------|--------|
| Jest configuration | Unit test framework | QA | Pending |
| Frontend unit tests | 80% coverage target | QA | Pending |
| Backend unit tests | API endpoint coverage | QA | Pending |
| Playwright setup | E2E framework | QA | Pending |
| Track A E2E test | Full customer journey | QA | Pending |
| Track B E2E test | Organizer + attendee | QA | Pending |
| Security audit | OWASP checklist | Security | Pending |
| Performance optimization | Lighthouse score > 90 | Frontend | Pending |

### 4.4 Documentation

| Task | Description | Owner | Status |
|------|-------------|-------|--------|
| API documentation | OpenAPI spec | Backend | Pending |
| Operator training | Manual bridge guide | Ops | Pending |
| Runner training | Mobile app guide | Ops | Pending |
| Customer support scripts | FAQ responses | Support | Pending |

### Phase 4 Deliverables
- [ ] Voice-guided scanning (optional)
- [ ] Advanced 3D animations
- [ ] Comprehensive test coverage
- [ ] Complete documentation

---

## Phase 5: Launch & Validation (Weeks 17+)

**Objective:** Validate business model with real customers

### 5.1 Soft Launch

| Task | Description | Owner | Status |
|------|-------------|-------|--------|
| Deploy to production | Vercel + GPU instance | DevOps | Pending |
| Beta customer onboarding | 10-20 Track A customers | Marketing | Pending |
| Wedding party pilot | 1 complete Track B event | Marketing | Pending |
| Manual bridge monitoring | Operator workflow | Ops | Pending |
| Fit feedback collection | Post-delivery survey | Support | Pending |

### 5.2 Iteration

| Task | Description | Owner | Status |
|------|-------------|-------|--------|
| Address fit issues | Target <5% returns | Vision | Pending |
| Optimize scan success | Target >85% first-scan | Vision | Pending |
| Reduce approval-to-cut | Target <4 hours | Ops | Pending |
| Scale operations | Add operators as needed | Ops | Pending |

### 5.3 Business Validation

| Task | Description | Owner | Status |
|------|-------------|-------|--------|
| Validate unit economics | £904-1,005 net per suit | Finance | Pending |
| Document learnings | Operational playbook | Ops | Pending |
| Plan automation roadmap | Path to remove Manual Bridge | Product | Pending |

### Phase 5 Deliverables
- [ ] 50+ Track A orders processed
- [ ] 5+ wedding events completed
- [ ] <5% fit-related returns
- [ ] Validated unit economics

---

## Milestone Summary

| Milestone | Target Date | Key Deliverable |
|-----------|-------------|-----------------|
| M1: Infrastructure Ready | Week 4 | Golden Stack operational |
| M2: Vision Pipeline | Week 6 | 28 measurements extracted |
| M3: Alpha UI | Week 8 | Scanner + Configurator working |
| M4: Manual Bridge | Week 12 | Operator + Runner apps live |
| M5: Beta Launch | Week 16 | First paying customers |
| M6: Validation Complete | Week 20 | 50 orders, <5% returns |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Blackwell GPU availability | Medium | High | Pre-order hardware, cloud fallback |
| Measurement accuracy | Medium | Critical | Extensive calibration testing |
| Raja capacity | Low | High | Backup tailor agreements |
| Stripe approval delays | Low | Medium | Start process early |
| Legal entity delays (India) | Medium | Medium | Engage local counsel |

---

## Resource Requirements

### Team

| Role | Count | Phase |
|------|-------|-------|
| Full-Stack Developer | 2 | All |
| Vision/ML Engineer | 1 | P2-P4 |
| DevOps Engineer | 1 | P1, P5 |
| QA Engineer | 1 | P3-P5 |
| UI/UX Designer | 1 | P2-P3 |
| Operator (India) | 1-2 | P3+ |
| Runner (India) | 1-2 | P3+ |

### Infrastructure

| Resource | Monthly Cost | Phase |
|----------|--------------|-------|
| RTX 5090 Instance | $500-1000 | P2+ |
| Supabase Pro | $25 | All |
| Vercel Pro | $20 | All |
| Stripe | 2.9% + £0.20/tx | P3+ |
| Vapi.ai | Usage-based | P4+ |

---

*End of Roadmap Document*
