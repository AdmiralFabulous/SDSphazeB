# SUIT AI v4.b - Database Schema
## Supabase PostgreSQL Design

> **Document Version:** 1.0  
> **Date:** 2026-01-19

---

## 1. Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │       │    sessions     │       │  measurements   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)         │──┐    │ id (PK)         │
│ email           │  │    │ user_id (FK)────│──┘    │ session_id (FK) │──┐
│ phone           │  │    │ created_at      │       │ chest_girth     │  │
│ stripe_id       │  │    │ expires_at      │       │ waist_girth     │  │
│ created_at      │  │    └─────────────────┘       │ hip_girth       │  │
└─────────────────┘  │                              │ ... (28 fields) │  │
         │           │    ┌─────────────────┐       │ user_overrides  │  │
         │           │    │    fabrics      │       │ smplx_beta      │  │
         │           │    ├─────────────────┤       └─────────────────┘  │
         │           │    │ id (PK)         │                │           │
         │           │    │ name            │                │           │
         │           │    │ code            │                │           │
         │           │    │ price_modifier  │                │           │
         │           │    │ texture_url     │                │           │
         │           │    │ in_stock        │                │           │
         │           │    │ properties      │                │           │
         │           │    └─────────────────┘                │           │
         │           │             │                         │           │
         │           │             │                         │           │
         │           │    ┌────────▼────────┐                │           │
         │           │    │  suit_configs   │                │           │
         │           │    ├─────────────────┤                │           │
         │           └───▶│ id (PK)         │                │           │
         │                │ session_id (FK) │◀───────────────┘           │
         │                │ fabric_id (FK)  │                            │
         │                │ style_json      │                            │
         │                │ is_template     │                            │
         │                └─────────────────┘                            │
         │                         │                                     │
         │                         │                                     │
┌────────▼────────┐       ┌────────▼────────┐       ┌─────────────────┐ │
│ wedding_events  │       │wedding_templates│       │wedding_attendees│ │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤ │
│ id (PK)         │──┐    │ id (PK)         │──┐    │ id (PK)         │ │
│ organizer_id(FK)│  │    │ event_id (FK)───│──┘    │ event_id (FK)   │ │
│ event_name      │  │    │ role            │       │ template_id (FK)│ │
│ event_date      │  │    │ suit_config_id  │       │ email           │ │
│ status          │  │    └─────────────────┘       │ invite_token    │ │
└─────────────────┘  │                              │ status          │ │
         │           │                              │ measurement_id  │◀┘
         │           │                              └─────────────────┘
         │           │
         │           │    ┌─────────────────┐       ┌─────────────────┐
         │           │    │     orders      │       │   order_items   │
         │           │    ├─────────────────┤       ├─────────────────┤
         │           └───▶│ id (PK)         │──┐    │ id (PK)         │
         └───────────────▶│ user_id (FK)    │  │    │ order_id (FK)───│──┐
                          │ track_type      │  │    │ suit_config_id  │  │
                          │ wedding_event_id│  │    │ measurement_id  │  │
                          │ stripe_intent   │  │    │ price           │  │
                          │ current_state   │  │    │ status          │  │
                          │ total_amount    │  │    └─────────────────┘  │
                          └─────────────────┘  │                         │
                                   │           │                         │
                          ┌────────▼────────┐  │    ┌─────────────────┐  │
                          │order_state_     │  │    │  pattern_files  │  │
                          │history          │  │    ├─────────────────┤  │
                          ├─────────────────┤  │    │ id (PK)         │  │
                          │ id (PK)         │  │    │ order_item_id───│──┘
                          │ order_id (FK)───│──┘    │ file_type       │
                          │ from_state      │       │ file_url        │
                          │ to_state        │       │ calibration_ok  │
                          │ changed_by      │       └─────────────────┘
                          │ notes           │
                          └─────────────────┘
```

---

## 2. Table Definitions

### 2.1 users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    stripe_customer_id VARCHAR(255),
    full_name VARCHAR(255),
    shipping_address JSONB,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'operator', 'runner', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe ON users(stripe_customer_id);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own data" ON users
    FOR ALL USING (auth.uid() = id);
```

### 2.2 sessions

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    metadata JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Session access" ON sessions
    FOR ALL USING (
        id::text = current_setting('app.session_id', true) 
        OR user_id = auth.uid()
    );
