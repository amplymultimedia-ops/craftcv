import { Hono } from "hono";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";
import type { HonoVariables } from "../context";
import {
  CreateResumeSchema,
  UpdateResumeSchema,
  type ResumeContent,
} from "../types";

const resumesRouter = new Hono<{ Variables: HonoVariables }>();

// Apply auth middleware to all routes
resumesRouter.use("/*", requireAuth);

const emptyResumeContent: ResumeContent = {
  personalInfo: {
    name: "",
    email: "",
    phone: "",
    location: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  languages: [],
};

function serializeResume(resume: {
  id: string;
  userId: string;
  title: string;
  templateId: string;
  content: string;
  toneOfVoice: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: resume.id,
    userId: resume.userId,
    title: resume.title,
    templateId: resume.templateId,
    content: JSON.parse(resume.content) as ResumeContent,
    toneOfVoice: resume.toneOfVoice,
    createdAt: resume.createdAt.toISOString(),
    updatedAt: resume.updatedAt.toISOString(),
  };
}

// GET /api/resumes - List all user's resumes
resumesRouter.get("/", async (c) => {
  const user = c.get("user");

  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return c.json({ data: resumes.map(serializeResume) });
});

// POST /api/resumes - Create new resume
resumesRouter.post("/", async (c) => {
  const user = c.get("user");

  const body = await c.req.json().catch(() => null);
  const parsed = CreateResumeSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: { message: "Invalid request body", code: "VALIDATION_ERROR" } },
      400
    );
  }

  const { title, templateId, content } = parsed.data;

  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      title,
      templateId: templateId ?? "classic",
      content: JSON.stringify(content ?? emptyResumeContent),
    },
  });

  return c.json({ data: serializeResume(resume) }, 201);
});

// GET /api/resumes/:id - Get single resume
resumesRouter.get("/:id", async (c) => {
  const user = c.get("user");
  const { id } = c.req.param();

  const resume = await prisma.resume.findFirst({
    where: { id, userId: user.id },
  });

  if (!resume) {
    return c.json(
      { error: { message: "Resume not found", code: "NOT_FOUND" } },
      404
    );
  }

  return c.json({ data: serializeResume(resume) });
});

// PUT /api/resumes/:id - Update resume
resumesRouter.put("/:id", async (c) => {
  const user = c.get("user");
  const { id } = c.req.param();

  const body = await c.req.json().catch(() => null);
  const parsed = UpdateResumeSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: { message: "Invalid request body", code: "VALIDATION_ERROR" } },
      400
    );
  }

  const updates = parsed.data;

  const existing = await prisma.resume.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return c.json(
      { error: { message: "Resume not found", code: "NOT_FOUND" } },
      404
    );
  }

  const resume = await prisma.resume.update({
    where: { id },
    data: {
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.templateId !== undefined && {
        templateId: updates.templateId,
      }),
      ...(updates.content !== undefined && {
        content: JSON.stringify(updates.content),
      }),
      ...(updates.toneOfVoice !== undefined && {
        toneOfVoice: updates.toneOfVoice,
      }),
    },
  });

  return c.json({ data: serializeResume(resume) });
});

// DELETE /api/resumes/:id - Delete resume
resumesRouter.delete("/:id", async (c) => {
  const user = c.get("user");
  const { id } = c.req.param();

  const existing = await prisma.resume.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return c.json(
      { error: { message: "Resume not found", code: "NOT_FOUND" } },
      404
    );
  }

  await prisma.resume.delete({ where: { id } });

  return c.body(null, 204);
});

// POST /api/resumes/:id/duplicate - Duplicate resume
resumesRouter.post("/:id/duplicate", async (c) => {
  const user = c.get("user");
  const { id } = c.req.param();

  const existing = await prisma.resume.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return c.json(
      { error: { message: "Resume not found", code: "NOT_FOUND" } },
      404
    );
  }

  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      title: `${existing.title} (Copy)`,
      templateId: existing.templateId,
      content: existing.content,
      toneOfVoice: existing.toneOfVoice,
    },
  });

  return c.json({ data: serializeResume(resume) }, 201);
});

export { resumesRouter };
