import { Hono } from "hono";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";
import type { HonoVariables } from "../context";
import { CreateCoverLetterSchema, UpdateCoverLetterSchema } from "../types";

const coverLettersRouter = new Hono<{ Variables: HonoVariables }>();

// Apply auth middleware to all routes
coverLettersRouter.use("/*", requireAuth);

function serializeCoverLetter(cl: {
  id: string;
  userId: string;
  resumeId: string | null;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: cl.id,
    userId: cl.userId,
    resumeId: cl.resumeId,
    title: cl.title,
    content: cl.content,
    createdAt: cl.createdAt.toISOString(),
    updatedAt: cl.updatedAt.toISOString(),
  };
}

// GET /api/cover-letters - List all
coverLettersRouter.get("/", async (c) => {
  const user = c.get("user");

  const coverLetters = await prisma.coverLetter.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return c.json({ data: coverLetters.map(serializeCoverLetter) });
});

// POST /api/cover-letters - Create
coverLettersRouter.post("/", async (c) => {
  const user = c.get("user");

  const body = await c.req.json().catch(() => null);
  const parsed = CreateCoverLetterSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: { message: "Invalid request body", code: "VALIDATION_ERROR" } },
      400
    );
  }

  const { title, content, resumeId } = parsed.data;

  const coverLetter = await prisma.coverLetter.create({
    data: {
      userId: user.id,
      title,
      content: content ?? "",
      resumeId: resumeId ?? null,
    },
  });

  return c.json({ data: serializeCoverLetter(coverLetter) }, 201);
});

// GET /api/cover-letters/:id - Get single
coverLettersRouter.get("/:id", async (c) => {
  const user = c.get("user");
  const { id } = c.req.param();

  const coverLetter = await prisma.coverLetter.findFirst({
    where: { id, userId: user.id },
  });

  if (!coverLetter) {
    return c.json(
      { error: { message: "Cover letter not found", code: "NOT_FOUND" } },
      404
    );
  }

  return c.json({ data: serializeCoverLetter(coverLetter) });
});

// PUT /api/cover-letters/:id - Update
coverLettersRouter.put("/:id", async (c) => {
  const user = c.get("user");
  const { id } = c.req.param();

  const body = await c.req.json().catch(() => null);
  const parsed = UpdateCoverLetterSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: { message: "Invalid request body", code: "VALIDATION_ERROR" } },
      400
    );
  }

  const updates = parsed.data;

  const existing = await prisma.coverLetter.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return c.json(
      { error: { message: "Cover letter not found", code: "NOT_FOUND" } },
      404
    );
  }

  const coverLetter = await prisma.coverLetter.update({
    where: { id },
    data: {
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.content !== undefined && { content: updates.content }),
      ...(updates.resumeId !== undefined && { resumeId: updates.resumeId }),
    },
  });

  return c.json({ data: serializeCoverLetter(coverLetter) });
});

// DELETE /api/cover-letters/:id - Delete
coverLettersRouter.delete("/:id", async (c) => {
  const user = c.get("user");
  const { id } = c.req.param();

  const existing = await prisma.coverLetter.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return c.json(
      { error: { message: "Cover letter not found", code: "NOT_FOUND" } },
      404
    );
  }

  await prisma.coverLetter.delete({ where: { id } });

  return c.body(null, 204);
});

export { coverLettersRouter };