```

### 2.3 measurements

```sql
CREATE TABLE measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    
    -- 28 Measurement Fields (all in mm)
    chest_girth DECIMAL(5,1),
    waist_girth DECIMAL(5,1),
    hip_girth DECIMAL(5,1),
    shoulder_width DECIMAL(5,1),
    back_width DECIMAL(5,1),
    chest_width DECIMAL(5,1),
    neck_girth DECIMAL(5,1),
    bicep_girth DECIMAL(5,1),
    wrist_girth DECIMAL(5,1),
    sleeve_length DECIMAL(5,1),
    arm_length DECIMAL(5,1),
    back_length DECIMAL(5,1),
    front_length DECIMAL(5,1),
    jacket_length DECIMAL(5,1),
    thigh_girth DECIMAL(5,1),
    knee_girth DECIMAL(5,1),
    calf_girth DECIMAL(5,1),
    ankle_girth DECIMAL(5,1),
    inseam DECIMAL(5,1),
    outseam DECIMAL(5,1),
    crotch_depth DECIMAL(5,1),
    rise DECIMAL(5,1),
    trouser_length DECIMAL(5,1),
    shoulder_slope DECIMAL(4,2),  -- degrees
    posture_angle DECIMAL(4,2),   -- degrees
    arm_hole_depth DECIMAL(5,1),
    seat_depth DECIMAL(5,1),
    height DECIMAL(5,1),
    
    -- Metadata
    user_overrides JSONB DEFAULT '{}',  -- Manual corrections
    smplx_beta JSONB,                    -- 10-dim shape params
    calibration_method VARCHAR(20) CHECK (calibration_method IN ('height', 'aruco', 'hybrid')),
    scale_factor DECIMAL(10,6),
    confidence_score DECIMAL(3,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_measurements_session ON measurements(session_id);
```

### 2.4 fabrics

```sql
CREATE TABLE fabrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    price_modifier DECIMAL(10,2) DEFAULT 0,
    texture_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    in_stock BOOLEAN DEFAULT true,
    properties JSONB DEFAULT '{}',  -- weight, composition, care instructions
    supplier VARCHAR(255) DEFAULT 'Raymond',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial fabrics
INSERT INTO fabrics (name, code, price_modifier, properties) VALUES
    ('Navy Wool Blend', 'NAV-001', 0, '{"weight": "280gsm", "composition": "70% wool, 30% polyester"}'),
    ('Charcoal Grey', 'CHR-001', 0, '{"weight": "260gsm", "composition": "100% wool"}'),
    ('Black Classic', 'BLK-001', 50, '{"weight": "300gsm", "composition": "100% wool"}'),
    ('Light Grey', 'LGR-001', 0, '{"weight": "240gsm", "composition": "65% wool, 35% polyester"}'),
    ('Midnight Blue', 'MBL-001', 75, '{"weight": "280gsm", "composition": "Super 120s wool"}');
```

### 2.5 suit_configs

```sql
CREATE TABLE suit_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    fabric_id UUID REFERENCES fabrics(id),
    
    style_json JSONB NOT NULL DEFAULT '{
        "lapel": "notch",
        "vents": "double",
        "buttons": 2,
        "pocket_style": "flap",
        "lining_color": "burgundy",
        "trouser_style": "flat_front",
        "trouser_hem": "plain"
    }',
    
    is_template BOOLEAN DEFAULT false,
    locked_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_configs_session ON suit_configs(session_id);
CREATE INDEX idx_configs_template ON suit_configs(is_template) WHERE is_template = true;
```

### 2.6 wedding_events

```sql
CREATE TABLE wedding_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES users(id),
    event_name VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paid', 'completed', 'cancelled')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Event date must be at least 4 weeks in future
    CONSTRAINT event_date_future CHECK (event_date >= CURRENT_DATE + INTERVAL '28 days')
);

-- Indexes
CREATE INDEX idx_events_organizer ON wedding_events(organizer_id);
CREATE INDEX idx_events_date ON wedding_events(event_date);

-- RLS
ALTER TABLE wedding_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Organizer manages events" ON wedding_events
    FOR ALL USING (organizer_id = auth.uid());
