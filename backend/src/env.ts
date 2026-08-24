import { z } from "zod";

/**
 * Environment variable schema using Zod
 * This ensures all required environment variables are present and valid
 */
const envSchema = z.object({
  // Server Configuration
  PORT: z.string().optional().default("3000"),
  NODE_ENV: z.string().optional(),
  DATABASE_URL: z.string().default("file:./dev.db"),
  SUPABASE_DATABASE_URL: z.string().optional(),
  BACKEND_URL: z.string().default("http://localhost:3000"),
  BETTER_AUTH_SECRET: z.string().default("cv-builder-secret-key-32chars-minimum-2024"),
  AI_PROVIDER: z.enum(["openai", "ollama"]).optional().default("ollama"),
  OPENAI_API_KEY: z.string().default(""),
  OPENAI_BASE_URL: z.string().optional().default("https://api.openai.com/v1"),
  OPENAI_MODEL: z.string().optional().default("gpt-4o-mini"),
  OLLAMA_BASE_URL: z.string().optional().default("http://localhost:11434/v1"),
  OLLAMA_MODEL: z.string().optional().default("gemma3:4b"),
  RESEND_API_KEY: z.string(),
});

/**
 * Validate and parse environment variables
 */
function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    console.log("✅ Environment variables validated successfully");
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment variable validation failed:");
      error.issues.forEach((err: z.ZodIssue) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
      console.error("\nPlease check your .env file and ensure all required variables are set.");
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Validated and typed environment variables
 */
export const env = validateEnv();

/**
 * Type of the validated environment variables
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Extend process.env with our environment variables
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line import/namespace
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
