/// <reference types="node" />

export const deepseekConfig = {
  openAIBaseUrl:
    process.env.TOROUTER_OPENAI_BASE_URL ??
    process.env.DEEPSEEK_OPENAI_BASE_URL ??
    "https://portal.torouter.ai",
  anthropicBaseUrl:
    process.env.TOROUTER_ANTHROPIC_BASE_URL ??
    process.env.DEEPSEEK_ANTHROPIC_BASE_URL ??
    "https://portal.torouter.ai",
  apiKey: process.env.TOROUTER_API_KEY ?? process.env.DEEPSEEK_API_KEY,
  model:
    process.env.TOROUTER_MODEL ??
    process.env.DEEPSEEK_MODEL ??
    "deepseek-v4-flash",
} as const;

export function requireDeepseekApiKey() {
  if (!deepseekConfig.apiKey) {
    throw new Error("Missing DEEPSEEK_API_KEY environment variable.");
  }

  return deepseekConfig.apiKey;
}