```

### 2.7 wedding_templates

```sql
CREATE TABLE wedding_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES wedding_events(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,  -- 'groom', 'best_man', 'groomsman', etc.
    suit_config_id UUID NOT NULL REFERENCES suit_configs(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(event_id, role)
);

-- Indexes
CREATE INDEX idx_templates_event ON wedding_templates(event_id);
```

### 2.8 wedding_attendees

```sql
CREATE TABLE wedding_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES wedding_events(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES wedding_templates(id),
    
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    invite_token UUID UNIQUE DEFAULT gen_random_uuid(),
    
    status VARCHAR(20) DEFAULT 'invited' CHECK (status IN ('invited', 'viewed', 'scanning', 'confirmed', 'ordered')),
    measurement_id UUID REFERENCES measurements(id),
    
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    
    UNIQUE(event_id, email)
);

-- Indexes
CREATE INDEX idx_attendees_event ON wedding_attendees(event_id);
CREATE INDEX idx_attendees_token ON wedding_attendees(invite_token);
CREATE INDEX idx_attendees_email ON wedding_attendees(email);
```

### 2.9 orders

```sql
CREATE TYPE order_state AS ENUM (
    'S01_PAID',
    'S02_SCAN_RECEIVED',
    'S03_MEASUREMENTS_CONFIRMED',
    'S04_PENDING_PATTERN',
    'S05_PATTERN_GENERATED',
    'S06_SENT_TO_PRINTER',
    'S07_PRINT_COLLECTED',
    'S08_PRINT_REJECTED',
    'S09_DELIVERED_TO_RAJA',
    'S10_CUTTING',
    'S11_SEWING',
    'S12_READY_FOR_QC',
    'S13_QC_PASS',
    'S14_QC_FAIL',
    'S15_COLLECTED_FROM_RAJA',
    'S16_PACKAGED',
    'S17_SHIPPED',
    'S18_DELIVERED',
    'S19_COMPLETE'
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    
    track_type CHAR(1) NOT NULL CHECK (track_type IN ('A', 'B')),
    wedding_event_id UUID REFERENCES wedding_events(id),
    
    stripe_payment_intent VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    
    current_state order_state DEFAULT 'S01_PAID',
    total_amount DECIMAL(10,2) NOT NULL,
    currency CHAR(3) DEFAULT 'GBP',
    
    shipping_address JSONB,
    tracking_number VARCHAR(255),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Track B orders must have wedding_event_id
    CONSTRAINT track_b_requires_event CHECK (
        track_type = 'A' OR wedding_event_id IS NOT NULL
    )
);

-- Indexes
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_state ON orders(current_state);
CREATE INDEX idx_orders_event ON orders(wedding_event_id);
CREATE INDEX idx_orders_stripe ON orders(stripe_payment_intent);
```

### 2.10 order_items

```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    suit_config_id UUID NOT NULL REFERENCES suit_configs(id),
    measurement_id UUID NOT NULL REFERENCES measurements(id),
    
    price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    
    -- For Track B, link to attendee
    attendee_id UUID REFERENCES wedding_attendees(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_items_order ON order_items(order_id);
CREATE INDEX idx_items_attendee ON order_items(attendee_id);
```

### 2.11 order_state_history

```sql
CREATE TABLE order_state_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    from_state order_state,
    to_state order_state NOT NULL,
    
    changed_by UUID REFERENCES users(id),
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_history_order ON order_state_history(order_id);
CREATE INDEX idx_history_created ON order_state_history(created_at);
```

### 2.12 pattern_files

```sql
CREATE TABLE pattern_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    
    file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('pdf', 'dxf', 'tech_pack')),
    file_url VARCHAR(500) NOT NULL,
    file_hash VARCHAR(64),  -- SHA-256 for integrity
    
    calibration_verified BOOLEAN DEFAULT false,
    calibration_value DECIMAL(4,2),  -- Measured 10cm square value
    
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_patterns_item ON pattern_files(order_item_id);
```

---

## 3. Database Functions

### 3.1 State Transition Validator

```sql
CREATE OR REPLACE FUNCTION validate_state_transition(
    current order_state,
    next order_state
) RETURNS BOOLEAN AS $$
DECLARE
    valid_transitions JSONB := '{
        "S01_PAID": ["S02_SCAN_RECEIVED", "S03_MEASUREMENTS_CONFIRMED"],
        "S02_SCAN_RECEIVED": ["S03_MEASUREMENTS_CONFIRMED"],
        "S03_MEASUREMENTS_CONFIRMED": ["S04_PENDING_PATTERN"],
        "S04_PENDING_PATTERN": ["S05_PATTERN_GENERATED"],
        "S05_PATTERN_GENERATED": ["S06_SENT_TO_PRINTER"],
        "S06_SENT_TO_PRINTER": ["S07_PRINT_COLLECTED", "S08_PRINT_REJECTED"],
        "S07_PRINT_COLLECTED": ["S09_DELIVERED_TO_RAJA"],
        "S08_PRINT_REJECTED": ["S06_SENT_TO_PRINTER"],
        "S09_DELIVERED_TO_RAJA": ["S10_CUTTING"],
        "S10_CUTTING": ["S11_SEWING"],
        "S11_SEWING": ["S12_READY_FOR_QC"],
        "S12_READY_FOR_QC": ["S13_QC_PASS", "S14_QC_FAIL"],
        "S13_QC_PASS": ["S15_COLLECTED_FROM_RAJA"],
        "S14_QC_FAIL": ["S11_SEWING"],
        "S15_COLLECTED_FROM_RAJA": ["S16_PACKAGED"],
        "S16_PACKAGED": ["S17_SHIPPED"],
        "S17_SHIPPED": ["S18_DELIVERED"],
        "S18_DELIVERED": ["S19_COMPLETE"]
    }'::JSONB;
