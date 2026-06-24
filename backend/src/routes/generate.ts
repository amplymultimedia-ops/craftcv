import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";
import type { HonoVariables } from "../context";
import {
  GenerateResumeSchema,
  GenerateCoverLetterSchema,
  EditTextSchema,
  type EditText,
  type ResumeContent,
  type ToneOfVoice,
} from "../types";

const generateRouter = new Hono<{ Variables: HonoVariables }>();

// Apply auth middleware to all routes
generateRouter.use("/*", requireAuth);

function getToneSystemPrompt(tone: ToneOfVoice): string {
  const tonePrompts: Record<ToneOfVoice, string> = {
    professional:
      "Write in formal corporate language with metrics and achievements. Use industry-standard terminology, quantify accomplishments with numbers and percentages, and maintain a polished executive tone throughout.",
    personal:
      "Write in warm, approachable language focusing on collaborative traits and human connections. Show personality while remaining professional, emphasize teamwork and relationship-building.",
    human:
      "Write naturally avoiding AI buzzwords like 'delve', 'testament', 'leverage', 'synergy', 'paradigm', 'holistic', 'robust', 'cutting-edge', 'game-changer'. Use varied sentence lengths, conversational but professional language that sounds like a real person wrote it.",
    creative:
      "Write boldly with personality and flair, suitable for creative industries. Show innovation and originality in word choice, demonstrate unique perspective and creative thinking.",
    confident:
      "Write assertively with strong action verbs and authoritative tone. Lead with impact statements, use decisive language, project confidence and expertise in every sentence.",
  };
  return tonePrompts[tone];
}

async function generateTailoredResume(
  baseContent: ResumeContent,
  jobAdText: string,
  tone: ToneOfVoice,
  openaiKey: string
): Promise<ResumeContent> {
  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey: openaiKey });

  const toneInstruction = getToneSystemPrompt(tone);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert resume writer and career coach. Your task is to tailor a resume to match a specific job posting.

Tone instruction: ${toneInstruction}

Guidelines:
- Map the candidate's experience to the job requirements
- Emphasize relevant skills and achievements
- Use ATS-friendly keywords from the job ad naturally throughout
- Rewrite bullets to highlight accomplishments most relevant to this role
- Strengthen the professional summary to directly address the role
- Keep all factual information accurate - only reframe/reword, don't fabricate
- Prioritize skills that appear in the job ad

Return the tailored resume as a JSON object with the EXACT same structure as the input resume. Do not add or remove sections. Return ONLY the JSON object.`,
      },
      {
        role: "user",
        content: `Tailor this resume for the job posting below.

JOB POSTING:
${jobAdText.substring(0, 4000)}

CURRENT RESUME (JSON):
${JSON.stringify(baseContent, null, 2).substring(0, 6000)}

Return the tailored resume as JSON with the same structure.`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const tailored = JSON.parse(
    completion.choices[0]?.message.content ?? "{}"
  ) as ResumeContent;

  // Ensure IDs are preserved
  if (tailored.experience && baseContent.experience) {
    tailored.experience = tailored.experience.map((exp, i) => ({
      ...exp,
      id: baseContent.experience[i]?.id ?? exp.id ?? `exp-${i + 1}`,
      bullets: exp.bullets ?? [],
    }));
  }
  if (tailored.education && baseContent.education) {
    tailored.education = tailored.education.map((edu, i) => ({
      ...edu,
      id: baseContent.education[i]?.id ?? edu.id ?? `edu-${i + 1}`,
    }));
  }

  return tailored;
}

async function generateCoverLetterContent(
  resumeContent: ResumeContent,
  jobAdText: string,
  tone: ToneOfVoice,
  openaiKey: string
): Promise<string> {
  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey: openaiKey });

  const toneInstruction = getToneSystemPrompt(tone);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are an expert cover letter writer. Write a compelling cover letter that connects the candidate's experience to the job requirements.

Tone instruction: ${toneInstruction}

Guidelines:
- Opening paragraph: Hook the reader, express genuine enthusiasm for the role
- Body paragraphs (2-3): Connect specific experience to job requirements with concrete examples
- Closing paragraph: Call to action, reiterate interest
- Keep it to 3-4 paragraphs, under 400 words
- Address the specific company and role
- Use ATS keywords naturally
- Sound human and authentic, not generic

Return ONLY the cover letter text, no JSON wrapper, no formatting markers.`,
      },
      {
        role: "user",
        content: `Write a cover letter for this candidate applying to this job.

JOB POSTING:
${jobAdText.substring(0, 3000)}

CANDIDATE RESUME:
Name: ${resumeContent.personalInfo.name}
Title: ${resumeContent.personalInfo.title ?? ""}
Summary: ${resumeContent.summary}
Experience: ${resumeContent.experience
          .map((e) => `${e.role} at ${e.company} (${e.startDate} - ${e.endDate})`)
          .join(", ")}
Key Skills: ${resumeContent.skills.slice(0, 15).join(", ")}`,
      },
    ],
  });

  return completion.choices[0]?.message.content ?? "";
}

