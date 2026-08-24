export type AiProvider = "openai" | "ollama";

export interface AiConfig {
  provider: AiProvider;
  model: string;
  baseUrl: string;
  apiKey: string;
}

export function getAiConfig(env: {
  AI_PROVIDER?: string;
  OPENAI_API_KEY?: string;
  OPENAI_BASE_URL?: string;
  OLLAMA_BASE_URL?: string;
  OLLAMA_MODEL?: string;
  OPENAI_MODEL?: string;
} = {}): AiConfig {
  const explicitProvider = env.AI_PROVIDER?.toLowerCase();
  const hasOpenAiKey = Boolean(env.OPENAI_API_KEY);

  const provider: AiProvider =
    explicitProvider === "openai"
      ? "openai"
      : explicitProvider === "ollama"
        ? "ollama"
        : hasOpenAiKey
          ? "openai"
          : "ollama";

  if (provider === "openai") {
    return {
      provider,
      model: env.OPENAI_MODEL ?? "gpt-4o-mini",
      baseUrl: env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
      apiKey: env.OPENAI_API_KEY ?? "",
    };
  }

  return {
    provider,
    model: env.OLLAMA_MODEL ?? "gemma3:4b",
    baseUrl: env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
    apiKey: "ollama",
  };
}

export async function createAiClient() {
  const { default: OpenAI } = await import("openai");
  const config = getAiConfig(process.env as any);

  if (config.provider === "openai" && !config.apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
  });
}
