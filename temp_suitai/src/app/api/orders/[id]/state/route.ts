import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  validateStateTransition,
  getValidNextStates,
  STATE_LABELS,
  Track,
} from "@/lib/orders/state-machine";

// Validation schema for state update
const StateUpdateSchema = z.object({
  state: z.string(),
  notes: z.string().optional(),
  location: z.string().optional(),
  coords: z.string().optional(),
});

/**
 * PATCH /api/orders/[id]/state
 * Update order state with track-aware validation
 *
 * Phase B Extension: Supports S20-S26 logistics states for Track B orders
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = StateUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const { state: newState, notes, location, coords } = validationResult.data;

    // Get current order with track info
    const currentOrder = await prisma.order.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        status: true,
        track: true,
        flightId: true,
      },
    });

    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const currentState = currentOrder.status;
    const track = (currentOrder.track || "A") as Track;

    // Validate the state transition using track-aware logic
    const validation = validateStateTransition(currentState, newState, track);

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Invalid state transition",
          message: validation.error,
          currentState,
          requestedState: newState,
          validOptions: validation.validOptions?.map((s) => ({
            state: s,
            label: STATE_LABELS[s] || s,
          })),
        },
        { status: 400 },
      );
    }

    // Perform the state update in a transaction with timeline entry
    const result = await prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: params.id },
        data: { status: newState },
      });

      // Create timeline entry for audit trail (if SuitTimeline model exists)
      try {
        // Find associated order items to create timeline entries
        const orderItems = await tx.orderItem.findMany({
          where: { orderId: params.id },
          select: { id: true },
        });

        // Create timeline entries for each order item
        for (const item of orderItems) {
          await tx.suitTimeline.create({
            data: {
              orderItemId: item.id,
              fromState: currentState,
              toState: newState,
              changedBy: "api", // Could be enhanced with auth context
              location: location,
              coords: coords,
              notes: notes,
            },
          });
        }
      } catch (e) {
        // SuitTimeline might not exist yet in all environments
        console.log("Timeline entry skipped (model may not exist)");
      }

      return updatedOrder;
    });

    // Trigger side effects for Phase B logistics states
    await triggerStateSideEffects(params.id, currentState, newState, track);

    return NextResponse.json(
      {
        id: result.id,
        previousState: currentState,
        state: result.status,
        track: track,
        updatedAt: result.updatedAt,
        label: STATE_LABELS[result.status] || result.status,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("State update endpoint error:", error);

    // Handle not found error
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/orders/[id]/state
 * Get current state and valid transitions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        status: true,
        track: true,
        updatedAt: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const track = (order.track || "A") as Track;
    const validNextStates = getValidNextStates(order.status, track);

    return NextResponse.json({
      id: order.id,
      currentState: order.status,
      currentStateLabel: STATE_LABELS[order.status] || order.status,
      track: track,
      validTransitions: validNextStates.map((s) => ({
        state: s,
        label: STATE_LABELS[s] || s,
      })),
      updatedAt: order.updatedAt,
    });
  } catch (error) {
    console.error("State GET endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Trigger side effects for Phase B logistics state transitions
 */
async function triggerStateSideEffects(
  orderId: string,
  fromState: string,
  toState: string,
  track: Track,
): Promise<void> {
  // Only trigger for Track B logistics states
  if (track !== "B") return;

  try {
    switch (toState) {
      case "S20_FLIGHT_MANIFEST":
        // TODO: Create or update flight manifest entry
        console.log(`[SIDE EFFECT] Order ${orderId}: Added to flight manifest`);
        break;

      case "S21_IN_FLIGHT":
        // TODO: Update flight status, notify stakeholders
        console.log(`[SIDE EFFECT] Order ${orderId}: In flight notification`);
        break;

      case "S22_LANDED":
        // TODO: Trigger customs preparation notification
        console.log(`[SIDE EFFECT] Order ${orderId}: Landed, customs prep`);
        break;

      case "S23_CUSTOMS_CLEARED":
        // TODO: Notify dispatch team
        console.log(`[SIDE EFFECT] Order ${orderId}: Customs cleared`);
        break;

      case "S24_VAN_ASSIGNED":
        // TODO: Run VRPTW optimization, assign van
        console.log(`[SIDE EFFECT] Order ${orderId}: Van assignment triggered`);
        break;

      case "S25_OUT_FOR_DELIVERY":
        // TODO: Send customer notification with ETA
        console.log(
          `[SIDE EFFECT] Order ${orderId}: Out for delivery notification`,
        );
        break;

      case "S26_DELIVERED_UAE":
        // TODO: Trigger delivery confirmation, tailor payout
        console.log(
          `[SIDE EFFECT] Order ${orderId}: Delivery confirmed, trigger payout`,
        );
        break;
    }
  } catch (error) {
    // Log but don't fail the state transition for side effect errors
    console.error(`Side effect error for ${toState}:`, error);
  }
}