// POST /api/generate/resume - Generate tailored resume
generateRouter.post("/resume", async (c) => {
  const user = c.get("user");

  const body = await c.req.json().catch(() => null);
  const parsed = GenerateResumeSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: { message: "Invalid request body", code: "VALIDATION_ERROR" } },
      400
    );
  }

  const { resumeId, jobAdText, toneOfVoice } = parsed.data;

  const { env } = await import("../env");
  if (!env.OPENAI_API_KEY) {
    return c.json(
      {
        error: {
          message: "OpenAI API key not configured",
          code: "AI_NOT_CONFIGURED",
        },
      },
      500
    );
  }

  // Get the resume
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId: user.id },
  });

  if (!resume) {
    return c.json(
      { error: { message: "Resume not found", code: "NOT_FOUND" } },
      404
    );
  }

  // Get baseline profile for richer context
  const baselineProfile = await prisma.baselineProfile.findUnique({
    where: { userId: user.id },
  });

  // Use baseline profile content if available, otherwise use resume content
  const baseContent = baselineProfile
    ? (JSON.parse(baselineProfile.content) as ResumeContent)
    : (JSON.parse(resume.content) as ResumeContent);

  try {
    const tailoredContent = await generateTailoredResume(
      baseContent,
      jobAdText,
      toneOfVoice,
      env.OPENAI_API_KEY
    );

    // Update the resume with tailored content
    const updatedResume = await prisma.resume.update({
      where: { id: resumeId },
      data: {
        content: JSON.stringify(tailoredContent),
        toneOfVoice,
      },
    });

    return c.json({
      data: {
        id: updatedResume.id,
        userId: updatedResume.userId,
        title: updatedResume.title,
        templateId: updatedResume.templateId,
        content: tailoredContent,
        toneOfVoice: updatedResume.toneOfVoice,
        createdAt: updatedResume.createdAt.toISOString(),
        updatedAt: updatedResume.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("Resume generation error:", err);
    return c.json(
      {
        error: {
          message: "Failed to generate tailored resume",
          code: "GENERATION_ERROR",
        },
      },
      500
    );
  }
});

// POST /api/generate/cover-letter - Generate cover letter
generateRouter.post("/cover-letter", async (c) => {
  const user = c.get("user");

  const body = await c.req.json().catch(() => null);
  const parsed = GenerateCoverLetterSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: { message: "Invalid request body", code: "VALIDATION_ERROR" } },
      400
    );
  }

  const { resumeId, jobAdText, toneOfVoice, coverLetterId } = parsed.data;

  const { env } = await import("../env");
  if (!env.OPENAI_API_KEY) {
    return c.json(
      {
        error: {
          message: "OpenAI API key not configured",
          code: "AI_NOT_CONFIGURED",
        },
      },
      500
    );
  }

  // Get the resume
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId: user.id },
  });

  if (!resume) {
    return c.json(
      { error: { message: "Resume not found", code: "NOT_FOUND" } },
      404
    );
  }

  const resumeContent = JSON.parse(resume.content) as ResumeContent;

  try {
    const coverLetterText = await generateCoverLetterContent(
      resumeContent,
      jobAdText,
      toneOfVoice,
      env.OPENAI_API_KEY
    );

    // Determine title from job ad
    const titleMatch = jobAdText.match(/^([^\n]+)/);
    const matchedTitle = titleMatch?.[1] ?? "";
    const title = matchedTitle
      ? `Cover Letter - ${matchedTitle.substring(0, 50)}`
      : "Cover Letter";

    let coverLetter;

    if (coverLetterId) {
      // Update existing
      const existing = await prisma.coverLetter.findFirst({
        where: { id: coverLetterId, userId: user.id },
      });

      if (!existing) {
        return c.json(
          {
            error: { message: "Cover letter not found", code: "NOT_FOUND" },
          },
          404
        );
      }

      coverLetter = await prisma.coverLetter.update({
        where: { id: coverLetterId },
        data: { content: coverLetterText },
      });
    } else {
      // Create new
      coverLetter = await prisma.coverLetter.create({
        data: {
          userId: user.id,
          resumeId,
          title,
          content: coverLetterText,
        },
      });
    }

    return c.json({
      data: {
        id: coverLetter.id,
        userId: coverLetter.userId,
        resumeId: coverLetter.resumeId,
        title: coverLetter.title,
        content: coverLetter.content,
        createdAt: coverLetter.createdAt.toISOString(),
        updatedAt: coverLetter.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("Cover letter generation error:", err);
    return c.json(
      {
        error: {
          message: "Failed to generate cover letter",
          code: "GENERATION_ERROR",
        },
      },
      500
    );
  }
});

// POST /api/generate/edit-text - Edit text according to an instruction
generateRouter.post(
  "/edit-text",
  zValidator("json", EditTextSchema),
  async (c) => {
    const { text, instruction } = c.req.valid("json" as never) as EditText;
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) return c.json({ error: { message: "OpenAI API key not configured", code: "NO_API_KEY" } }, 500);

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: openaiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert writing assistant. Edit the provided text according to the instruction. Return ONLY the edited text with no extra commentary, no quotes, no explanation. Preserve any HTML formatting tags in the text.",
        },
        {
          role: "user",
          content: `Instruction: ${instruction}\n\nText to edit:\n${text}`,
        },
      ],
      temperature: 0.7,
    });

    const edited = completion.choices[0]?.message?.content?.trim() ?? text;
    return c.json({ data: { text: edited } });
  }
);

export { generateRouter };
