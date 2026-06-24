import { Hono } from "hono";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";
import type { HonoVariables } from "../context";
import { UpdateProfileSchema, type ResumeContent } from "../types";

const profileRouter = new Hono<{ Variables: HonoVariables }>();

// Apply auth middleware to all routes
profileRouter.use("/*", requireAuth);

function serializeProfile(profile: {
  id: string;
  userId: string;
  content: string;
  updatedAt: Date;
}) {
  return {
    id: profile.id,
    userId: profile.userId,
    content: JSON.parse(profile.content) as ResumeContent,
    updatedAt: profile.updatedAt.toISOString(),
  };
}

// GET /api/profile - Get baseline profile
profileRouter.get("/", async (c) => {
  const user = c.get("user");

  const profile = await prisma.baselineProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    return c.json({ data: null });
  }

  return c.json({ data: serializeProfile(profile) });
});

// PUT /api/profile - Update baseline profile
profileRouter.put("/", async (c) => {
  const user = c.get("user");

  const body = await c.req.json().catch(() => null);
  const parsed = UpdateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: { message: "Invalid request body", code: "VALIDATION_ERROR" } },
      400
    );
  }

  const { content } = parsed.data;

  const profile = await prisma.baselineProfile.upsert({
    where: { userId: user.id },
    update: { content: JSON.stringify(content) },
    create: {
      userId: user.id,
      content: JSON.stringify(content),
    },
  });

  return c.json({ data: serializeProfile(profile) });
});

// POST /api/profile/parse-document - Upload and parse PDF/DOCX
profileRouter.post("/parse-document", async (c) => {
  const user = c.get("user");

  let formData: FormData;
  try {
    formData = await c.req.formData();
  } catch {
    return c.json(
      {
        error: { message: "Failed to parse form data", code: "PARSE_ERROR" },
      },
      400
    );
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return c.json(
      { error: { message: "No file provided", code: "NO_FILE" } },
      400
    );
  }

  const fileName = file.name.toLowerCase();
  let extractedText = "";

  try {
    const buffer = await file.arrayBuffer();
    const nodeBuffer = Buffer.from(buffer);

    if (fileName.endsWith(".docx")) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer: nodeBuffer });
      extractedText = result.value;
    } else if (fileName.endsWith(".pdf")) {
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs") as any;
      const workerSrc = new URL(
        "../../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
        import.meta.url
      ).href;
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
      const uint8Array = new Uint8Array(buffer);
      const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        disableStream: true,
        disableAutoFetch: true,
        useSystemFonts: true,
      });
      const pdf = await loadingTask.promise;
      const textParts: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        textParts.push(
          content.items.map((item: any) => item.str ?? "").join(" ")
        );
      }
      extractedText = textParts.join("\n");
    } else if (fileName.endsWith(".txt")) {
      extractedText = new TextDecoder().decode(nodeBuffer);
    } else {
      return c.json(
        {
          error: {
            message: "Unsupported file type. Please upload PDF, DOCX, or TXT.",
            code: "UNSUPPORTED_FILE_TYPE",
          },
        },
        400
      );
    }
  } catch (err) {
    console.error("Document parse error:", err);
    return c.json(
      { error: { message: "Failed to parse document", code: "PARSE_ERROR" } },
      500
    );
  }

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

  try {
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert resume parser. Extract structured information from the resume text and return it as a valid JSON object matching this exact structure:
{
  "personalInfo": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string (optional)",
    "website": "string (optional)",
    "title": "string (optional, professional title/headline)"
  },
  "summary": "string (professional summary)",
  "experience": [
    {
      "id": "unique string id",
      "company": "string",
      "role": "string",
      "startDate": "string (e.g. Jan 2020)",
      "endDate": "string (e.g. Dec 2022 or Present)",
      "current": false,
      "description": "string",
      "bullets": ["string array of key achievements/responsibilities"]
    }
  ],
  "education": [
    {
      "id": "unique string id",
      "institution": "string",
      "degree": "string",
      "field": "string",
      "startDate": "string",
      "endDate": "string",
      "gpa": "string (optional)"
    }
  ],
  "skills": ["array of skill strings"],
  "certifications": ["array of certification strings"],
  "languages": ["array of language strings"]
}

Return ONLY the JSON object, no additional text.`,
        },
        {
          role: "user",
          content: `Parse this resume:\n\n${extractedText.substring(0, 8000)}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(
      completion.choices[0]?.message.content ?? "{}"
    ) as ResumeContent;

    // Ensure IDs are present
    if (parsed.experience) {
      parsed.experience = parsed.experience.map((exp, i) => ({
        ...exp,
        id: exp.id ?? `exp-${i + 1}`,
        bullets: exp.bullets ?? [],
        current: exp.current ?? false,
      }));
    }
    if (parsed.education) {
      parsed.education = parsed.education.map((edu, i) => ({
        ...edu,
        id: edu.id ?? `edu-${i + 1}`,
      }));
    }

    // Save as baseline profile
    const profile = await prisma.baselineProfile.upsert({
      where: { userId: user.id },
      update: { content: JSON.stringify(parsed) },
      create: {
        userId: user.id,
        content: JSON.stringify(parsed),
      },
    });

    return c.json({ data: serializeProfile(profile) });
  } catch (err) {
    console.error("OpenAI extraction error:", err);
    return c.json(
      {
        error: {
          message: "Failed to extract structured data from document",
          code: "EXTRACTION_ERROR",
        },
      },
      500
    );
  }
});

export { profileRouter };
