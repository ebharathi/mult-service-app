import { ChatOpenAI } from "@langchain/openai";
import { tools } from "./tools";

if(!process.env.OPENAI_API_KEY){
  console.error("[warning] OPENAI_API_KEY environment variable is not set");
}

/**
 * Create and configure the LangChain agent with tools
 */
export function createAgent() {
  const model = new ChatOpenAI({
    modelName: "gpt-4.1",
    temperature: 0.7,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const modelWithTools = model.bindTools(tools);

  return {
    model: modelWithTools,
    tools,
  };
}