BEGIN
    RETURN valid_transitions->current::text ? next::text;
END;
$$ LANGUAGE plpgsql;
```

### 3.2 Transition Order State

```sql
CREATE OR REPLACE FUNCTION transition_order_state(
    p_order_id UUID,
    p_new_state order_state,
    p_changed_by UUID,
    p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_current_state order_state;
BEGIN
    -- Get current state
    SELECT current_state INTO v_current_state
    FROM orders WHERE id = p_order_id;
    
    -- Validate transition
    IF NOT validate_state_transition(v_current_state, p_new_state) THEN
        RAISE EXCEPTION 'Invalid state transition from % to %', v_current_state, p_new_state;
    END IF;
    
    -- Update order
    UPDATE orders 
    SET current_state = p_new_state, updated_at = NOW()
    WHERE id = p_order_id;
    
    -- Log history
    INSERT INTO order_state_history (order_id, from_state, to_state, changed_by, notes)
    VALUES (p_order_id, v_current_state, p_new_state, p_changed_by, p_notes);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

### 3.3 Claim Session

```sql
CREATE OR REPLACE FUNCTION claim_session(
    p_session_id UUID,
    p_user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    -- Update session
    UPDATE sessions 
    SET user_id = p_user_id
    WHERE id = p_session_id AND user_id IS NULL;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;
```

---

## 4. Triggers

### 4.1 Auto-Update Timestamps

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_timestamp
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ... repeat for other tables
```

### 4.2 Lock Template on Payment

```sql
CREATE OR REPLACE FUNCTION lock_template_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.track_type = 'B' AND NEW.current_state = 'S01_PAID' THEN
        UPDATE suit_configs
        SET is_template = true, locked_at = NOW()
        WHERE id IN (
            SELECT suit_config_id FROM wedding_templates
            WHERE event_id = NEW.wedding_event_id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lock_templates_trigger
    AFTER INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION lock_template_on_payment();
```

---

## 5. Views

### 5.1 Order Queue View

```sql
CREATE VIEW v_order_queue AS
SELECT 
    o.id,
    o.current_state,
    o.track_type,
    o.total_amount,
    o.created_at,
    u.email as customer_email,
    u.full_name as customer_name,
    COUNT(oi.id) as item_count,
    we.event_name
FROM orders o
JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN wedding_events we ON o.wedding_event_id = we.id
GROUP BY o.id, u.email, u.full_name, we.event_name
ORDER BY o.created_at DESC;
```

### 5.2 Wedding Status View

```sql
CREATE VIEW v_wedding_status AS
SELECT 
    we.id as event_id,
    we.event_name,
    we.event_date,
    we.status,
    COUNT(wa.id) as total_attendees,
    COUNT(wa.id) FILTER (WHERE wa.status = 'confirmed') as confirmed_count,
    COUNT(wa.id) FILTER (WHERE wa.status = 'ordered') as ordered_count
FROM wedding_events we
LEFT JOIN wedding_attendees wa ON we.id = wa.event_id
GROUP BY we.id;
```

---

*End of Database Schema Document*
