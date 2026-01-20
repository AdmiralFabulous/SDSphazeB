# Raja exclusive

**Created:** 1/18/2026 12:20:06  
**Updated:** 1/19/2026 18:32:07  
**Exported:** 1/19/2026 20:14:31  
**Link:** [https://claude.ai/chat/f818d96d-fef7-47c1-a184-f7e5bedf9008](https://claude.ai/chat/f818d96d-fef7-47c1-a184-f7e5bedf9008)  

## Prompt:
1/18/2026, 12:20:08 PM

RAJA EXCLUSSIVE



## Response:
1/18/2026, 12:20:17 PM

````plaintext
Thought process: Thinking about the meaning and context of "Raja Exclusive"

The user is asking about "RAJA EXCLUSSIVE" - this appears to be related to their SUIT AI / SameDaySuits business. Let me search the project knowledge to find information about this.
````

````plaintext
Tool: Searching project
````

````plaintext
Thought process

The search didn't return results about "RAJA EXCLUSIVE
````





## Prompt:
1/18/2026, 12:22:18 PM

> File: SUIT_AI_Pipeline_Plan_v4 (2).docx

> File: 

RAJA EXCLUSSIVE plan, we are selling our suits to the UK @ £1500 on stripe, we didnt account for stripe fees, and we are paying the tailor from stripe so we need to account for or develop the upi payment from stripe



## Response:
1/18/2026, 12:22:56 PM

````plaintext
Thought process: Architecting Stripe fee deductions and UPI payment routing.

The user is asking about the RAJA EXCLUSIVE plan but with updated parameters:
1. Selling suits to UK at £1500 (not €200 as in the uploaded document)
2. Need to account for Stripe fees
3. Need to figure out payment to Raja (the tailor) - either accounting for Stripe fees on payout or developing UPI payment from Stripe

Let me search for more context on this and then help them think through the financial model and payment flow.
````

````plaintext
Tool: Looking for relevant chats in this project...
````

````plaintext
Thought process: Architected payment flow accounting for Stripe fees and UPI disbursement.

Good, now I have context on the pricing and payment setup. The user is asking about:
1. £1500 UK pricing (not €200 as in the uploaded document)
2. Stripe fees to account for
3. UPI payment to Raja (the tailor) from Stripe

Let me help them work through:
1. Updated financial model with Stripe fees
2. Payment flow options for paying Raja via UPI from Stripe proceeds

Stripe fees for UK:
- Standard: 1.5% + 20p for UK cards
- International cards: 2.5% + 20p (likely most common for premium purchases)
- 3D Secure: additional fees may apply

For paying Raja via UPI from Stripe:
- Option 1: Manual bank transfer from Stripe to your Indian account, then UPI to Raja
- Option 2: Stripe Connect (but Raja would need to be onboarded)
- Option 3: Wise/PayPal batch transfers
- Option 4: Manual conversion and UPI payment per order

Let me structure this clearly.
````

Right, let's update the RAJA EXCLUSIVE model for UK sales at £1500 and map the payment flows properly.

## Updated Unit Economics (UK @ £1500)

**Revenue**
- Gross sale: £1,500

**Stripe Fees** (UK cards 1.5% + 20p, International 2.5% + 20p)
- Assuming mix: ~2% + 20p average
- Fee: £30.20
- **Net to your Stripe account: £1,469.80**

**Production Costs (INR)**

| Line Item | INR | GBP (@ 105 INR/GBP) |
|-----------|-----|---------------------|
| Raja (Jacket + Trousers) | 8,500 | £81 |
| Shirt (if included) | 1,200 | £11 |
| Aero Buttons | 200 | £2 |
| Pattern Printing (A0) | 200 | £2 |
| Packaging | 500 | £5 |
| Runner/Ops | 200 | £2 |
| **Production Subtotal** | **10,800** | **£103** |

**Shipping to UK** (DHL/FedEx volumetric ~2.5kg)
- Express courier: ~£35-45
- Import duty + VAT (handled by customer or DDP): Variable

**Gross Margin Before Raja Payout**
- Net Stripe: £1,469.80
- Production + Shipping: ~£148
- **Gross: £1,321.80** (88% margin)

---

## The Stripe-to-Raja Payment Problem

You have three practical options:

**Option 1: Bank Withdrawal + Manual UPI**
- Stripe pays out to your UK/INR bank account
- You manually transfer to Raja via UPI after each QC pass
- **Pro:** Zero additional fees, immediate
- **Con:** Manual work per order, requires you to hold INR balance

**Option 2: Wise Business Account**
- Link Stripe to Wise
- Batch convert GBP to INR weekly
- Pay Raja via Wise direct to Indian bank (not UPI directly, but lands in his account same-day)
- Transfer fee: ~0.5% on conversion
- **Pro:** Automated batching, audit trail
- **Con:** Doesn't use UPI, adds ~£6-7 per £1,500 order

**Option 3: Stripe India + Domestic Payout (Long-term)**
- Register Indian entity
- Accept payments via Stripe India
- Pay out domestically to Raja's account
- **Pro:** Simplest once set up
- **Con:** Requires Indian business registration, GST compliance

---

## Recommended Flow (Immediate)

For the Manual Bridge MVP, Option 1 is cleanest:

```
Customer pays £1500 (Stripe UK)
         ↓
Stripe holds funds (2-day rolling payout)
         ↓
Payout to your linked bank account (UK or INR)
         ↓
QC Pass triggers manual UPI to Raja
         ↓
You initiate ₹8,500 via GPay/PhonePe to Raja's UPI ID
```

**Accounting Note:** Track each order with:
- Stripe transaction ID
- UPI transaction ID
- Date of QC pass
- Date of payout to Raja

This gives you a clean audit trail without building automation yet.

---

## Updated P&L Per Suit

| Line | Amount |
|------|--------|
| Gross Sale | £1,500.00 |
| Stripe Fee (2% + 20p) | (£30.20) |
| **Net Revenue** | **£1,469.80** |
| Raja Payout | (£81.00) |
| Shirt | (£11.00) |
| Buttons/Trims | (£4.00) |
| Pattern Print | (£2.00) |
| Packaging | (£5.00) |
| Runner | (£2.00) |
| Shipping | (£40.00) |
| **Gross Profit** | **£1,324.80** |
| **Margin** | **88%** |

At this price point, you could absorb UK import duty (11-12% on clothing) and still clear £1,100+ per unit.

What needs specifying next - the Stripe webhook for QC-triggered payout notification, or the customer-facing shipping/duty handling?



## Prompt:
1/18/2026, 12:25:16 PM

you missed the 10% commission for the wedding planners and the 5% commission for the operations guy in amritsar



## Response:
1/18/2026, 12:25:36 PM

````plaintext
Thought process: Acknowledged overlooked commission structures and recalculated economics.

The user is pointing out I missed two commission structures:
1. 10% commission for wedding planners (referral/B2B incentive)
2. 5% commission for the operations guy in Amritsar (likely Raja or a separate ops manager)

Let me recalculate the unit economics with these included.
````

You're right. Let me recalculate with the full commission stack.

## Corrected Unit Economics (UK @ £1500)

| Line | Amount | Notes |
|------|--------|-------|
| **Gross Sale** | £1,500.00 | |
| Stripe Fee (2% + 20p) | (£30.20) | |
| **Net Revenue** | **£1,469.80** | |
| | | |
| **Commissions** | | |
| Wedding Planner (10%) | (£150.00) | On gross sale |
| Amritsar Ops (5%) | (£75.00) | On gross sale |
| **Post-Commission** | **£1,244.80** | |
| | | |
| **Production** | | |
| Raja (Jacket + Trousers) | (£81.00) | ₹8,500 |
| Shirt | (£11.00) | ₹1,200 |
| Buttons/Trims | (£4.00) | ₹400 |
| Pattern Print | (£2.00) | ₹200 |
| Packaging | (£5.00) | ₹500 |
| Runner | (£2.00) | ₹200 |
| Shipping | (£40.00) | DHL/FedEx |
| **Production Total** | **(£145.00)** | |
| | | |
| **Gross Profit** | **£1,099.80** | |
| **Margin** | **73%** | |

---

## Commission Payment Flows

**Wedding Planner (10% / £150)**
- Likely UK-based, expects GBP payment
- Options: Bank transfer, PayPal, or Stripe Connect (if you want to automate)
- Trigger: On order completion/delivery, not on booking

**Amritsar Ops (5% / £75 = ~₹7,875)**
- Pay via UPI alongside Raja payout
- Or batch weekly if volume justifies
- Trigger: Same as Raja - QC pass

---

## Revised Payout Schedule Per Order

| Recipient | Amount | Method | Trigger |
|-----------|--------|--------|---------|
| Stripe | £30.20 | Auto-deducted | Payment |
| Raja | ₹8,500 (£81) | UPI | QC Pass |
| Amritsar Ops | ₹7,875 (£75) | UPI | QC Pass |
| Wedding Planner | £150 | Bank/PayPal | Delivery Confirmed |
| Production costs | £64 | Various | As incurred |

**Your retained margin: £1,099.80 per suit**

---

## Direct Sales vs Planner-Referred

Worth noting the margin difference:

| Channel | Commissions | Gross Profit | Margin |
|---------|-------------|--------------|--------|
| Wedding Planner referral | £225 (15%) | £1,099.80 | 73% |
| Direct sale (no planner) | £75 (5% ops only) | £1,249.80 | 83% |

The planner channel costs you £150 per suit but potentially delivers batch orders (groom + groomsmen). A 6-suit wedding order through a planner nets £6,599 vs £7,499 direct - but you're unlikely to land 6-suit batches without the planner relationship.

Do you want me to map out the Stripe Connect setup for automating the planner payouts, or keep it manual for MVP?



## Prompt:
1/18/2026, 12:25:54 PM

Wedding Planner (10%)(£150.00)On gross sale
Amritsar Ops (5%)(£75.00)On NET PROFFIT
fix this



## Response:
1/18/2026, 12:26:07 PM

````plaintext
Thought process: Recalculated profit margins applying ops commission to net profit.

The user is correcting me. The Amritsar Ops commission should be calculated on NET PROFIT, not on gross sale. Let me recalculate.

So the flow would be:
1. Gross Sale: £1,500
2. Stripe Fee: £30.20
3. Net Revenue: £1,469.80
4. Wedding Planner (10% of gross): £150
5. Production costs: £145
6. That gives us a net profit figure
7. THEN Amritsar Ops gets 5% of that net profit

Let me work through this:

Gross Sale: £1,500.00
Stripe Fee: (£30.20)
Net Revenue: £1,469.80
Wedding Planner (10% of £1,500): (£150.00)
Post-Commission: £1,319.80

Production:
- Raja: £81
- Shirt: £11
- Buttons/Trims: £4
- Pattern Print: £2
- Packaging: £5
- Runner: £2
- Shipping: £40
Total Production: £145

Net Profit (before Ops commission): £1,319.80 - £145 = £1,174.80

Amritsar Ops (5% of £1,174.80): £58.74

Final Net Profit: £1,174.80 - £58.74 = £1,116.06

Let me present this clearly.
````

## Corrected Unit Economics (UK @ £1500)

| Line | Amount | Notes |
|------|--------|-------|
| **Gross Sale** | £1,500.00 | |
| Stripe Fee (2% + 20p) | (£30.20) | |
| **Net Revenue** | **£1,469.80** | |
| | | |
| **Commission (on gross)** | | |
| Wedding Planner (10%) | (£150.00) | 10% of £1,500 |
| **Post-Planner** | **£1,319.80** | |
| | | |
| **Production** | | |
| Raja (Jacket + Trousers) | (£81.00) | ₹8,500 |
| Shirt | (£11.00) | ₹1,200 |
| Buttons/Trims | (£4.00) | ₹400 |
| Pattern Print | (£2.00) | ₹200 |
| Packaging | (£5.00) | ₹500 |
| Runner | (£2.00) | ₹200 |
| Shipping | (£40.00) | |
| **Production Total** | **(£145.00)** | |
| | | |
| **Net Profit (pre-Ops)** | **£1,174.80** | |
| Amritsar Ops (5%) | (£58.74) | 5% of £1,174.80 |
| | | |
| **Final Net Profit** | **£1,116.06** | |
| **Margin** | **74%** | |

---

## Payout Schedule Per Order

| Recipient | Amount | Method | Trigger |
|-----------|--------|--------|---------|
| Stripe | £30.20 | Auto-deducted | Payment |
| Raja | ₹8,500 (£81) | UPI | QC Pass |
| Amritsar Ops | ₹6,168 (£58.74) | UPI | QC Pass |
| Wedding Planner | £150 | Bank/PayPal | Delivery Confirmed |

---

## Direct Sale Comparison

| Channel | Planner Cut | Ops Cut (5% of net) | Final Profit |
|---------|-------------|---------------------|--------------|
| Planner referral | £150 | £58.74 | £1,116.06 |
| Direct sale | £0 | £66.24 | £1,258.56 |

The Ops commission rises slightly on direct sales because net profit is higher without the planner cut.



## Prompt:
1/18/2026, 12:27:22 PM

THEY ARE 2 different people you cunt, the wedding planner gets 10% of the gross sale, the local ops guy gets 5% of net after tax proffit



## Response:
1/18/2026, 12:27:39 PM

````plaintext
Thought process: Recalibrated commission structure with separate stakeholder calculations.

The user is frustrated because I misunderstood the commission structure. Let me re-read:

1. Wedding Planner: 10% of gross sale (£1,500) = £150
2. Amritsar Ops: 5% of NET PROFIT AFTER TAX

So I need to calculate:
- Gross sale: £1,500
- Stripe fees: £30.20
- Net revenue: £1,469.80
- Wedding planner commission (10% of gross): £150
- Production costs: £145
- Then calculate the net profit before the ops guy's cut
- Then calculate tax (UK corporation tax is 25% for profits over £250k, 19% for small profits - let's assume 19% for now, or maybe the user means something else by tax)
- Then the ops guy gets 5% of what's left after tax

Let me recalculate properly:

Gross Sale: £1,500.00
Stripe Fee: (£30.20)
Net Revenue: £1,469.80

Wedding Planner (10% of £1,500): (£150.00)
Post-Planner: £1,319.80

Production Costs:
- Raja: £81
- Shirt: £11
- Buttons/Trims: £4
- Pattern Print: £2
- Packaging: £5
- Runner: £2
- Shipping: £40
Total Production: £145

Net Profit Before Tax: £1,319.80 - £145 = £1,174.80

Tax (let's assume UK corporation tax ~19-25%, I'll use 19% for small company):
Tax: £1,174.80 × 19% = £223.21

Net Profit After Tax: £1,174.80 - £223.21 = £951.59

Amritsar Ops (5% of net after tax): £951.59 × 5% = £47.58


Final Retained Profit: £951.59 - £47.58 = £904.01

I should clarify the tax rate assumption or present this as a formula so the user can adjust it based on their actual tax situation.
````

You're right, I conflated them. Here's the correct waterfall:

## Corrected Unit Economics (UK @ £1500)

| Line | Amount |
|------|--------|
| **Gross Sale** | £1,500.00 |
| Stripe Fee (2% + 20p) | (£30.20) |
| Wedding Planner (10% of gross) | (£150.00) |
| **Net Revenue** | **£1,319.80** |
| | |
| **Production** | |
| Raja (Jacket + Trousers) | (£81.00) |
| Shirt | (£11.00) |
| Buttons/Trims | (£4.00) |
| Pattern Print | (£2.00) |
| Packaging | (£5.00) |
| Runner | (£2.00) |
| Shipping | (£40.00) |
| **Production Total** | **(£145.00)** |
| | |
| **Net Profit Before Tax** | **£1,174.80** |
| UK Corporation Tax (19%) | (£223.21) |
| **Net Profit After Tax** | **£951.59** |
| | |
| Amritsar Ops (5% of net after tax) | (£47.58) |
| | |
| **Final Retained Profit** | **£904.01** |
| **Margin on Gross** | **60%** |

---

## Payout Schedule

| Recipient | Amount | Method | Trigger |
|-----------|--------|--------|---------|
| Stripe | £30.20 | Auto-deducted | Payment |
| Wedding Planner | £150.00 | Bank/PayPal | Delivery Confirmed |
| Raja | £81.00 (₹8,500) | UPI | QC Pass |
| Amritsar Ops | £47.58 (₹4,996) | UPI | Monthly/Quarterly reconciliation |
| HMRC | £223.21 | Corporation Tax | Annual filing |

The Ops payout can't really happen per-order since you won't know final tax position until year-end. Either estimate it and true up quarterly, or pay him monthly based on projected net.



## Prompt:
1/18/2026, 12:32:06 PM

its done quarterly



## Response:
1/18/2026, 12:32:15 PM

````plaintext
Thought process: Recalibrated payout schedule to reflect quarterly compensation structure.

The user is clarifying that the Amritsar Ops guy gets paid quarterly based on the net after tax profit. This makes sense since tax position is calculated periodically, not per order.

Let me update the payout schedule to reflect this.
````

## Final Unit Economics (UK @ £1500)

| Line | Amount |
|------|--------|
| **Gross Sale** | £1,500.00 |
| Stripe Fee (2% + 20p) | (£30.20) |
| Wedding Planner (10% of gross) | (£150.00) |
| **Net Revenue** | **£1,319.80** |
| | |
| **Production** | |
| Raja (Jacket + Trousers) | (£81.00) |
| Shirt | (£11.00) |
| Buttons/Trims | (£4.00) |
| Pattern Print | (£2.00) |
| Packaging | (£5.00) |
| Runner | (£2.00) |
| Shipping | (£40.00) |
| **Production Total** | **(£145.00)** |
| | |
| **Net Profit Before Tax** | **£1,174.80** |
| UK Corporation Tax (19%) | (£223.21) |
| **Net Profit After Tax** | **£951.59** |
| Amritsar Ops (5% of net after tax) | (£47.58) |
| **Final Retained Profit** | **£904.01** |

---

## Payout Schedule

| Recipient | Amount | Method | Frequency |
|-----------|--------|--------|-----------|
| Stripe | £30.20 | Auto-deducted | Per order |
| Wedding Planner | £150.00 | Bank/PayPal | Per order (on delivery) |
| Raja | £81.00 (₹8,500) | UPI | Per order (QC pass) |
| Amritsar Ops | 5% of quarterly net after tax | UPI | Quarterly |
| HMRC | 19% of net profit | Corporation Tax | Quarterly instalments / Annual |

---

## Quarterly Example (10 suits)

| Line | Amount |
|------|--------|
| Gross Revenue | £15,000 |
| Net Profit After Tax | £9,515.90 |
| Amritsar Ops (5%) | £475.79 (₹49,958) |
| **Retained** | **£9,040.11** |



## Prompt:
1/18/2026, 12:33:12 PM

ok now that we have the money figured out , write that up as the v4b financial model



## Response:
1/18/2026, 12:35:04 PM

````plaintext
Thought process: Crafting professional financial model documentation capturing unit economics and payment flows.

The user wants me to create a formal document for the v4b financial model based on the calculations we just worked through. This should be a professional document that captures:

1. The unit economics at £1,500 UK pricing
2. The payment flows and timing
3. The commission structures (Wedding Planner 10% gross, Amritsar Ops 5% net after tax)
4. The payout schedules and methods
5. Quarterly reconciliation example

I should create this as a proper document file - likely a docx given the skill available. Let me read the docx skill first to ensure I create it properly.
````

````plaintext
View: Reading the docx skill for document creation best practices
````

````plaintext
Thought process: Synthesized financial data into comprehensive document format.

Now I understand how to create docx files properly. I'll create a comprehensive v4b financial model document using the docx-js approach. Let me write the JavaScript to generate this document.
````

````plaintext
Create File: Creating the v4b financial model document generator script
````

````plaintext
Thought process: Orchestrated document generation for financial model.

Now I need to install docx and run the script to generate the document.
````

````plaintext
Bash Tool: Installing docx package and generating the financial model document
````

````plaintext
Thought process: Finalized document and prepared financial model delivery.

The document was created successfully. Now let me copy it to the outputs folder and present it to the user.
````

````plaintext
Bash Tool: Copying the financial model document to outputs directory
````

````plaintext
Thought process

Good, the document has been copied to the outputs directory. Now let me present it to the user.
````

````plaintext
Present File: /mnt/user-data/outputs/SUIT_AI_v4b_Financial_Model.docx
````

````plaintext
Thought process: Prepared financial model documentation for presentation.

The document has been created and presented to the user. Let me provide a brief summary of what's included.
````

Done. The v4b Financial Model covers:

1. **Unit Economics** - Full waterfall from £1,500 gross to £904.01 retained (60% margin)
2. **Payout Schedule** - Who gets paid, how much, which method, and what triggers it
3. **Channel Comparison** - Planner referral vs direct sale margins
4. **Quarterly Projection** - 10-suit example with Ops commission calculation
5. **Payment Flow Architecture** - Per-order and quarterly reconciliation processes
6. **Accounting Requirements** - Minimum documentation for audit trail
7. **Key Assumptions** - FX rate, Stripe fees, tax rate, shipping costs
8. **Risk Factors** - FX, returns, customs, chargebacks with mitigations

> File: /mnt/user-data/outputs/SUIT_AI_v4b_Financial_Model.docx



## Prompt:
1/18/2026, 1:10:05 PM

![WhatsApp Image 2025-12-31 at 12.12.52 (2).jpeg](data:image/webp;base64,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)

![WhatsApp Image 2025-12-31 at 12.12.52 (1).jpeg](data:image/webp;base64,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)

![WhatsApp Image 2025-12-31 at 12.12.52.jpeg](data:image/webp;base64,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)

> File: SUIT_AI_Pipeline_Plan_v4 (2).docx

> File: 





## Response:
1/18/2026, 1:13:02 PM

````plaintext
Thought process: Analyzed e-commerce platform requirements and architected comprehensive MVP specification.

The user wants me to create a comprehensive MVP production specification document for the e-commerce platform. They've provided context about:

1. Two tracks: Track A (retail/individual) and Track B (wedding/group orders)
2. The user journey including body scanning, measurement confirmation, suit configuration
3. The backend requirements
4. Screenshots of the suit configurator UI

Let me analyze the screenshots:
- Image 1: Shows the configurator with a brown suit, fabric color palette, Raymond Fine Fabrics selection, lining customization options (Solid Bemberg, Jacquard, Contrast Piping), "My Suit Collection" sidebar, price display ($350), pose controls (Standing, Walking, Sitting), view controls (Rotate, Zoom, Exploded View), and "Lining Flash" button
- Image 2: Shows Regional Dialects dropdown with Neapolitan options (Spalla Camicia, Spalla Taillan, Spalla Oia), Lapel (Peak), Vents, Buttons (6x2) options
- Image 3: Shows a grey pinstripe suit with similar UI elements

Now I need to create a comprehensive MVP spec document that covers:
1. User journey for both tracks
2. Technical requirements
3. Backend systems
4. Integration points
5. Numbered task list

This is a complex document so I should create it as a proper docx file.
````

Let me create a comprehensive MVP production spec based on the configurator mockups and the dual-track requirements.

````plaintext
View: Viewing the uploaded configurator screenshots to understand the UI components
````

````plaintext
Thought process: Architected comprehensive MVP specification with technical components and development roadmap.

Good, I can see the configurator UI. Let me now create the comprehensive MVP spec document. This needs to cover:

1. System architecture overview
2. User journeys for both tracks
3. Technical components
4. Database schema requirements
5. API endpoints
6. Integration points
7. Numbered task list for development

Let me create this as a detailed docx document.
````

````plaintext
Create File: Creating the comprehensive MVP production specification document
````

````plaintext
Thought process

Now let me run the script to generate the document.
````

````plaintext
Bash Tool: Generating the MVP specification document
````

````plaintext
Thought process

Document created. Now let me copy it to the outputs directory and present it.
````

````plaintext
Bash Tool: Copying MVP spec to outputs
````

````plaintext
Thought process

Now present the file to the user.
````

````plaintext
Present File: /mnt/user-data/outputs/SUIT_AI_MVP_Specification.docx
````

````plaintext
Thought process: Synthesized comprehensive specification document across multiple technical domains.

Done. The document is now available for the user to review. It covers:

1. System overview with Track A vs Track B comparison
2. Complete user journey for Track A (retail)
3. Complete user journey for Track B (wedding)
4. UI components from the mockups
5. Database schema
6. API endpoints
7. External integrations (Stripe, body scanner, Optitex, email, analytics)
8. Full development task list organized by phases
9. MVP fabric catalog
10. Constraints and limitations

This is a comprehensive spec document they can use to develop the platform.
````

Done. The MVP spec covers:

**Section 1-3: User Journeys**
- Track A (retail): Anonymous session, body scan, full configurator, multi-suit cart, Stripe checkout
- Track B (wedding): Organizer creates templates, batch payment, attendee invites, locked configurator, status dashboard

**Section 4: UI Components**
- 3D viewer controls (rotate, zoom, exploded view, poses, lining flash)
- Right panel options mapped to your mockups: fabric palette, regional dialects (Neapolitan variants), lapel, vents, buttons, lining
- Left panel: My Suit Collection with Track B lock behavior

**Section 5-6: Backend**
- 12 database tables covering sessions, measurements, configs, orders, wedding events, attendees, fabrics, Optitex jobs
- 14 API endpoints for both tracks
- Integration specs for Stripe, body scanner, Optitex, Resend email, analytics

**Section 7: Development Tasks**
- 50+ numbered tasks across 7 phases
- Dependency-ordered from foundation through production pipeline
- Covers everything from Supabase setup to commission tracking

**Section 8-9: Constraints**
- MVP fabric catalog (5 Raja-stocked fabrics)
- Scope limitations (full suits only, UK shipping, GBP)
- Business rules (min 3 suits for Track B, 4-week lead time)

> File: /mnt/user-data/outputs/SUIT_AI_MVP_Specification.docx



## Prompt:
1/18/2026, 1:31:20 PM

> File: 

ok can we enhance the spec by describing what we are actually doing in order to build the prd and all the stories from this founding document, here is the extra logical thinking about the plan, write a total overview document about how everything will work in sequence and how it all fits together and what each developed module must achieve and how it must do it



## Response:
1/18/2026, 1:35:03 PM

````plaintext
Thought process: Synthesized MVP, manual bridge plan, and financial model into unified founding document.

The user wants me to create a comprehensive overview document that synthesizes:
1. The MVP specification I just created
2. The v4.b "Manual Bridge" plan with its Wizard of Oz approach
3. The financial model we worked out earlier

This needs to be a founding document that can generate PRDs and user stories. It should explain:
- The overall system architecture
- How the manual backend (Raja, runner, printer) connects to the digital frontend
- The sequence of operations from customer click to suit delivery
- What each module must achieve and how

Let me create a comprehensive document that serves as the single source of truth for the entire operation.
````

````plaintext
Create File: Creating comprehensive SUIT AI system overview and founding document
````

````plaintext
Thought process: Prepared to execute document generation script.

Now I need to run the script to generate the document.
````

````plaintext
Bash Tool: Generating the system architecture document
````

````plaintext
Thought process: Orchestrated document completion and output delivery workflow.

Document created successfully. Now I need to copy it to the outputs directory and present it to the user.
````

````plaintext
Bash Tool: Copying system architecture document to outputs
````

````plaintext
Thought process

Document copied. Now present it to the user.
````

````plaintext
Present File: /mnt/user-data/outputs/SUIT_AI_v4b_System_Architecture.docx
````

````plaintext
Thought process: Orchestrated comprehensive framework synthesizing foundational document into sequential module architecture.

The document has been created and presented. Let me summarize what's in it for the user.
````

Done. This is the founding document that synthesizes everything into a single source of truth.

**Section 1: Core Premise**
- The Wizard of Oz table showing what the customer sees vs what actually happens
- Explicitly states this validates the sales model before investing in automation

**Section 2: Two Customer Tracks**
- Track A (retail): Full step-by-step flow from landing to checkout
- Track B (wedding): Organizer flow (10 steps) + Attendee flow (9 steps)
- Key constraints for each track

**Section 3: Order Lifecycle**
- 19-state machine from PAID through DELIVERED
- Every state with exact description of what happens
- This is the backbone for all status tracking and admin dashboards

**Section 4: Manual Backend Operations**
- The Operator role: exact Optitex workflow, tech pack generation, exception handling
- The Runner role: printer collection, ruler test protocol, fabric locking for weddings
- Raja's role: sacrificial cut protocol, "Trust the Paper" rule, liability split

**Section 5: Financial Model**
- Complete GBP 1,500 waterfall to GBP 904.01 retained
- Every line item from Stripe fees through Amritsar Ops commission

**Section 6: System Modules**
- 9 modules, each with:
  - PURPOSE statement
  - INPUTS
  - OUTPUTS  
  - BEHAVIOR (step-by-step)
  - ACCEPTANCE CRITERIA (testable requirements)

Modules: Session Management, 3D Body Scanner, Measurement Confirmation, Suit Configurator, Shopping Cart, Checkout, Wedding Event Management, Invite Link Handler, Admin Dashboard

**Section 7: Risk Controls**
- 8 identified failure modes with specific controls
- Print scaling, pattern override, fabric stockout, fit failure, customs delay, paper slippage, batch incomplete, chargebacks

**Section 8: Development Phases**
- 7 phases with objective-based exit criteria
- Each phase lists specific deliverables

This document can now generate PRDs by extracting individual modules, and user stories by breaking down each behavior step into "As a [user], I want to [action], so that [outcome]" format.

> File: /mnt/user-data/outputs/SUIT_AI_v4b_System_Architecture.docx



## Prompt:
1/18/2026, 1:48:51 PM

you have totally missed the Outputs including our backend optitex pattern to take for each suit to the tailors, because the suite needs to adjust in the configurator preview



## Response:
1/18/2026, 1:51:01 PM

````plaintext
Thought process: Recognized Optitex integration as core configurator feature, not backend-only process.

The user is pointing out a critical gap - I've described the Optitex pattern generation as a manual backend process, but I've missed that:

1. The configurator preview needs to show the user's actual body shape with the suit adjusted to their measurements
2. This means Optitex (or some pattern system) needs to run in the background WHILE the user is in the configurator
3. The 3D preview should show patterns/suits that are already tailored to that user's measurements
4. When they're confirming measurements and seeing the "measuring animation", the backend is actually generating all the prefab pattern variations

So the flow should be:
1. User completes body scan
2. Measurements extracted
3. Background process: Send measurements to Optitex, generate patterns for ALL style variants (all the regional dialects, lapel options, etc.)
4. User sees "measuring animation" which is actually buying time for pattern generation
5. When configurator loads, the 3D preview is showing their ACTUAL fitted patterns, not a generic model
6. When they select different options, they're seeing the actual fitted variations
7. Final checkout triggers the selected pattern(s) to be queued for printing

This is a major architectural piece I missed. The Optitex integration isn't just at the end of the pipeline - it's integral to the configurator experience.

Let me update the document to properly capture this.
````

You're right. I completely missed the core loop - the Optitex pattern generation happens DURING the configurator experience, not after checkout. The "measuring animation" is buying time while the backend generates all the pattern variants for that user's body. Let me fix this.

````plaintext
Edit: Updating the system architecture to include the Optitex pattern generation loop in the configurator
````

````plaintext
Thought process: Reconciled module references and integrated Optitex pattern engine.

Now I need to also update the module references from "6" to "7" since I added a new section 6. Let me also add a specific module for the Optitex pattern engine.
````

````plaintext
Edit: Updating section numbers for Risk Controls
````

````plaintext
Thought process: Reorganized document structure by renumbering sections.

Now I need to update section 8 Development Phases to become section 9.
````

````plaintext
Edit: Updating section numbers for Development Phases
````

````plaintext
Thought process: Identified missing module integration for pattern engine outputs.

Now I need to add a new Module for the Optitex Pattern Engine. Let me find where the modules end and add it.
````

````plaintext
Edit: Adding Module 10: Optitex Pattern Engine after Module 9
````

````plaintext
Thought process: Investigated missing output specifications for tailoring pattern configurations.

Let me check the file to see what the actual content is around the module sections and risk controls.
````

````plaintext
Bash Tool: Finding the location of payout tracking and risk controls
````

````plaintext
Thought process: Examined structural placement and module integration requirements.

I see - the Risk Controls section comes before the payout tracking line in the original. Let me check the actual structure to understand where to insert the new module.
````

````plaintext
View: Viewing the area around Module 9 and the Risk Controls section
````

````plaintext
Thought process: Orchestrated module insertion between dashboard and controls sections.

I see. The Module 9 (Admin Dashboard) ends with "QC_PASS triggers Raja payout notification" and then there's a page break before the Risk Controls section. I need to insert Module 10 between the admin dashboard acceptance criteria and the risk controls section.
````

````plaintext
Edit: Adding Module 10: Optitex Pattern Engine after Module 9 Admin Dashboard
````

````plaintext
Thought process: Deliberated document regeneration and section numbering consistency.

Good, now I need to regenerate the document. But I should also check that section numbers flow correctly through the rest of the document.
````

````plaintext
Bash Tool: Regenerating the system architecture document with Optitex pattern engine module
````

````plaintext
Thought process: Overlooked backend pattern outputs for tailor adjustments.

Good. Now let me copy it to outputs.
````

````plaintext
Bash Tool: Copying updated system architecture document to outputs
````

````plaintext
Thought process

Done. Now let me present the file.
````

````plaintext
Present File: /mnt/user-data/outputs/SUIT_AI_v4b_System_Architecture.docx
````

````plaintext
Thought process: Acknowledged document updates and began synthesizing modifications.

Good, the document is updated. Let me summarize what was added.
````

Updated. The document now includes:

**New Section 6: The Pattern Generation Loop**

This captures the critical architecture you identified:

**6.1 The Sequence** - A table showing what the user sees vs what the backend does at each step:
- Scan complete triggers Optitex batch job
- "Measuring animation" buys time for pattern generation (30-60 seconds)
- Configurator loads with FITTED patterns on user's body mesh
- Style changes swap pre-generated variants (instant)
- Measurement overrides trigger delta recalculation

**6.2 What Optitex Generates Per User**
- 10 dialects x 3 lapels x 3 vents x 4 buttons = 360 pattern variants (full matrix)
- MVP constraint: 24 variants (3x2x2x2) to keep it manageable

**6.3 The Output Artifacts**
- 3D Garment File (.OBJ/.GLB) for configurator preview
- 2D Pattern Marker (PDF A0 841mm) for print shop
- Pattern Metadata (JSON) for fabric consumption
- Tech Pack (PDF) for Raja's construction instructions

**6.4 Measurement Override Handling**
- Flag as USER_OVERRIDE
- Invalidate affected cached patterns
- Regenerate and swap into preview within 5 seconds

**6.5 Track B Template Generation**
- Organizer creates ONE template variant
- Each attendee gets their personalized version of the locked template

**New Module 10: Optitex Pattern Engine**

Defines the MVP approach (Manual Bridge):
- Operator receives measurements JSON
- Operator manually runs Optitex
- Operator uploads 3D mesh to CDN + PDF to order record
- Configurator pulls from CDN

Plus acceptance criteria around accuracy (0.5cm), preview load time (3 seconds), and scale verification (10cm = 10cm).

> File: /mnt/user-data/outputs/SUIT_AI_v4b_System_Architecture.docx



## Prompt:
1/18/2026, 7:44:39 PM

Ok from our maths and unit economics what does 700 suits represent



## Response:
1/18/2026, 7:45:03 PM

````plaintext
Thought process: Calculated annual revenue projections and production feasibility metrics.

The user is asking about what 700 suits represents in terms of the financial model we've established.

Let me calculate based on the unit economics we defined:

Per suit (with wedding planner channel):
- Final Retained Profit: £904.01

700 suits:
- Revenue: 700 x £1,500 = £1,050,000
- Retained Profit: 700 x £904.01 = £632,807

Let me also think about what this means in terms of:
- Quarterly targets
- Annual projections
- Breakeven context
- Production capacity implications

From earlier conversations:
- Breakeven was about 5 suits to recover startup costs (~£4,900)
- Monthly fixed costs were ~£1,115 (1 suit/month to cover)

At 700 suits:
- If this is annual: ~58 suits/month, ~2 suits/day
- Manual capacity constraint was noted as 5-10 suits/day max

Let me present this clearly.
````

## 700 Suits Analysis

**Revenue**
| Metric | Amount |
|--------|--------|
| Gross Sales | £1,050,000 |
| Net Revenue (post-Stripe, post-planner) | £923,860 |

**Costs**
| Category | Amount |
|----------|--------|
| Stripe Fees | £21,140 |
| Planner Commissions (10%) | £105,000 |
| Production (700 x £145) | £101,500 |
| Corporation Tax (19%) | £156,213 |
| Amritsar Ops (5% of net after tax) | £33,306 |

**Profit**
| Metric | Amount |
|--------|--------|
| Net Profit Before Tax | £822,360 |
| Net Profit After Tax | £666,113 |
| **Final Retained** | **£632,807** |

---

## What 700 Suits Means Operationally

**If Annual (58/month)**
- ~2 suits per day
- Within manual capacity (5-10/day max)
- 12 wedding batches of 6 suits/month OR mix of retail + weddings

**If Quarterly (233/month)**
- ~8 suits per day
- At the ceiling of manual capacity
- Requires Runner working full days
- Raja needs to be dedicated/exclusive

**If Monthly (700/month)**
- ~23 suits per day
- Exceeds manual capacity by 2-3x
- Requires multiple tailors, multiple runners
- Automation becomes essential

---

## Milestone Context

| Milestone | Suits | Retained Profit | Note |
|-----------|-------|-----------------|------|
| Breakeven (startup costs) | 5 | £4,520 | Recovers £4,900 investment |
| First £100k retained | 111 | £100,345 | |
| First £500k retained | 553 | £499,918 | |
| **700 suits** | **700** | **£632,807** | |
| First £1M retained | 1,106 | £1,000,235 | |

700 suits is roughly the threshold where you've built a £600k+ profit business and need to decide whether to scale manually (more tailors) or invest in automation (plotter, Optitex API).



## Prompt:
1/18/2026, 7:46:07 PM

What about weekly



## Response:
1/18/2026, 7:46:25 PM

````plaintext
Thought process: Examined operational and financial implications of weekly production.

The user is asking what 700 suits per week would look like operationally and financially.
````

## 700 Suits Per Week

**Weekly Revenue**
| Metric | Amount |
|--------|--------|
| Gross Sales | £1,050,000 |
| Final Retained | £632,807 |

**Monthly (4 weeks)**
| Metric | Amount |
|--------|--------|
| Suits | 2,800 |
| Gross Sales | £4,200,000 |
| Final Retained | £2,531,228 |

**Annual (52 weeks)**
| Metric | Amount |
|--------|--------|
| Suits | 36,400 |
| Gross Sales | £54,600,000 |
| Final Retained | £32,905,964 |

---

## Operational Reality Check

**Daily Volume: 100 suits/day**

| Resource | Current Capacity | Required for 100/day |
|----------|------------------|----------------------|
| Raja Exclusive | 2-3 suits/day | 35-50 tailors at Raja's level |
| Runner | 5-10 deliveries/day | 10-20 runners |
| Pattern Printing | 10 prints/day | Industrial print facility or in-house plotter |
| Optitex Operator | 5-10 patterns/day | Full automation required |
| QC | 5-10 inspections/day | Dedicated QC team (10+ inspectors) |
| Shipping | Individual parcels | Freight logistics partner |

---

## What Has to Change

**Manual Bridge is Dead at This Scale**

| Component | Manual Bridge | 700/Week Requirement |
|-----------|---------------|----------------------|
| Pattern Generation | Operator runs Optitex manually | Fully automated API pipeline |
| Printing | Email to local shop, runner collects | In-house plotter or dedicated print partner |
| Production | Raja Exclusive (1 tailor) | Factory contract (Ludhiana) or 40+ tailor network |
| QC | Visual check by runner | Standardized QC stations with photo documentation |
| Logistics | Individual DHL shipments | Batch consolidation, freight forwarding |

---

## The Trigger Question

700/week means you've validated demand beyond doubt. At that point:

**Option A: Scale the Network**
- Recruit 40+ tailors across Amritsar/Ludhiana
- Build the dual-sourcing tender system you designed
- Maintain quality through competition and scoring
- Keep the asset-light model

**Option B: Vertical Integration**
- Acquire or build factory capacity
- Install plotters, cutting tables, industrial machines
- Hire permanent staff
- Higher margin but higher fixed costs

700/week is not an MVP problem. It's a Series A problem.



## Prompt:
1/18/2026, 8:41:49 PM

Total staffing



## Response:
1/18/2026, 8:42:30 PM

````plaintext
Thought process: Decomposed staffing pipeline across eleven operational functions.

The user wants to understand the total staffing requirements to handle 700 suits per week. Let me break this down by function and calculate the headcount needed.

700 suits/week = 100 suits/day (assuming 7-day operation) or ~140 suits/day (5-day operation)

Let me calculate for a 6-day operation: ~117 suits/day

I need to think through each role in the pipeline:

1. **Pattern Generation (Optitex Operators)**
- Manual: 1 operator can do maybe 10-15 patterns/day
- For 117/day: 8-12 operators
- With automation: 1-2 operators supervising

2. **Pattern Printing**
- Local print shop can't handle this volume
- Need in-house plotter(s)
- 1 plotter operator per machine, maybe 2 machines running 2 shifts
- Maybe 3-4 print operators

3. **Runners (Pattern Delivery)**
- If tailors are distributed: need many runners
- If centralized: fewer runners
- Let's say 10-15 runners for distributed model

4. **Tailors**
- Raja does 2-3 suits/day
- For 117/day: ~40-60 tailors
- Let's say 50 tailors

5. **QC Inspectors**
- 1 inspector can check maybe 15-20 suits/day thoroughly
- For 117/day: 6-8 inspectors

6. **Packaging**
- Maybe 20-30 suits/person/day
- For 117/day: 4-6 packers

7. **Shipping/Logistics**
- 2-3 people managing courier handoffs

8. **Customer Service**
- Email/phone support for 700 customers/week
- Maybe 2-3 support staff

9. **Admin/Finance**
- Payout processing, accounting


- 1-2 people

10. **Operations Management**
- Amritsar Ops lead (already accounted for in commission)
- Maybe 1-2 supervisors

11. **HQ/Remote**
- You (founder)
- Tech/product if needed
- Marketing

Now I should compile this into a comprehensive staffing table to see the total headcount and cost implications.
````

## Total Staffing for 700 Suits/Week

**Assumption: 6-day operation = 117 suits/day**

---

### Production (Amritsar)

| Role | Output/Person/Day | Required | Notes |
|------|-------------------|----------|-------|
| Tailors | 2-3 suits | 45-50 | Core production workforce |
| Cutters | 15-20 cuts | 6-8 | Dedicated fabric cutting (separate from sewing) |
| QC Inspectors | 15-20 checks | 6-8 | Visual inspection against tech pack |
| Packers | 25-30 suits | 4-5 | Box, documentation, labeling |
| **Production Subtotal** | | **61-71** | |

---

### Pattern Operations (Amritsar or Remote)

| Role | Output/Person/Day | Required | Notes |
|------|-------------------|----------|-------|
| Optitex Operators | 15-20 patterns (manual) | 6-8 | With automation: 1-2 supervisors |
| Plotter Operators | 50-60 prints/machine | 2-3 | 2 plotters running 2 shifts |
| Tech Pack Prep | 30-40 packs | 3-4 | Print and collate instructions |
| **Pattern Subtotal** | | **11-15** | |

---

### Logistics (Amritsar)

| Role | Tasks/Person/Day | Required | Notes |
|------|------------------|----------|-------|
| Runners | 15-20 deliveries | 6-8 | Pattern + button delivery to tailors |
| Fabric Handlers | Stock management | 2-3 | Inventory, tagging, distribution |
| Shipping Coordinators | 50-60 parcels | 2-3 | DHL/FedEx handoff, AWB generation |
| **Logistics Subtotal** | | **10-14** | |

---

### Management (Amritsar)

| Role | Required | Notes |
|------|----------|-------|
| Operations Manager | 1 | Overall Amritsar oversight (the 5% commission role) |
| Production Supervisors | 2-3 | Floor management across tailor network |
| QC Lead | 1 | Quality standards, dispute resolution |
| Logistics Lead | 1 | Runner coordination, shipping |
| **Management Subtotal** | **5-6** | |

---

### HQ / Remote

| Role | Required | Notes |
|------|----------|-------|
| Founder/CEO | 1 | Strategy, planner relationships, finance |
| Customer Service | 2-3 | Email/chat support, order issues |
| Tech/Product | 1-2 | Platform maintenance, bugs, features |
| Marketing | 1-2 | Planner outreach, campaigns |
| Finance/Admin | 1 | Payouts, accounting, tax |
| **HQ Subtotal** | **6-9** | |

---

## Total Headcount Summary

| Location | Headcount |
|----------|-----------|
| Production (tailors, cutters, QC, packers) | 61-71 |
| Pattern Operations | 11-15 |
| Logistics | 10-14 |
| Amritsar Management | 5-6 |
| HQ / Remote | 6-9 |
| **TOTAL** | **93-115 people** |

---

## Payroll Estimate

| Category | Headcount | Avg Monthly (INR) | Monthly Total (INR) | Monthly Total (GBP) |
|----------|-----------|-------------------|---------------------|---------------------|
| Tailors | 50 | 25,000 | 1,250,000 | £11,905 |
| Skilled Workers (cutters, QC, plotter) | 18 | 20,000 | 360,000 | £3,429 |
| Unskilled (packers, runners, handlers) | 18 | 15,000 | 270,000 | £2,571 |
| Amritsar Management | 6 | 40,000 | 240,000 | £2,286 |
| HQ Remote (UK rates) | 8 | £3,500 | - | £28,000 |
| **TOTAL MONTHLY PAYROLL** | **100** | | | **£48,191** |

---

## Revised Unit Economics at 700/Week

| Line | Per Suit | Weekly (700) |
|------|----------|--------------|
| Gross Sale | £1,500 | £1,050,000 |
| Current Model Retained | £904 | £632,807 |
| **Less: Payroll Overhead** | **(£69)** | **(£48,191)** |
| **Adjusted Retained** | **£835** | **£584,616** |

At 700/week, payroll adds ~£69/suit but you're still clearing £835 retained per suit, or **£2.3M/month**.

---

## The Real Question

At 100 people, you're no longer a "Manual Bridge MVP" - you're a manufacturing company. The 5% Amritsar Ops commission structure doesn't scale; you need:

1. Salaried Operations Director
2. HR function
3. Facility (or multiple facilities)
4. Insurance, compliance, labor law

This is the inflection point where you either raise capital to build infrastructure or license the tech to an existing manufacturer.



## Prompt:
1/18/2026, 8:42:54 PM

Just our staff not the tailors or their runners



## Response:
1/18/2026, 8:43:06 PM

````plaintext
Thought process: Clarified distinction between core staff and external contractors.

The user wants to know just the SUIT AI staff headcount - not the tailors (who are independent contractors in the tender system) or their support staff. This is the core team that operates the platform.
````

## SUIT AI Core Team for 700 Suits/Week

---

### Amritsar Operations

| Role | Headcount | Monthly (INR) | Monthly (GBP) |
|------|-----------|---------------|---------------|
| Operations Manager | 1 | 50,000 | £476 |
| Optitex Operators | 3 | 25,000 each | £714 |
| QC Lead | 1 | 30,000 | £286 |
| QC Inspectors | 4 | 20,000 each | £762 |
| Shipping Coordinator | 2 | 18,000 each | £343 |
| **Amritsar Subtotal** | **11** | | **£2,581** |

---

### HQ / Remote

| Role | Headcount | Monthly (GBP) |
|------|-----------|---------------|
| Founder/CEO | 1 | £0 (equity) |
| Customer Service | 2 | £5,000 |
| Tech/Product | 2 | £7,000 |
| Marketing | 1 | £3,000 |
| Finance/Admin | 1 | £2,500 |
| **HQ Subtotal** | **7** | **£17,500** |

---

## Total SUIT AI Staff

| Location | Headcount | Monthly Payroll (GBP) |
|----------|-----------|----------------------|
| Amritsar | 11 | £2,581 |
| HQ/Remote | 7 | £17,500 |
| **TOTAL** | **18** | **£20,081** |

---

## Per Suit Overhead

| Metric | Amount |
|--------|--------|
| Weekly payroll | £5,020 |
| Suits per week | 700 |
| **Payroll per suit** | **£7.17** |

---

## Revised Retained Profit

| Line | Per Suit |
|------|----------|
| Previous Retained | £904.01 |
| Less: Staff Overhead | (£7.17) |
| **Adjusted Retained** | **£896.84** |

At 700/week, your 18-person team costs you £7 per suit. The tailors, their cutters, and their runners are all paid per-suit through the tender system - they're variable cost, not headcount.



## Prompt:
1/19/2026, 3:37:02 PM

Ok lwe have an update on the floorspace and its 4000square feet, adjust our numbers based on that



## Response:
1/19/2026, 3:37:48 PM

````plaintext
Thought process: Recalibrated operational economics with facility rent and in-house plotting.

The user is mentioning 4000 square feet of floor space. This is likely for the Amritsar operations - potentially a facility that would house the operations team, Optitex workstations, QC area, and potentially pattern printing/plotting.

Let me think about what this means:
1. They now have a physical facility (4000 sq ft)
2. This changes the cost structure - adds rent
3. May also affect capacity and how operations are run

I should ask for clarification or make assumptions about:
- Where is this facility? (Amritsar presumably)
- What's the rent?
- What will be housed there?

Let me calculate what 4000 sq ft can accommodate and adjust the economics.

Typical commercial/industrial rent in Amritsar would be around INR 15-25 per sq ft per month for decent space. So:
- 4000 sq ft x 20 INR = 80,000 INR/month = ~£762/month

What can you fit in 4000 sq ft?
- Office/admin area: 400 sq ft (desks for 6-8 people)
- Optitex workstations: 200 sq ft (3 stations)
- QC inspection area: 600 sq ft (tables, lighting, rails)
- Pattern storage: 300 sq ft
- Shipping/packing area: 500 sq ft
- Fabric storage (if holding any): 500 sq ft
- Meeting/training room: 200 sq ft
- Restrooms/utilities: 200 sq ft
- Circulation/corridors: 600 sq ft

That's about 3,500 sq ft used, leaves some buffer.

But wait - if they're doing pattern printing in-house with a plotter, that could be huge. Industrial plotters need space. A plotter setup might need 400-600 sq ft.

Actually, this 4000 sq ft might be enough to bring pattern printing in-house (eliminating the third-party print shop), which would:


- Remove the INR 200/suit printing cost
- Require a plotter investment upfront
- Need dedicated operator(s) and consumables like paper and ink

I need to recalculate the unit economics with facility rent, in-house plotting capability, and adjusted staffing to see how this impacts the overall cost structure.
````

## 4000 Sq Ft Facility Analysis

---

### What 4000 Sq Ft Accommodates

| Zone | Sq Ft | Function |
|------|-------|----------|
| Operations Office | 400 | Ops Manager, coordinators, admin |
| Optitex Workstations | 300 | 3-4 stations with monitors |
| Plotter Room | 500 | 2 plotters + paper storage + cutting table |
| QC Inspection | 800 | Inspection tables, lighting, garment rails |
| Packing/Shipping | 600 | Packing stations, box storage, dispatch |
| Fabric Holding | 400 | Temporary fabric storage for pre-locked wedding orders |
| Pattern Archive | 200 | Filed patterns for remakes |
| Meeting/Training | 200 | |
| Restrooms/Utilities | 200 | |
| Circulation | 400 | Corridors, movement space |
| **TOTAL** | **4000** | |

---

### New Cost Structure

**Facility Costs (Monthly)**

| Item | INR | GBP |
|------|-----|-----|
| Rent (4000 sq ft @ INR 20/sq ft) | 80,000 | £762 |
| Electricity | 15,000 | £143 |
| Internet/Comms | 5,000 | £48 |
| Maintenance/Cleaning | 10,000 | £95 |
| Security | 8,000 | £76 |
| **Facility Subtotal** | **118,000** | **£1,124** |

**Equipment (One-Time CapEx)**

| Item | INR | GBP |
|------|-----|-----|
| Plotter x 2 | 500,000 | £4,762 |
| Optitex Workstations x 4 | 300,000 | £2,857 |
| QC Tables + Lighting | 50,000 | £476 |
| Packing Stations | 30,000 | £286 |
| Garment Rails/Storage | 40,000 | £381 |
| Office Furniture | 60,000 | £571 |
| **CapEx Total** | **980,000** | **£9,333** |

---

### What This Changes

**Eliminated Costs**

| Previous Cost | Per Suit | Weekly (700) |
|---------------|----------|--------------|
| Third-party A0 printing | £2.00 | £1,400 |

**New Costs**

| New Cost | Monthly | Per Suit (2800/mo) |
|----------|---------|-------------------|
| Facility | £1,124 | £0.40 |
| Plotter consumables (paper, ink) | £400 | £0.14 |
| Plotter operator x 2 | £381 | £0.14 |
| **New Subtotal** | **£1,905** | **£0.68** |

**Net Savings: £1.32/suit**

---

### Updated Amritsar Staffing

| Role | Headcount | Monthly (INR) | Monthly (GBP) |
|------|-----------|---------------|---------------|
| Operations Manager | 1 | 50,000 | £476 |
| Optitex Operators | 3 | 25,000 each | £714 |
| Plotter Operators | 2 | 18,000 each | £343 |
| QC Lead | 1 | 30,000 | £286 |
| QC Inspectors | 4 | 20,000 each | £762 |
| Shipping Coordinator | 2 | 18,000 each | £343 |
| Packer | 2 | 15,000 each | £286 |
| **Amritsar Subtotal** | **15** | **333,000** | **£3,210** |

---

### Updated Total Monthly Overhead

| Category | Monthly (GBP) |
|----------|---------------|
| Amritsar Staff (15) | £3,210 |
| Facility Costs | £1,124 |
| Plotter Consumables | £400 |
| HQ/Remote Staff (7) | £17,500 |
| **TOTAL** | **£22,234** |

---

### Updated Unit Economics (700/Week)

| Line | Previous | Updated |
|------|----------|---------|
| Gross Sale | £1,500.00 | £1,500.00 |
| Stripe Fee | (£30.20) | (£30.20) |
| Wedding Planner (10%) | (£150.00) | (£150.00) |
| **Net Revenue** | **£1,319.80** | **£1,319.80** |
| | | |
| Raja (jacket + trousers) | (£81.00) | (£81.00) |
| Shirt | (£11.00) | (£11.00) |
| Buttons/Trims | (£4.00) | (£4.00) |
| ~~Pattern Print~~ | ~~(£2.00)~~ | £0.00 |
| Packaging | (£5.00) | (£5.00) |
| Runner | (£2.00) | (£2.00) |
| Shipping | (£40.00) | (£40.00) |
| **Production Total** | **(£145.00)** | **(£143.00)** |
| | | |
| Net Profit Before Tax | £1,174.80 | £1,176.80 |
| Corporation Tax (19%) | (£223.21) | (£223.59) |
| Net Profit After Tax | £951.59 | £953.21 |
| Amritsar Ops (5%) | (£47.58) | (£47.66) |
| **Retained (before overhead)** | **£904.01** | **£905.55** |
| | | |
| Staff + Facility Overhead | (£7.17) | (£7.94) |
| **Final Retained** | **£896.84** | **£897.61** |

---

### Summary

| Metric | Value |
|--------|-------|
| Facility Size | 4000 sq ft |
| Total SUIT AI Staff | 22 (15 Amritsar + 7 HQ) |
| Monthly Overhead | £22,234 |
| Overhead Per Suit | £7.94 |
| Final Retained Per Suit | £897.61 |
| Weekly Retained (700 suits) | £628,327 |
| Monthly Retained (2800 suits) | £2,513,308 |
| CapEx (one-time) | £9,333 |
| CapEx Payback | 11 suits |

The 4000 sq ft facility brings plotting in-house, eliminates third-party print risk, and gives you capacity headroom. Net impact is essentially neutral on per-suit economics but dramatically improves quality control and removes the "ruler test at the print shop" failure point.



## Prompt:
1/19/2026, 3:38:30 PM

How many QC suits fit in the new space



## Response:
1/19/2026, 3:39:02 PM

````plaintext
Thought process: Calculated garment rail capacity and storage requirements.

The user is asking how many suits can physically fit in the QC inspection area of the 4000 sq ft facility. Let me calculate based on the space allocated.

From my previous breakdown:
- QC Inspection: 800 sq ft

I need to think about:
1. Garment rails - how much space per suit on a rail
2. Inspection tables - how much space needed
3. Movement space for inspectors
4. Lighting rigs

A standard garment rail holds suits at about 2-3 inches apart (let's say 3 inches = 7.5cm per suit). A 6ft rail holds about 24 suits.

Let me think about this more practically:

A typical QC setup:
- Inspection table: ~6ft x 3ft = 18 sq ft per table, need working space around it so ~40 sq ft per inspection station
- Garment rails for incoming (pre-QC) and outgoing (post-QC)
- Good lighting

If we have 800 sq ft for QC:
- 4 inspection stations @ 50 sq ft each = 200 sq ft
- Remaining 600 sq ft for garment storage/rails

For garment rails:
- A double-sided rolling rack is about 5ft x 2ft footprint = 10 sq ft
- Holds about 50 suits (25 per side)
- With circulation space, call it 20 sq ft per rack including access

600 sq ft / 20 sq ft per rack = 30 racks
30 racks x 50 suits = 1,500 suits capacity in the QC area

But that seems high. Let me reconsider.

Actually, for a working QC area you need:
- Space between racks for inspectors to move
- Clear floor space
- Probably more like 40-50 sq ft per rolling rack when you account for access

600 sq ft / 50 sq ft = 12 racks


12 racks x 50 suits = 600 suits. With another 10-20 pieces actively on inspection tables, I'm looking at roughly 600-650 suits occupying the QC zone at any given moment. Though if the user is really asking about throughput rather than static capacity, with 4 inspectors each handling 15-20 checks daily across a 6-day week, that's closer to 480 suits processed per week.

Let me reconsider the actual physical footprint more carefully. A double-sided rolling rack holds about 40 suits and takes up roughly 30 square feet when accounting for necessary access aisles. That means 600 square feet of dedicated QC storage could accommodate around 20 racks, bringing total capacity to approximately 800 suits. Factoring in inspection stations and buffer zones, the realistic range is probably 600-800 suits at any one time, which becomes relevant when processing 700 suits weekly.

At that volume, you're looking at roughly 120 suits per day moving through the space. If the average dwell time is a single day, you'd need at least that much capacity just for normal flow. The 600-800 figure actually provides a comfortable 5-6 day cushion, so you could handle unexpected surges or processing delays without bottlenecking.
````

## QC Zone Capacity (800 Sq Ft)

---

### Space Breakdown

| Element | Dimensions | Sq Ft | Qty | Total Sq Ft |
|---------|------------|-------|-----|-------------|
| Inspection Tables | 6ft x 3ft + workspace | 50 | 4 | 200 |
| Garment Rails (incoming) | 5ft x 6ft (incl. access) | 30 | 10 | 300 |
| Garment Rails (passed) | 5ft x 6ft (incl. access) | 30 | 6 | 180 |
| Garment Rails (failed/rework) | 5ft x 6ft (incl. access) | 30 | 2 | 60 |
| Lighting/Circulation | - | - | - | 60 |
| **TOTAL** | | | | **800** |

---

### Suit Capacity

| Rail Type | Racks | Suits/Rack | Total Suits |
|-----------|-------|------------|-------------|
| Incoming (pre-QC) | 10 | 40 | 400 |
| Passed (awaiting packing) | 6 | 40 | 240 |
| Failed (rework queue) | 2 | 40 | 80 |
| On inspection tables | 4 | 4 | 16 |
| **TOTAL CAPACITY** | | | **736 suits** |

---

### What This Means

| Metric | Value |
|--------|-------|
| Physical capacity | 736 suits |
| Daily throughput (700/week) | 117 suits/day |
| **Days of buffer** | **6.3 days** |

You can hold nearly a full week's production in the QC zone. This absorbs:
- Weekend backlog (Raja delivers Saturday, you QC Monday)
- Surge orders (wedding batch of 20 arrives at once)
- Inspector absence (one person sick, queue builds)

---

### Throughput Check

| Inspector Output | Daily | Weekly (6 days) |
|------------------|-------|-----------------|
| Per inspector | 20-25 suits | 120-150 suits |
| 4 inspectors | 80-100 suits | 480-600 suits |

**Problem: 4 inspectors max out at ~600/week. You need 5-6 for 700/week.**

---

### Revised QC Staffing

| Role | Headcount | Monthly (INR) | Monthly (GBP) |
|------|-----------|---------------|---------------|
| QC Lead | 1 | 30,000 | £286 |
| QC Inspectors | 6 | 20,000 each | £1,143 |
| **QC Subtotal** | **7** | **150,000** | **£1,429** |

This adds 2 inspectors (£381/month) but ensures you hit 700/week throughput.



## Prompt:
1/19/2026, 3:41:30 PM

Ok now assume we are operating 24 hours a day and in 3 shifts of 8hrs



## Response:
1/19/2026, 3:42:00 PM

````plaintext
Thought process: Recalibrated capacity and staffing for round-the-clock operations.

The user wants me to recalculate the facility capacity and staffing based on 24-hour operation across 3 shifts of 8 hours each. This triples the effective capacity of the space and equipment, but also requires staffing for all three shifts.

Let me recalculate:

1. Facility capacity - the physical space can now process 3x the throughput since it's operating 24 hours
2. Staffing - need to multiply most roles by 3 for shift coverage
3. Equipment utilization - plotters, workstations run 24 hours
4. QC capacity - 3 shifts means 3x throughput

Let me work through this systematically.
````

## 24-Hour Operation (3 x 8-Hour Shifts)

---

### Shift Structure

| Shift | Hours (IST) | Focus |
|-------|-------------|-------|
| Day | 06:00 - 14:00 | Primary production, Raja deliveries |
| Evening | 14:00 - 22:00 | QC backlog, pattern generation |
| Night | 22:00 - 06:00 | Plotting, prep for next day |

---

### Facility Throughput (Tripled)

| Zone | Single Shift | 3 Shifts (24hr) |
|------|--------------|-----------------|
| Optitex Patterns | 45-60/day | 135-180/day |
| Plotter Output | 50-60/day | 150-180/day |
| QC Inspections | 100/day | 300/day |
| Packing | 100/day | 300/day |
| **Weekly Capacity** | **~700** | **~2,100** |

---

### QC Zone Recalculated

| Metric | Single Shift | 3 Shifts |
|--------|--------------|----------|
| Physical suit capacity | 736 suits | 736 suits (unchanged) |
| Daily throughput | 117 suits | 350 suits |
| Buffer | 6.3 days | **2.1 days** |

Space is now tighter but still workable - suits flow through faster, don't sit as long.

---

### Staffing by Shift

**Amritsar Facility**

| Role | Per Shift | x3 Shifts | Monthly/Person (INR) | Monthly Total (GBP) |
|------|-----------|-----------|----------------------|---------------------|
| Shift Supervisor | 1 | 3 | 35,000 | £1,000 |
| Optitex Operators | 2 | 6 | 25,000 | £1,429 |
| Plotter Operators | 1 | 3 | 18,000 | £514 |
| QC Inspectors | 3 | 9 | 20,000 | £1,714 |
| Packers | 2 | 6 | 15,000 | £857 |
| Shipping Coordinator | 1 | 3 | 18,000 | £514 |
| **Shift Subtotal** | **10** | **30** | | **£6,028** |

**Day Shift Only (No Night Coverage Needed)**

| Role | Headcount | Monthly (INR) | Monthly (GBP) |
|------|-----------|---------------|---------------|
| Operations Manager | 1 | 50,000 | £476 |
| QC Lead | 1 | 30,000 | £286 |
| **Day Only Subtotal** | **2** | | **£762** |

**Amritsar Total: 32 staff | £6,790/month**

---

### HQ / Remote (Unchanged)

| Role | Headcount | Monthly (GBP) |
|------|-----------|---------------|
| Founder/CEO | 1 | £0 (equity) |
| Customer Service | 2 | £5,000 |
| Tech/Product | 2 | £7,000 |
| Marketing | 1 | £3,000 |
| Finance/Admin | 1 | £2,500 |
| **HQ Subtotal** | **7** | **£17,500** |

---

### Updated Total Monthly Overhead

| Category | Single Shift | 3 Shifts (24hr) |
|----------|--------------|-----------------|
| Amritsar Staff | £3,210 (15 people) | £6,790 (32 people) |
| Facility Costs | £1,124 | £1,500 (higher utilities) |
| Plotter Consumables | £400 | £1,200 (3x usage) |
| HQ/Remote Staff | £17,500 | £17,500 |
| **TOTAL** | **£22,234** | **£26,990** |

---

### Capacity vs Overhead

| Scenario | Weekly Suits | Monthly Overhead | Overhead/Suit |
|----------|--------------|------------------|---------------|
| Single Shift (700/wk) | 700 | £22,234 | £7.94 |
| **3 Shifts (2,100/wk)** | **2,100** | **£26,990** | **£3.21** |

**Overhead drops 60% per suit by running 24 hours.**

---

### Updated Unit Economics (2,100/Week)

| Line | 700/wk (Single) | 2,100/wk (24hr) |
|------|-----------------|-----------------|
| Retained (before overhead) | £905.55 | £905.55 |
| Staff + Facility Overhead | (£7.94) | (£3.21) |
| **Final Retained** | **£897.61** | **£902.34** |

---

### Weekly/Monthly/Annual at 2,100/Week

| Period | Suits | Gross Revenue | Final Retained |
|--------|-------|---------------|----------------|
| Weekly | 2,100 | £3,150,000 | £1,894,914 |
| Monthly | 8,400 | £12,600,000 | £7,579,656 |
| Annual | 109,200 | £163,800,000 | £98,535,528 |

---

### Total Headcount Summary

| Location | Single Shift | 3 Shifts (24hr) |
|----------|--------------|-----------------|
| Amritsar | 15 | 32 |
| HQ/Remote | 7 | 7 |
| **TOTAL SUIT AI STAFF** | **22** | **39** |

---

### The Trade-Off

| Factor | Single Shift | 3 Shifts |
|--------|--------------|----------|
| Weekly capacity | 700 | 2,100 |
| Staff headcount | 22 | 39 |
| Monthly payroll | £22,234 | £26,990 |
| Overhead per suit | £7.94 | £3.21 |
| Management complexity | Low | Medium (shift handovers, night supervision) |
| Equipment wear | Normal | 3x (maintenance schedule needed) |

Running 24 hours nearly triples output while only increasing overhead by 21%. The economics strongly favor multi-shift operation once demand exceeds 700/week.



## Prompt:
1/19/2026, 3:48:47 PM

You totally missed the point, with more floorspace we have more suit capacity, you are holding onto the 700 figure like it's precious, but with more floorspace and 24 operations we don't keep the 700 suit figure , assume that staff change their jobs and never sleep....we scale the capacity relevant to the floorspace increasing from the assumed  2500 square feet to measured 4000 square feet



## Response:
1/19/2026, 3:49:58 PM

````plaintext
Thought process: Recalibrated capacity scaling by abandoning arbitrary constraints and proportioning to actual space.

The user is right - I was anchored on 700 suits as if it were a constraint. Let me recalculate from first principles:

1. Original assumption was 2500 sq ft → 700 suits/week capacity
2. Actual space is 4000 sq ft → 60% more space
3. Running 24 hours (3 shifts) → 3x time utilization

So the capacity should scale:
- Space multiplier: 4000/2500 = 1.6x
- Time multiplier: 3 shifts = 3x
- Combined: 1.6 x 3 = 4.8x

700 x 4.8 = 3,360 suits/week

But let me think about this more carefully - what actually constrains throughput?

The floor space affects:
- QC zone capacity (how many suits can be held/processed)
- Plotter space (how many plotters)
- Packing stations
- Storage

The 24-hour operation affects:
- How many times the space "turns over" per day
- Staff utilization

Let me recalculate the QC capacity properly:

Original assumption (implied): 2500 sq ft total, with some portion for QC
New actual: 4000 sq ft total, 800 sq ft for QC

The space increase from 2500 to 4000 is 1.6x

But the 700/week figure was based on what? Let me think:
- 700/week = 117/day (6-day week)
- Single shift QC: 4 inspectors × 25 suits = 100/day max

So the constraint was actually the QC throughput, not the physical space.

With 4000 sq ft and 24-hour operation:
- QC zone: 800 sq ft
- Physical capacity: 736 suits at any time
- 3 shifts of QC inspectors: each shift can process 100 suits


- Daily throughput: 300 suits/day
- Weekly (6 days): 1,800 suits
- Weekly (7 days, 24 hours): 2,100 suits

Now the real question is whether space or staffing is the limiting factor. If I scale up inspectors to match the available space, the 800 sq ft QC zone could theoretically hold and process many more suits per shift, so the throughput per square foot becomes the key metric to understand how much capacity actually increases with the larger facility.

The physical space can hold around 736 suits at once, and if they're moving through in 8-hour cycles, that's potentially 2,200-2,900 suits daily just based on holding capacity. However, inspection time is what really constrains this—one inspector processes about 25 suits per 8-hour shift, or 75 across three shifts. With four inspection stations, that caps us at 300 daily, which translates to the 1,800-2,100 weekly figures I calculated earlier.

To actually utilize the full 800 sq ft QC zone with 736 suits present, I'd need to reduce the average dwell time to around 4 hours per suit, which would require significantly more inspection capacity than currently exists. suits/day. Weekly output reaches 2,100 suits with this setup.

For packing, I'm allocating 600 sq ft with 4 stations handling 30 suits per shift across three shifts, giving 90 suits per station daily and 360 total daily—2,520 weekly.

The constraint becomes QC at 2,100 suits weekly. Given the 4,000 sq ft space versus the original 2,500 sq ft baseline, I should scale proportionally: 700 suits weekly × 1.6 (the space ratio) yields 1,120 for a single shift. Extending to 24-hour operation multiplies this by 3, reaching approximately 3,360 suits weekly as a realistic target.

Testing this against QC capacity: 3,360 weekly translates to 480 daily across a 7-day operation. Dividing by three shifts gives 160 suits per shift. At 25 suits per inspector per shift, I need roughly 7 inspectors per shift, or 21 total positions. Seven inspection tables at 50 sq ft each consume 350 sq ft, with another 450 sq ft for suit staging and rails—fitting within an 800 sq ft QC area.

The numbers suggest this is achievable. Rather than continuing to adjust incrementally, I should determine what the physical space actually supports and staff the operation accordingly.
````

## Recalculated: 4000 Sq Ft + 24-Hour Operation

---

### First Principles: Space Drives Capacity

| Metric | Original Assumption | Actual |
|--------|---------------------|--------|
| Floor space | 2,500 sq ft | 4,000 sq ft |
| Operating hours | 8 hrs (1 shift) | 24 hrs (3 shifts) |
| **Space multiplier** | 1x | **1.6x** |
| **Time multiplier** | 1x | **3x** |
| **Combined multiplier** | 1x | **4.8x** |

**Baseline 700 x 4.8 = 3,360 suits/week**

---

### Zone Allocation (4000 Sq Ft)

| Zone | Sq Ft | Function | Throughput Driver |
|------|-------|----------|-------------------|
| QC Inspection | 1,200 | 8 tables + rails | 600 suits/day |
| Plotter Room | 600 | 3 plotters + paper | 540 patterns/day |
| Packing/Shipping | 700 | 6 stations | 540 suits/day |
| Optitex Workstations | 400 | 6 stations | 540 patterns/day |
| Fabric Holding | 500 | Tagged wedding stock | 1,000+ suits worth |
| Pattern Archive | 200 | Remakes reference | - |
| Ops Office | 200 | Management, admin | - |
| Restrooms/Utilities | 200 | - | - |
| **TOTAL** | **4,000** | | |

---

### QC Zone Capacity (1,200 Sq Ft)

| Element | Qty | Suits/Unit | Total |
|---------|-----|------------|-------|
| Inspection Tables | 8 | 4 (active) | 32 |
| Incoming Rails | 15 | 40 | 600 |
| Passed Rails | 10 | 40 | 400 |
| Rework Rails | 3 | 40 | 120 |
| **Physical Capacity** | | | **1,152 suits** |

**Throughput (24hr):**
- 8 inspectors per shift x 25 suits = 200/shift
- 3 shifts = 600 suits/day
- 6-day week = **3,600 suits/week**

---

### Plotter Room (600 Sq Ft)

| Element | Qty | Output/Day (24hr) |
|---------|-----|-------------------|
| Plotters | 3 | 180 each = 540 |
| Paper Storage | - | 2-week supply |
| Cutting Table | 1 | Pattern prep |

**Weekly: 3,240 patterns**

---

### Packing/Shipping (700 Sq Ft)

| Element | Qty | Output/Day (24hr) |
|---------|-----|-------------------|
| Packing Stations | 6 | 90 each = 540 |
| Box Storage | - | 1-week supply |
| Dispatch Staging | - | 200 parcels |

**Weekly: 3,240 suits packed**

---

### Bottleneck Analysis

| Zone | Daily Capacity | Weekly (6-day) | Constraint? |
|------|----------------|----------------|-------------|
| Optitex | 540 | 3,240 | No |
| Plotters | 540 | 3,240 | No |
| QC | 600 | 3,600 | No |
| Packing | 540 | 3,240 | **YES** |

**Facility capacity: 3,240 suits/week**

Add a 7th packing station or run 7 days: **3,600 suits/week**

---

### Staffing for 3,360 Suits/Week

**Per Shift (8 hours)**

| Role | Headcount | Function |
|------|-----------|----------|
| Shift Supervisor | 1 | Floor management |
| Optitex Operators | 2 | Pattern generation |
| Plotter Operators | 2 | Print + prep |
| QC Inspectors | 8 | Inspection |
| Packers | 3 | Box + documentation |
| Shipping Coordinator | 1 | AWB, dispatch |
| **Per Shift Total** | **17** | |

**x 3 Shifts = 51 staff**

**Day Only (Management)**

| Role | Headcount |
|------|-----------|
| Operations Manager | 1 |
| QC Lead | 1 |
| Facilities/Maintenance | 1 |
| **Day Only Total** | **3** |

**Amritsar Total: 54 staff**

---

### Payroll (Amritsar)

| Role | Headcount | Monthly/Person (INR) | Total (INR) | Total (GBP) |
|------|-----------|----------------------|-------------|-------------|
| Operations Manager | 1 | 50,000 | 50,000 | £476 |
| QC Lead | 1 | 30,000 | 30,000 | £286 |
| Facilities | 1 | 20,000 | 20,000 | £190 |
| Shift Supervisors | 3 | 35,000 | 105,000 | £1,000 |
| Optitex Operators | 6 | 25,000 | 150,000 | £1,429 |
| Plotter Operators | 6 | 18,000 | 108,000 | £1,029 |
| QC Inspectors | 24 | 20,000 | 480,000 | £4,571 |
| Packers | 9 | 15,000 | 135,000 | £1,286 |
| Shipping Coordinators | 3 | 18,000 | 54,000 | £514 |
| **Amritsar Total** | **54** | | **1,132,000** | **£10,781** |

---

### HQ / Remote

| Role | Headcount | Monthly (GBP) |
|------|-----------|---------------|
| Founder/CEO | 1 | £0 |
| Customer Service | 4 | £10,000 |
| Tech/Product | 3 | £10,500 |
| Marketing | 2 | £6,000 |
| Finance/Admin | 2 | £5,000 |
| **HQ Total** | **12** | **£31,500** |

---

### Facility Costs (24hr Operation)

| Item | Monthly (INR) | Monthly (GBP) |
|------|---------------|---------------|
| Rent (4000 sq ft @ 25/sq ft) | 100,000 | £952 |
| Electricity (24hr) | 45,000 | £429 |
| Internet/Comms | 8,000 | £76 |
| Maintenance | 20,000 | £190 |
| Security (24hr) | 25,000 | £238 |
| **Facility Total** | **198,000** | **£1,885** |

**Equipment Consumables (Monthly)**

| Item | Monthly (GBP) |
|------|---------------|
| Plotter paper + ink (3 plotters, 24hr) | £1,800 |
| Packaging materials | £2,000 |
| **Consumables Total** | **£3,800** |

---

### Total Monthly Overhead

| Category | Monthly (GBP) |
|----------|---------------|
| Amritsar Staff (54) | £10,781 |
| Facility Costs | £1,885 |
| Consumables | £3,800 |
| HQ Staff (12) | £31,500 |
| **TOTAL** | **£47,966** |

---

### Unit Economics at 3,360/Week

| Line | Amount |
|------|--------|
| Retained (before overhead) | £905.55 |
| Monthly overhead | £47,966 |
| Monthly suits | 13,440 |
| **Overhead per suit** | **£3.57** |
| **Final Retained** | **£901.98** |

---

### Summary Comparison

| Metric | 700/wk (Old) | 3,360/wk (New) |
|--------|--------------|----------------|
| Floor space | 2,500 sq ft | 4,000 sq ft |
| Shifts | 1 | 3 |
| SUIT AI Staff | 22 | 66 |
| Monthly Overhead | £22,234 | £47,966 |
| Overhead/Suit | £7.94 | £3.57 |
| Final Retained/Suit | £897.61 | £901.98 |
| **Weekly Retained** | **£628,327** | **£3,030,653** |
| **Monthly Retained** | **£2,513,308** | **£12,122,611** |
| **Annual Retained** | **£32,673,004** | **£157,593,943** |

---

### CapEx Update (3 Plotters + Expanded Stations)

| Item | Qty | Unit (INR) | Total (INR) | Total (GBP) |
|------|-----|------------|-------------|-------------|
| Plotter | 3 | 250,000 | 750,000 | £7,143 |
| Optitex Workstations | 6 | 75,000 | 450,000 | £4,286 |
| QC Tables + Lighting | 8 | 8,000 | 64,000 | £610 |
| Packing Stations | 6 | 10,000 | 60,000 | £571 |
| Garment Rails | 30 | 5,000 | 150,000 | £1,429 |
| Office/Furniture | - | - | 80,000 | £762 |
| **CapEx Total** | | | **1,554,000** | **£14,800** |

**Payback: 17 suits**



## Prompt:
1/19/2026, 4:31:38 PM

Inspectiors can do more than 25 suits per day, an inspection takes 15 mins, we give 1 hr of break time broken into 30 mins for lunch and 3 10 minute tea breaks per shift



## Response:
1/19/2026, 4:32:10 PM

````plaintext
Thought process: Recalculated inspector throughput accounting for break time deductions.

The user is correcting my QC inspector throughput calculation. Let me recalculate:

Per shift: 8 hours = 480 minutes
Break time: 30 mins lunch + 3x10 mins tea = 60 minutes
Working time: 480 - 60 = 420 minutes

Inspection time: 15 minutes per suit
Suits per inspector per shift: 420 / 15 = 28 suits

So 28 suits per inspector per shift, not 25.

This changes the QC capacity significantly. Let me recalculate everything.
````

## QC Inspector Throughput Recalculated

---

### Time Analysis Per Shift

| Component | Minutes |
|-----------|---------|
| Shift length | 480 |
| Lunch break | (30) |
| Tea breaks (3 x 10) | (30) |
| **Working time** | **420** |

**Inspection time: 15 mins/suit**

**Suits per inspector per shift: 420 / 15 = 28 suits**

---

### QC Capacity Impact

| Metric | Old (25/inspector) | Corrected (28/inspector) |
|--------|--------------------|--------------------------:|
| Per inspector/shift | 25 | 28 |
| Per inspector/day (3 shifts) | 75 | 84 |
| 8 inspectors/shift x 3 shifts | 600/day | **672/day** |
| 6-day week | 3,600 | **4,032** |

---

### New Bottleneck Analysis

| Zone | Daily Capacity | Weekly (6-day) |
|------|----------------|----------------|
| Optitex (6 stations, 24hr) | 540 | 3,240 |
| Plotters (3 units, 24hr) | 540 | 3,240 |
| QC (8 inspectors/shift, 24hr) | 672 | 4,032 |
| Packing (6 stations, 24hr) | 540 | 3,240 |

**Bottleneck: Optitex + Plotters + Packing at 540/day**

QC is no longer the constraint. We have headroom.

---

### Option A: Match Current Bottleneck (3,240/week)

Reduce QC inspectors since they're overprovisioned:

| Inspectors/Shift | Daily Output | Utilization |
|------------------|--------------|-------------|
| 8 | 672 | 80% (wasteful) |
| 7 | 588 | 92% |
| **6** | **504** | **93% (tight but ok)** |

**Revised: 6 inspectors/shift x 3 shifts = 18 QC inspectors (was 24)**

Saves: 6 x £190/month = **£1,140/month**

---

### Option B: Expand to Match QC Capacity (4,032/week)

Add equipment to unlock full QC throughput:

| Zone | Current | Required for 672/day | Add |
|------|---------|----------------------|-----|
| Optitex stations | 6 | 8 | +2 |
| Plotters | 3 | 4 | +1 |
| Packing stations | 6 | 8 | +2 |

**Additional CapEx:**

| Item | Qty | Cost (GBP) |
|------|-----|------------|
| Optitex workstations | 2 | £1,429 |
| Plotter | 1 | £2,381 |
| Packing stations | 2 | £190 |
| **Total** | | **£4,000** |

**Additional Staff (per shift):**

| Role | Add/Shift | x3 Shifts | Monthly (GBP) |
|------|-----------|-----------|---------------|
| Optitex Operators | +1 | +3 | £714 |
| Plotter Operators | +1 | +3 | £514 |
| Packers | +1 | +3 | £429 |
| **Total** | | **+9** | **£1,657** |

---

### Revised Numbers (Option B: 4,032/week)

**Staffing**

| Role | Headcount | Monthly (GBP) |
|------|-----------|---------------|
| Operations Manager | 1 | £476 |
| QC Lead | 1 | £286 |
| Facilities | 1 | £190 |
| Shift Supervisors | 3 | £1,000 |
| Optitex Operators | 9 | £2,143 |
| Plotter Operators | 9 | £1,543 |
| QC Inspectors | 24 | £4,571 |
| Packers | 12 | £1,714 |
| Shipping Coordinators | 3 | £514 |
| **Amritsar Total** | **63** | **£12,437** |

**HQ: 12 staff | £31,500/month**

**Total SUIT AI Staff: 75**

---

### Updated Monthly Overhead

| Category | Monthly (GBP) |
|----------|---------------|
| Amritsar Staff (63) | £12,437 |
| Facility Costs | £1,885 |
| Consumables (4 plotters) | £4,200 |
| HQ Staff (12) | £31,500 |
| **TOTAL** | **£50,022** |

---

### Unit Economics at 4,032/Week

| Line | Amount |
|------|--------|
| Retained (before overhead) | £905.55 |
| Monthly overhead | £50,022 |
| Monthly suits | 16,128 |
| **Overhead per suit** | **£3.10** |
| **Final Retained** | **£902.45** |

---

### Final Summary

| Metric | 700/wk (Original) | 4,032/wk (Full Capacity) |
|--------|-------------------|--------------------------|
| Floor space | 2,500 sq ft | 4,000 sq ft |
| Shifts | 1 | 3 |
| SUIT AI Staff | 22 | 75 |
| Monthly Overhead | £22,234 | £50,022 |
| Overhead/Suit | £7.94 | £3.10 |
| Final Retained/Suit | £897.61 | £902.45 |
| **Weekly Retained** | **£628,327** | **£3,639,481** |
| **Monthly Retained** | **£2,513,308** | **£14,557,922** |
| **Annual Retained** | **£32,673,004** | **£189,252,998** |

---

### CapEx (Full Build)

| Item | Qty | Total (GBP) |
|------|-----|-------------|
| Plotters | 4 | £9,524 |
| Optitex Workstations | 9 | £6,429 |
| QC Tables + Lighting | 8 | £610 |
| Packing Stations | 8 | £762 |
| Garment Rails | 30 | £1,429 |
| Office/Furniture | - | £762 |
| **CapEx Total** | | **£19,516** |

**Payback: 22 suits**



## Prompt:
1/19/2026, 4:32:25 PM

Option a



## Response:
1/19/2026, 4:32:43 PM

````plaintext
Thought process: Recalibrated production metrics and streamlined workforce allocation.

The user wants Option A - matching the current bottleneck at 3,240 suits/week with reduced QC inspectors (6 per shift instead of 8, saving on headcount since QC is not the bottleneck).

Let me recalculate everything cleanly for Option A.
````

## Option A: 3,240 Suits/Week (Bottleneck-Matched)

---

### Bottleneck Constraints

| Zone | Daily Capacity | Weekly (6-day) |
|------|----------------|----------------|
| Optitex (6 stations) | 540 | 3,240 |
| Plotters (3 units) | 540 | 3,240 |
| Packing (6 stations) | 540 | 3,240 |
| **QC (6 inspectors/shift)** | **504** | **3,024** |

QC at 6/shift is slightly under. **Go with 7 inspectors/shift** for buffer:

7 inspectors x 28 suits x 3 shifts = **588/day = 3,528/week**

Comfortable headroom above 3,240.

---

### Staffing (Option A)

**Per Shift**

| Role | Headcount |
|------|-----------|
| Shift Supervisor | 1 |
| Optitex Operators | 2 |
| Plotter Operators | 2 |
| QC Inspectors | 7 |
| Packers | 3 |
| Shipping Coordinator | 1 |
| **Per Shift** | **16** |

**x 3 Shifts = 48**

**Day Only (Management)**

| Role | Headcount |
|------|-----------|
| Operations Manager | 1 |
| QC Lead | 1 |
| Facilities | 1 |
| **Day Only** | **3** |

**Amritsar Total: 51 staff**

---

### Payroll (Amritsar)

| Role | Headcount | Monthly (INR) | Monthly (GBP) |
|------|-----------|---------------|---------------|
| Operations Manager | 1 | 50,000 | £476 |
| QC Lead | 1 | 30,000 | £286 |
| Facilities | 1 | 20,000 | £190 |
| Shift Supervisors | 3 | 105,000 | £1,000 |
| Optitex Operators | 6 | 150,000 | £1,429 |
| Plotter Operators | 6 | 108,000 | £1,029 |
| QC Inspectors | 21 | 420,000 | £4,000 |
| Packers | 9 | 135,000 | £1,286 |
| Shipping Coordinators | 3 | 54,000 | £514 |
| **Amritsar Total** | **51** | **1,072,000** | **£10,210** |

---

### HQ / Remote

| Role | Headcount | Monthly (GBP) |
|------|-----------|---------------|
| Founder/CEO | 1 | £0 |
| Customer Service | 4 | £10,000 |
| Tech/Product | 3 | £10,500 |
| Marketing | 2 | £6,000 |
| Finance/Admin | 2 | £5,000 |
| **HQ Total** | **12** | **£31,500** |

---

### Total Monthly Overhead

| Category | Monthly (GBP) |
|----------|---------------|
| Amritsar Staff (51) | £10,210 |
| Facility Costs | £1,885 |
| Consumables (3 plotters) | £3,800 |
| HQ Staff (12) | £31,500 |
| **TOTAL** | **£47,395** |

---

### Unit Economics (3,240/Week)

| Line | Amount |
|------|--------|
| Retained (before overhead) | £905.55 |
| Monthly suits | 12,960 |
| Monthly overhead | £47,395 |
| **Overhead per suit** | **£3.66** |
| **Final Retained** | **£901.89** |

---

### Final Numbers

| Metric | Value |
|--------|-------|
| Weekly suits | 3,240 |
| Monthly suits | 12,960 |
| Annual suits | 168,480 |
| | |
| **Total SUIT AI Staff** | **63** |
| Amritsar | 51 |
| HQ/Remote | 12 |
| | |
| Monthly overhead | £47,395 |
| Overhead per suit | £3.66 |
| Final retained per suit | £901.89 |
| | |
| **Weekly retained** | **£2,922,124** |
| **Monthly retained** | **£11,688,498** |
| **Annual retained** | **£151,950,469** |

---

### CapEx (Option A)

| Item | Qty | Total (GBP) |
|------|-----|-------------|
| Plotters | 3 | £7,143 |
| Optitex Workstations | 6 | £4,286 |
| QC Tables + Lighting | 8 | £610 |
| Packing Stations | 6 | £571 |
| Garment Rails | 28 | £1,333 |
| Office/Furniture | - | £762 |
| **CapEx Total** | | **£14,705** |

**Payback: 17 suits**



## Prompt:
1/19/2026, 4:35:24 PM

We are building an automated optitex pipeline, reduce the optitex operators by one per shift



## Response:
1/19/2026, 4:35:40 PM

````plaintext
Thought process: Recalibrated staffing levels and quantified automation savings.

The user wants to reduce Optitex operators from 2 per shift to 1 per shift due to automation. Let me recalculate the staffing and costs.

Current: 6 Optitex Operators (2 per shift x 3 shifts)
New: 3 Optitex Operators (1 per shift x 3 shifts)

Savings: 3 operators x 25,000 INR = 75,000 INR/month = £714/month
````

## Option A: Automated Optitex Pipeline

---

### Staffing (Revised)

**Per Shift**

| Role | Previous | Revised |
|------|----------|---------|
| Shift Supervisor | 1 | 1 |
| Optitex Operators | 2 | **1** |
| Plotter Operators | 2 | 2 |
| QC Inspectors | 7 | 7 |
| Packers | 3 | 3 |
| Shipping Coordinator | 1 | 1 |
| **Per Shift** | **16** | **15** |

**x 3 Shifts = 45**

**Day Only: 3**

**Amritsar Total: 48 staff**

---

### Payroll (Amritsar)

| Role | Headcount | Monthly (INR) | Monthly (GBP) |
|------|-----------|---------------|---------------|
| Operations Manager | 1 | 50,000 | £476 |
| QC Lead | 1 | 30,000 | £286 |
| Facilities | 1 | 20,000 | £190 |
| Shift Supervisors | 3 | 105,000 | £1,000 |
| Optitex Operators | **3** | **75,000** | **£714** |
| Plotter Operators | 6 | 108,000 | £1,029 |
| QC Inspectors | 21 | 420,000 | £4,000 |
| Packers | 9 | 135,000 | £1,286 |
| Shipping Coordinators | 3 | 54,000 | £514 |
| **Amritsar Total** | **48** | **997,000** | **£9,495** |

---

### Total Monthly Overhead

| Category | Previous | Revised |
|----------|----------|---------|
| Amritsar Staff | £10,210 (51) | **£9,495 (48)** |
| Facility Costs | £1,885 | £1,885 |
| Consumables | £3,800 | £3,800 |
| HQ Staff | £31,500 (12) | £31,500 (12) |
| **TOTAL** | **£47,395** | **£46,680** |

**Savings: £715/month**

---

### Unit Economics (3,240/Week)

| Line | Amount |
|------|--------|
| Retained (before overhead) | £905.55 |
| Monthly suits | 12,960 |
| Monthly overhead | £46,680 |
| **Overhead per suit** | **£3.60** |
| **Final Retained** | **£901.95** |

---

### Final Numbers

| Metric | Value |
|--------|-------|
| Weekly suits | 3,240 |
| Monthly suits | 12,960 |
| Annual suits | 168,480 |
| | |
| **Total SUIT AI Staff** | **60** |
| Amritsar | 48 |
| HQ/Remote | 12 |
| | |
| Monthly overhead | £46,680 |
| Overhead per suit | £3.60 |
| Final retained per suit | £901.95 |
| | |
| **Weekly retained** | **£2,924,321** |
| **Monthly retained** | **£11,697,283** |
| **Annual retained** | **£152,064,684** |

---

### Optitex Operator Role Change

With automation, the 1 operator per shift becomes:

| Responsibility | Manual (Old) | Automated (New) |
|----------------|--------------|-----------------|
| Input measurements | Manual entry | API receives from scan |
| Run pattern generation | Click and wait | Auto-triggered on scan complete |
| Export 3D mesh | Manual export | Auto-export to CDN |
| Export PDF marker | Manual export | Auto-queue to plotter |
| Handle exceptions | - | **Primary role** |
| Monitor queue | - | **Primary role** |
| Override failures | - | **Primary role** |

The operator becomes a **Pipeline Monitor** rather than a processor.



## Prompt:
1/19/2026, 4:39:12 PM

Rent is 440000inr pm



## Response:
1/19/2026, 4:39:25 PM

````plaintext
Thought process: Recalibrated financial projections with updated rental expense.

The user is updating the rent from the assumed 100,000 INR to the actual 440,000 INR per month. I need to recalculate the facility costs and update all the downstream numbers.
````

## Updated: Rent @ ₹440,000/month

---

### Facility Costs (Revised)

| Item | Previous (INR) | Revised (INR) | Monthly (GBP) |
|------|----------------|---------------|---------------|
| Rent | 100,000 | **440,000** | **£4,190** |
| Electricity (24hr) | 45,000 | 45,000 | £429 |
| Internet/Comms | 8,000 | 8,000 | £76 |
| Maintenance | 20,000 | 20,000 | £190 |
| Security (24hr) | 25,000 | 25,000 | £238 |
| **Facility Total** | **198,000** | **538,000** | **£5,124** |

---

### Total Monthly Overhead

| Category | Previous | Revised |
|----------|----------|---------|
| Amritsar Staff (48) | £9,495 | £9,495 |
| Facility Costs | £1,885 | **£5,124** |
| Consumables | £3,800 | £3,800 |
| HQ Staff (12) | £31,500 | £31,500 |
| **TOTAL** | **£46,680** | **£49,919** |

**Increase: £3,239/month**

---

### Unit Economics (3,240/Week)

| Line | Previous | Revised |
|------|----------|---------|
| Retained (before overhead) | £905.55 | £905.55 |
| Monthly suits | 12,960 | 12,960 |
| Monthly overhead | £46,680 | £49,919 |
| **Overhead per suit** | **£3.60** | **£3.85** |
| **Final Retained** | **£901.95** | **£901.70** |

---

### Final Numbers

| Metric | Value |
|--------|-------|
| Weekly suits | 3,240 |
| Monthly suits | 12,960 |
| Annual suits | 168,480 |
| | |
| **Total SUIT AI Staff** | **60** |
| Amritsar | 48 |
| HQ/Remote | 12 |
| | |
| Monthly overhead | £49,919 |
| Overhead per suit | £3.85 |
| Final retained per suit | £901.70 |
| | |
| **Weekly retained** | **£2,921,508** |
| **Monthly retained** | **£11,686,032** |
| **Annual retained** | **£151,918,416** |

---

### Rent Reality Check

| Metric | Value |
|--------|-------|
| Rent | ₹440,000 / £4,190 per month |
| Rate | ₹110/sq ft/month |
| Suits to cover rent | 5 suits |
| % of monthly revenue | 0.03% |

The rent increase costs £3,239/month but at 12,960 suits/month, it adds only **25p per suit**. Negligible impact on unit economics.



## Prompt:
1/19/2026, 6:31:55 PM

what is our daily capacity?



## Response:
1/19/2026, 6:32:07 PM

````plaintext
Thought process: Synthesized weekly metrics to derive daily capacity.

The user is asking for the daily capacity based on the Option A configuration we've been discussing.

From our calculations:
- Weekly capacity: 3,240 suits
- Operating 6 days per week

Daily capacity = 3,240 / 6 = 540 suits/day
````

## Daily Capacity

| Metric | Value |
|--------|-------|
| Weekly capacity | 3,240 suits |
| Operating days | 6 days |
| **Daily capacity** | **540 suits** |

---

### By Shift

| Shift | Hours | Suits |
|-------|-------|-------|
| Day (06:00-14:00) | 8 | 180 |
| Evening (14:00-22:00) | 8 | 180 |
| Night (22:00-06:00) | 8 | 180 |
| **Total** | **24** | **540** |

---

### Bottleneck Breakdown (Per Day)

| Zone | Capacity | Utilization |
|------|----------|-------------|
| Optitex (6 stations) | 540 | 100% |
| Plotters (3 units) | 540 | 100% |
| Packing (6 stations) | 540 | 100% |
| QC (21 inspectors) | 588 | 92% |

Optitex, plotters, and packing are the ceiling. QC has 48 suits/day headroom for surge absorption.





---
Powered by [Claude Exporter](https://www.ai-chat-exporter.net)