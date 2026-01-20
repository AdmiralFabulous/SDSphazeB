# SUIT AI v4.b - Product Requirements Document
## Camera-Based Digital Tailoring System: "Pixel-to-Pattern" Platform

> **Document Version:** 1.0  
> **Date:** 2026-01-19  
> **Status:** Ready for Implementation

---

## 1. Executive Vision

### Mission Statement
Engineer the definitive "Pixel-to-Pattern" platform that democratizes bespoke tailoring by converging advanced computer vision with traditional craftsmanship, enabling anyone with a standard webcam to acquire sub-centimeter accurate body measurements and trigger production of a made-to-measure suit at £1,500.

### Core Philosophy: The Manual Bridge Doctrine
The MVP implements a "Wizard of Oz" strategy—presenting a flawless AI-driven digital experience to customers while backend fulfillment relies on skilled human operators using Optitex PDS software and Raja Exclusive Tailors (established 1957) in Amritsar, India.

### Business Model

| Metric | Track A (Retail) | Track B (Wedding) |
|--------|------------------|-------------------|
| Gross Sale | £1,500 | £1,500 |
| Stripe Fee | (£30.20) | (£30.20) |
| Wedding Commission | £0 | (£150) |
| Manufacturing (Raja) | (£81) | (£81) |
| Supporting Costs | (£64) | (£64) |
| **Net Retained** | **£1,004.72** | **£904.01** |

---

## 2. User Personas

### Persona 1: Alex - The Style-Conscious Professional (Track A)
- **Demographics:** 32, Marketing Director, London
- **Pain Points:** Off-the-rack suits never fit right; traditional tailors are intimidating and expensive
- **Goals:** A perfectly fitted suit without the hassle of multiple fittings
- **Journey:** Anonymous browsing → Body scan → Configure suit → Checkout → Delivery

### Persona 2: James - The Wedding Organizer (Track B)
- **Demographics:** 28, Best Man, organizing groomsmen suits
- **Pain Points:** Coordinating 6+ people for measurements across different locations
- **Goals:** Unified look for wedding party without logistical nightmares
- **Journey:** Create event → Design templates → Invite attendees → Batch payment → Monitor completion

### Persona 3: Tom - The Wedding Attendee (Track B)
- **Demographics:** 30, Groomsman, invited via link
- **Pain Points:** No time to visit a tailor; wants to help with minimal effort
- **Goals:** Provide measurements quickly from home
- **Journey:** Click invite link → View locked template → Complete body scan → Confirm measurements

### Persona 4: Sarah - The Operator (Internal)
- **Demographics:** Operations specialist, remote UK
- **Pain Points:** Manual transcription errors; tracking order status
- **Goals:** Efficient order processing with clear visibility
- **Journey:** Monitor queue → Extract measurements → Generate patterns in Optitex → Update state

### Persona 5: Priya - The Runner (Internal)
- **Demographics:** Field logistics, Amritsar
- **Pain Points:** Print quality issues; fabric availability
- **Goals:** Zero defective deliveries to Raja
- **Journey:** Collect prints → Ruler test → Reserve fabric → Deliver to tailor

---

## 3. Feature List

### 3.1 MUST-HAVE (MVP)

| ID | Feature | Priority | Rationale |
|----|---------|----------|-----------|
| F-001 | Anonymous Session Management | P0 | Enables "design before login" journey |
| F-002 | 3D Body Scanning (SMPL-X) | P0 | Core value proposition |
| F-003 | ArUco/Height Calibration | P0 | Metric accuracy requirement |
| F-004 | 28-Measurement Extraction | P0 | Manufacturing requirement |
| F-005 | 3D Suit Configurator (R3F) | P0 | Customer visualization |
| F-006 | Fabric Selection (5 fabrics) | P0 | MVP product range |
| F-007 | Style Customization | P0 | Bespoke value |
| F-008 | Track A Checkout (Stripe) | P0 | Revenue capture |
| F-009 | Track B Event Management | P0 | Wedding market |
| F-010 | Track B Invite System | P0 | Attendee onboarding |
| F-011 | Locked Template Logic | P0 | Track B requirement |
| F-012 | Operator Admin Dashboard | P0 | Manual Bridge |
| F-013 | Runner Mobile App | P0 | QA workflow |
| F-014 | Ruler Test Validation | P0 | Critical QC gate |
| F-015 | Order State Machine (S01-S19) | P0 | Production tracking |
| F-016 | 10cm Calibration Square | P0 | Print validation |

