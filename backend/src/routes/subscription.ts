import { Hono } from "hono";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";
import type { HonoVariables } from "../context";
import { StartTrialSchema } from "../types";

const subscriptionRouter = new Hono<{ Variables: HonoVariables }>();

// Apply auth middleware to all routes
subscriptionRouter.use("/*", requireAuth);

function serializeSubscription(sub: {
  id: string;
  userId: string;
  plan: string;
  status: string;
  trialEndsAt: Date | null;
  currentPeriodEndsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: sub.id,
    userId: sub.userId,
    plan: sub.plan,
    status: sub.status,
    trialEndsAt: sub.trialEndsAt?.toISOString() ?? null,
    currentPeriodEndsAt: sub.currentPeriodEndsAt?.toISOString() ?? null,
    createdAt: sub.createdAt.toISOString(),
    updatedAt: sub.updatedAt.toISOString(),
  };
}

// GET /api/subscription - Get current subscription
subscriptionRouter.get("/", async (c) => {
  const user = c.get("user");

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  if (!subscription) {
    return c.json({ data: null });
  }

  // Check if trial/subscription has expired
  const now = new Date();
  if (
    subscription.status === "active" &&
    subscription.plan === "trial" &&
    subscription.trialEndsAt &&
    subscription.trialEndsAt < now
  ) {
    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "expired" },
    });
    return c.json({ data: serializeSubscription(updated) });
  }

  if (
    subscription.status === "active" &&
    subscription.plan !== "trial" &&
    subscription.currentPeriodEndsAt &&
    subscription.currentPeriodEndsAt < now
  ) {
    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "expired" },
    });
    return c.json({ data: serializeSubscription(updated) });
  }

  return c.json({ data: serializeSubscription(subscription) });
});

// POST /api/subscription/start - Start a subscription (mock payment)
subscriptionRouter.post("/start", async (c) => {
  const user = c.get("user");

  const body = await c.req.json().catch(() => null);
  const parsed = StartTrialSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: { message: "Invalid request body", code: "VALIDATION_ERROR" } },
      400
    );
  }

  const { plan } = parsed.data;

  const now = new Date();
  let trialEndsAt: Date | null = null;
  let currentPeriodEndsAt: Date | null = null;

  if (plan === "trial") {
    // 14 day trial
    trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  } else if (plan === "monthly") {
    currentPeriodEndsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  } else if (plan === "annual") {
    currentPeriodEndsAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  }

  const subscription = await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      plan,
      status: "active",
      trialEndsAt,
      currentPeriodEndsAt,
    },
    create: {
      userId: user.id,
      plan,
      status: "active",
      trialEndsAt,
      currentPeriodEndsAt,
    },
  });

  return c.json({ data: serializeSubscription(subscription) }, 201);
});

// POST /api/subscription/cancel - Cancel subscription
subscriptionRouter.post("/cancel", async (c) => {
  const user = c.get("user");

  const existing = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  if (!existing) {
    return c.json(
      {
        error: {
          message: "No active subscription found",
          code: "NOT_FOUND",
        },
      },
      404
    );
  }

  if (existing.status === "cancelled") {
    return c.json(
      {
        error: {
          message: "Subscription is already cancelled",
          code: "ALREADY_CANCELLED",
        },
      },
      400
    );
  }

  const subscription = await prisma.subscription.update({
    where: { userId: user.id },
    data: { status: "cancelled" },
  });

  return c.json({ data: serializeSubscription(subscription) });
});

export { subscriptionRouter };
