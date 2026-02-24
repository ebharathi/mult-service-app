import { ToolMessage } from "@langchain/core/messages";
import { getToolByName } from "../tools";
import { AgentStateSchema } from "../state";
import { parseToolJsonResult, safeString } from "../utils";
import { GraphNode } from "@langchain/langgraph";

export const toolsNode: GraphNode<typeof AgentStateSchema> = async (state) => {
  const last: any = state.messages.at(-1);
  const toolCalls = last?.tool_calls ?? [];

  const toolResults: ToolMessage[] = [];

  for (const call of toolCalls) {
    const tool = getToolByName(call.name);
    if (!tool) continue;

    const toolArgs = {
      ...(call.args ?? {}),
      user_id: state.userId,
    };

    const result = await tool.invoke(toolArgs);
    const raw = safeString(result);

    const { messageText } = parseToolJsonResult(raw); //clean tool output

    toolResults.push(new ToolMessage({ content: messageText, tool_call_id: call.id }));
  }


  return {
    messages: toolResults,
  };
};
