import { Hono } from "hono";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";
import type { HonoVariables } from "../context";

const accountRouter = new Hono<{ Variables: HonoVariables }>();
const DeleteAccountSchema = z.object({ confirmation: z.literal("DELETE") });

accountRouter.use("/*", requireAuth);

accountRouter.delete("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!DeleteAccountSchema.safeParse(body).success) {
    return c.json(
      { error: { message: 'Type "DELETE" to confirm account removal', code: "CONFIRMATION_REQUIRED" } },
      400
    );
  }

  const user = c.get("user");
  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.verification.deleteMany({
        where: { value: { contains: user.email } },
      });
      await transaction.user.delete({ where: { id: user.id } });
    });
    return c.body(null, 204);
  } catch (error) {
    console.error("Account deletion failed", error);
    return c.json(
      { error: { message: "Unable to delete account right now", code: "ACCOUNT_DELETE_FAILED" } },
      500
    );
  }
});

export { accountRouter };