import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getValidNextStates,
  getStateLabel,
  Track,
  TERMINAL_STATES,
} from "@/lib/orders/state-machine";

/**
 * GET /api/orders/[id]/valid-transitions
 *
 * Returns the current state and all valid next states for an order.
 * Now track-aware: Track A shows UK delivery path, Track B shows UAE logistics path.
 *
 * Phase B Extension: Supports S20-S26 logistics states for Track B orders
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing order ID
 * @returns JSON response with current state and valid transitions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Fetch order from database with track info
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      select: {
        status: true,
        track: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const currentState = order.status;
    const track = (order.track || "A") as Track;

    // Get track-aware valid next states
    const validNext = getValidNextStates(currentState, track);

    // Determine if order is in terminal state
    const isTerminal = currentState === TERMINAL_STATES[track];

    return NextResponse.json(
      {
        current_state: currentState,
        current_label: getStateLabel(currentState),
        track: track,
        is_terminal: isTerminal,
        terminal_state: TERMINAL_STATES[track],
        valid_transitions: validNext.map((state) => ({
          state,
          label: getStateLabel(state),
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Valid transitions endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
