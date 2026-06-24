import { Hono } from "hono";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";
import type { HonoVariables } from "../context";
import { ParseJobAdSchema, type ParsedJobAd } from "../types";

const jobAdRouter = new Hono<{ Variables: HonoVariables }>();

// Apply auth middleware to all routes
jobAdRouter.use("/*", requireAuth);

async function fetchUrlText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; CVBuilderBot/1.0; +https://cvbuilder.app)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.statusText}`);
  }

  const html = await response.text();

  // Use cheerio to extract text content
  const cheerio = await import("cheerio");
  const $ = cheerio.load(html);

  // Remove scripts, styles, and other non-content elements
  $("script, style, nav, footer, header, aside, iframe, noscript").remove();

  // Try to find the main job content
  const selectors = [
    "main",
    '[class*="job-description"]',
    '[class*="job-detail"]',
    '[class*="posting"]',
    '[id*="job-description"]',
    '[id*="job-detail"]',
    "article",
    ".content",
    "#content",
  ];

  let text = "";
  for (const selector of selectors) {
    const el = $(selector);
    if (el.length > 0) {
      text = el.text();
      break;
    }
  }

  // Fallback to body text
  if (!text) {
    text = $("body").text();
  }

  // Clean up whitespace
  return text.replace(/\s+/g, " ").trim().substring(0, 10000);
}

async function parseJobAdWithAI(
  rawText: string,
  openaiKey: string
): Promise<ParsedJobAd> {
  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey: openaiKey });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an expert job ad parser. Extract structured information from the job posting and return it as a valid JSON object matching this exact structure:
{
  "title": "string (job title)",
  "company": "string (optional company name)",
  "responsibilities": ["array of key responsibilities/duties"],
  "requirements": ["array of qualifications, skills, and requirements"],
  "keywords": ["array of important ATS keywords: skills, technologies, tools, certifications"],
  "culture": "string (optional, company culture/values description)",
  "rawText": "string (first 1000 chars of raw text)"
}

Focus on extracting:
- Specific technical skills and tools mentioned
- Years of experience requirements
- Educational requirements
- Soft skills
- Industry-specific terminology
- Important ATS keywords

Return ONLY the JSON object, no additional text.`,
      },
      {
        role: "user",
        content: `Parse this job posting:\n\n${rawText.substring(0, 8000)}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const parsed = JSON.parse(
    completion.choices[0]?.message.content ?? "{}"
  ) as ParsedJobAd;

  return {
    ...parsed,
    rawText: rawText.substring(0, 1000),
  };
}

// POST /api/job-ad/parse - Parse job ad from URL or text
jobAdRouter.post("/parse", async (c) => {
  const user = c.get("user");

  const body = await c.req.json().catch(() => null);
  const parsed = ParseJobAdSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: { message: "Invalid request body", code: "VALIDATION_ERROR" } },
      400
    );
  }

  const { url, text } = parsed.data;

  if (!url && !text) {
    return c.json(
      {
        error: {
          message: "Either url or text must be provided",
          code: "MISSING_INPUT",
        },
      },
      400
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

  let rawText = text ?? "";

  // If URL provided, fetch and extract text
  if (url) {
    try {
      rawText = await fetchUrlText(url);
    } catch (err) {
      console.error("URL fetch error:", err);
      return c.json(
        {
          error: {
            message: "Failed to fetch job posting from URL",
            code: "FETCH_ERROR",
          },
        },
        400
      );
    }
  }

  if (!rawText || rawText.length < 10) {
    return c.json(
      {
        error: {
          message: "Could not extract text from the provided source",
          code: "NO_TEXT",
        },
      },
      400
    );
  }

  try {
    const parsedData = await parseJobAdWithAI(rawText, env.OPENAI_API_KEY);

    // Save to database
    await prisma.jobAd.create({
      data: {
        userId: user.id,
        url: url ?? null,
        rawText,
        parsedData: JSON.stringify(parsedData),
      },
    });

    return c.json({ data: parsedData });
  } catch (err) {
    console.error("Job ad parse error:", err);
    return c.json(
      {
        error: {
          message: "Failed to parse job ad",
          code: "PARSE_ERROR",
        },
      },
      500
    );
  }
});

export { jobAdRouter };
