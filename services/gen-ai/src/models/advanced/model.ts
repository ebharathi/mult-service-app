import { createAgent } from "./agent";
import { getToolByName } from "./tools";
import { DEFAULT_SYSTEM_PROMPT } from "./prompt/default.prompt";

const { HumanMessage, AIMessage, ToolMessage, SystemMessage } = require("@langchain/core/messages");
// Import type for TypeScript
import type { ToolMessage as ToolMessageType } from "@langchain/core/dist/messages/tool";

interface ToolCall {
  name: string;
  args: Record<string, any>;
  id: string;
}
interface ProcessOutput {
    content: string;
    tool_calls?: ToolCall[];
}

interface ModelOutput {
  response: string;
  toolCalls?: ToolCall[];
  needsMoreTools?: boolean;
}

/**
 * Process user message and determine if tools are needed
 * @param userId - User ID for tool context (not exposed to LLM, only available to tools)
 */
export async function processMessage(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [],
  systemPrompt: string,
  userId: string  //userId will be injected to every tools calls args
): Promise<ModelOutput> {
  const { model } = createAgent();

  // Use provided system prompt or default
  const systemPromptText = systemPrompt || DEFAULT_SYSTEM_PROMPT;

  // Convert conversation history to LangChain messages
  const historyMessages = conversationHistory.map((msg) => {
    if (msg.role === 'user') {
      return new HumanMessage(msg.content);
    } else if (msg.role === 'assistant') {
      return new AIMessage(msg.content);
    } else if (msg.role === 'system') {
      return new SystemMessage(msg.content);
    }
    return new HumanMessage(msg.content);
  });

  // Build messages array with system prompt, history, and new user message
  const messages = [
    new SystemMessage(systemPromptText),
    ...historyMessages,
    new HumanMessage(userMessage),
  ];

  // Get initial response from model
  const response :ProcessOutput= await model.invoke(messages);

  // Check if model wants to call tools
  const toolCalls = response.tool_calls || [];

  if (toolCalls.length === 0) {
    // No tools needed, return the response
    return {
      response: response.content as string,
    };
  }

  // Execute tool calls
  const toolResults: ToolMessageType[] = [];

  for (const toolCall of toolCalls) {
    const tool = getToolByName(toolCall.name);
    if (!tool) {
      toolResults.push(
        new ToolMessage({
          content: `Error: Tool ${toolCall.name} not found`,
          tool_call_id: toolCall.id,
        })
      );
      continue;
    }

    try {
      // Automatically inject userId from context for tools that need it
      let toolArgs = { ...toolCall.args };
      toolArgs.userId = userId;
      
      const result = await tool.invoke(toolArgs);
      toolResults.push(
        new ToolMessage({
          content: result as string,
          tool_call_id: toolCall.id,
        })
      );
    } catch (error) {
      toolResults.push(
        new ToolMessage({
          content: `Error executing tool: ${error instanceof Error ? error.message : "Unknown error"}`,
          tool_call_id: toolCall.id,
        })
      );
    }
  }

  // Send tool results back to model for final response
  const messagesWithTools = [
    ...messages,
    response,
    ...toolResults,
  ];

  let currentMessages = messagesWithTools;
  let allToolCalls = [...toolCalls];
  let maxIterations = 10; // Prevent infinite loops
  let iteration = 0;

  // Continue calling tools until model says it's done or max iterations reached
  while (iteration < maxIterations) {
    const response :ProcessOutput= await model.invoke(currentMessages);
    
    // If no more tool calls, we're done
    if (!response.tool_calls || response.tool_calls.length === 0) {
      return {
        response: response.content ,
        toolCalls: allToolCalls.map((tc: any) => ({
          name: tc.name,
          args: tc.args,
          id: tc.id,
        })),
        needsMoreTools: false,
      };
    }

    // Execute the new tool calls
    const newToolResults: ToolMessageType[] = [];
    for (const toolCall of response.tool_calls) {
      const tool = getToolByName(toolCall.name);
      if (!tool) {
        newToolResults.push(
          new ToolMessage({
            content: `Error: Tool ${toolCall.name} not found`,
            tool_call_id: toolCall.id,
          })
        );
        continue;
      }

      try {
        // Automatically inject userId from context for tools that need it
        let toolArgs = { ...toolCall.args };
        toolArgs.userId = userId;
        
        const result = await tool.invoke(toolArgs);
        newToolResults.push(
          new ToolMessage({
            content: result as string,
            tool_call_id: toolCall.id,
          })
        );
      } catch (error) {
        newToolResults.push(
          new ToolMessage({
            content: `Error executing tool: ${error instanceof Error ? error.message : "Unknown error"}`,
            tool_call_id: toolCall.id,
          })
        );
      }
    }

    // Add new tool calls to the list
    allToolCalls = [...allToolCalls, ...response.tool_calls];

    // Update messages for next iteration
    currentMessages = [
      ...currentMessages,
      response,
      ...newToolResults,
    ];

    iteration++;
  }

  // If we hit max iterations, get final response
  const finalResponse = await model.invoke(currentMessages);

  return {
    response: finalResponse.content as string || "Completed all tool calls. Please check the results.",
    toolCalls: allToolCalls.map((tc: any) => ({
      name: tc.name,
      args: tc.args,
      id: tc.id,
    })),
    needsMoreTools: false,
  };
}
