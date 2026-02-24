import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { buildGraph } from "./graph";
import { AgentStateSchema } from "./state";

const app = buildGraph();

export async function runChatStream(
  systemPrompt: string,
  conversationHistory: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  userId: string,
  onChunk: (chunk: string, append: boolean) => void,
): Promise<string> {
  const messages = [
    new SystemMessage(systemPrompt),
    ...conversationHistory.map((m) =>
      m.role === "user"
        ? new HumanMessage(m.content)
        : m.role === "assistant"
        ? new AIMessage(m.content)
        : new SystemMessage(m.content)
    ),
  ];

  const input: typeof AgentStateSchema.State = {
    messages,
    userId,
  };

  let full = "";

  for await (const evt of app.streamEvents(input, {
    version: "v1" ,
    recursionLimit: 100,
  })) {
      if(evt.event === "on_llm_start"){
        onChunk(`\n\ndata: thinking_start<${evt.metadata.langgraph_step}>\n\n`,false);
      }
      else if (evt.event === "on_llm_stream") {
        const token = evt.data?.chunk.text;
        if (token) {
            full += token;
            onChunk(token, true);
        }
      }
      else if (evt.event === "on_llm_end") {
        onChunk(`\n\ndata: thinking_end<${evt.metadata.langgraph_step}>\n\n`,false);
      }
      else if (evt.event === "on_tool_start") {
        onChunk(`\n\ndata: tool_start<${evt.name}>\n\n`,false);
      }
      else if (evt.event === "on_tool_end") {
        onChunk(`\n\ndata: tool_end<${evt.name}>\n\n`,false);
       
      }
  }

  return full;
}
