import { AgentStateSchema } from "./state";
import { needsFallback } from "./utils";
import { END } from "@langchain/langgraph";
import { AIMessage } from "@langchain/core/messages";

export const routeAfterAgent = (state: typeof AgentStateSchema.State): "tools" | "fallback" | typeof END => {
  const last = state.messages.at(-1);

  // Check if it's an AIMessage before accessing tool_calls
  if (!last || !AIMessage.isInstance(last)) {
    return END;
  }

  const toolCalls = last.tool_calls ?? [];

  // If the LLM makes a tool call, then perform an action
  if (toolCalls.length > 0) {
    return "tools";
  }

  // Check if fallback is needed
  if (needsFallback(state)) {
    return "fallback";
  }

  // Otherwise, we stop (reply to the user)
  return END;
};
