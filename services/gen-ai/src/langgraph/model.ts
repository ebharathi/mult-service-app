import { ChatOpenAI } from "@langchain/openai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { tools } from "./tools";

export type Provider = "openai" | "deepseek" | "anthropic";

interface ModelConfig {
  provider: Provider;
  modelName: string;
  apiKeyEnv: string;
  baseURL?: string;
}

//DEEPSEEK EXAMPLE
// {
//   provider: "deepseek",
//   modelName: "deepseek-chat",
//   apiKeyEnv: "DEEPSEEK_API_KEY",
//   baseURL: "https://api.deepseek.com/v1",
// },


/**
 * Purpose-based model registry.
 * To swap a model (e.g. switch "chat" from OpenAI to DeepSeek),
 * just change the config here — every call site picks it up automatically.
 */
export const MODEL_REGISTRY: Record<string, ModelConfig> = {
  chat: {
    provider: "openai",
    modelName: "gpt-4.1",
    apiKeyEnv: "OPENAI_API_KEY",
  },
};

export function getModelConfig(modelKey: string): ModelConfig {
  const config = MODEL_REGISTRY[modelKey];
  if (!config) throw new Error(`Unknown model: ${modelKey}. Available: ${Object.keys(MODEL_REGISTRY).join(", ")}`);
  return config;
}

/**
 * Returns a LangChain ChatModel for any registered model.
 * OpenAI & DeepSeek use ChatOpenAI, Anthropic uses ChatAnthropic.
 */
export function getModel(
  modelKey: string,
  options?: { temperature?: number; streaming?: boolean; maxTokens?: number }
): BaseChatModel {
  const config = getModelConfig(modelKey);

  // OpenAI and DeepSeek (OpenAI-compatible)
  return new ChatOpenAI({
    modelName: config.modelName,
    temperature: options?.temperature ?? 0.7,
    streaming: options?.streaming ?? false,
    maxTokens: options?.maxTokens,
    apiKey: process.env[config.apiKeyEnv],
    ...(config.baseURL && {
      configuration: { baseURL: config.baseURL },
    }),
  });
}

/**
 * Create and configure the agent with tools bound.
 * Uses the "chat" model from the registry by default.
 */
export function createAgent(modelKey: string = "chat") {
  const model = getModel(modelKey, { streaming: true });
  const modelWithTools = model.bindTools!(tools);

  return {
    model: modelWithTools,
    tools,
  };
}
