import { expect, test } from "bun:test";
import { getAiConfig } from "../src/ai";

test("defaults to local Ollama when no OpenAI key is configured", () => {
  const config = getAiConfig({
    OPENAI_API_KEY: "",
    AI_PROVIDER: undefined,
    OLLAMA_BASE_URL: undefined,
    OLLAMA_MODEL: undefined,
  } as any);

  expect(config.provider).toBe("ollama");
  expect(config.model).toBe("gemma3:4b");
  expect(config.baseUrl).toBe("http://localhost:11434/v1");
});

test("allows explicit OpenAI provider selection", () => {
  const config = getAiConfig({
    OPENAI_API_KEY: "sk-test",
    AI_PROVIDER: "openai",
    OLLAMA_BASE_URL: undefined,
    OLLAMA_MODEL: undefined,
  } as any);

  expect(config.provider).toBe("openai");
  expect(config.apiKey).toBe("sk-test");
});
