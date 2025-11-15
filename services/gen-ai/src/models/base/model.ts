// OpenAI service (chat completion endpoint) using LangChain

import { ChatOpenAI } from "@langchain/openai";

// Initialize the LangChain ChatOpenAI model with streaming enabled
const chatModel = new ChatOpenAI({
  modelName: "gpt-4.1",
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY,
  streaming: true,
});

/**
 * Get chat completion with conversation history using LangChain
 * @param systemPrompt - The system prompt/instructions
 * @param conversationHistory - Array of messages with role and content
 * @param onChunk - Callback function to handle streaming chunks
 * @returns Promise<string> - The complete AI response (after streaming)
 */
export const runChatStream = async (
  systemPrompt: string,
  conversationHistory: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  onChunk?: (chunk: string) => void
): Promise<string> => {
  try {
    // Create messages array with system prompt first, then conversation history
    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...conversationHistory,
    ];

    let fullResponse = "";

    // Stream the response from the chat model
    const stream = await chatModel.stream(messages);

    // Process each chunk as it arrives
    for await (const chunk of stream) {
      const content = chunk.content as string;
      fullResponse += content;
      
      // Call the callback if provided (for real-time streaming to client)
      if (onChunk) {
        onChunk(content);
      }
    }

    // Return the complete response
    return fullResponse;
  } catch (error) {
    console.error("Error in runChatStream:", error);
    throw new Error(
      `Failed to get conversation chat completion: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