### 3.2 NICE-TO-HAVE (Post-MVP)

| ID | Feature | Priority | Rationale |
|----|---------|----------|-----------|
| F-017 | Voice Scan Director (Vapi.ai) | P1 | UX enhancement |
| F-018 | Exploded View Animation | P1 | Trust building |
| F-019 | Lining Flash Animation | P1 | Trust building |
| F-020 | DiffCloth Physics Simulation | P1 | Fit visualization |
| F-021 | Headless Seamly2D Integration | P2 | Automation |
| F-022 | AI Pattern Generation (Qwen) | P2 | Full automation |
| F-023 | UI-TARS Optitex Automation | P2 | Operator replacement |
| F-024 | Multi-language Support | P2 | Market expansion |
| F-025 | Female Body Support | P2 | Market expansion |

---

## 4. Technical Constraints

| Constraint | Description | Impact |
|------------|-------------|--------|
| **Blackwell Schism** | RTX 5090 (sm_120) requires CUDA 12.8 + PyTorch Nightly | Mandatory Golden Stack |
| **Manual Bridge** | MVP simulates automation; manual backend | All features must support dual reality |
| **MHR-to-SMPL-X** | SAM-Body4D outputs MHR; manufacturing needs SMPL-X | Retargeting bridge required |
| **Dual-Entity** | UK sales + India manufacturing | Cross-border compliance |
| **Trust the Paper** | Sacrificial cut protocol | Ruler test is critical QA |

---

## 5. Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Measurement Accuracy | < 1cm deviation | QC vs tape measure |
| Fit-Related Returns | < 5% | Return tracking |
| First-Scan Success | > 85% | Analytics |
| Approval-to-Cut | < 4 hours | State timestamps |
| S19 QA Variance | < 3mm | Physical vs AI delta |
| Material Yield | ≥ 85% | Deepnest reports |
| Beta Validation | 50 Track A + 5 weddings | Order count |

---

## 6. User Journey Maps

### 6.1 Track A: Retail Customer Journey

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Landing   │───▶│ Configurator│───▶│  Body Scan  │───▶│  Checkout   │
│   Page      │    │   (3D)      │    │  (Camera)   │    │  (Stripe)   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                  │                  │                  │
      ▼                  ▼                  ▼                  ▼
 Anonymous         Select Fabric      30-sec Scan        Create Account
  Session          Select Style       28 Measurements     Payment
                   Preview 3D         Review/Edit         Confirmation
```

### 6.2 Track B: Wedding Organizer Journey

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Create     │───▶│  Design     │───▶│   Invite    │───▶│   Batch     │
│  Event      │    │  Templates  │    │  Attendees  │    │  Payment    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                  │                  │                  │
      ▼                  ▼                  ▼                  ▼
 Set Date           Per-Role Design    Generate Links     Pay Upfront
 (min 4 weeks)      Lock Templates     Track Status       Monitor Orders
```

### 6.3 Track B: Wedding Attendee Journey

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Receive   │───▶│    View     │───▶│  Body Scan  │───▶│   Confirm   │
│   Invite    │    │  Template   │    │  (Camera)   │    │   Done      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                  │                  │                  │
      ▼                  ▼                  ▼                  ▼
 Click Link         See Locked         Complete Scan      Notify Organizer
 No Account Needed  Design (Read-Only) Submit Measurements Order Queued
```

---

## 7. Acceptance Criteria Summary

### F-002: 3D Body Scanning
- **Given** a user with webcam access
- **When** they complete a 360° rotation scan
- **Then** system extracts 28 measurements within ±1cm accuracy

### F-008: Track A Checkout
- **Given** a configured suit and confirmed measurements
- **When** user completes Stripe payment
- **Then** order enters S01 state and operator dashboard shows new order

### F-011: Locked Template Logic
- **Given** an attendee visiting via invite link
- **When** they view the configurator
- **Then** all style options are disabled and show organizer's selection

### F-014: Ruler Test Validation
- **Given** a printed pattern with 10cm calibration square
- **When** runner measures the square
- **Then** only values 9.9-10.1cm pass; outside range triggers PRINT_REJECTED state

---

*End of PRD*
