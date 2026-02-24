import { AgentStateSchema } from "./state";
import { agentNode } from "./nodes/agent";
import { toolsNode } from "./nodes/tool";
import { fallbackNode } from "./nodes/fallback";
import { routeAfterAgent } from "./router";
import {
  StateGraph,
  START,
  END,
} from "@langchain/langgraph";

export function buildGraph() {
  return new StateGraph(AgentStateSchema)
    .addNode("agent", agentNode)
    .addNode("tools", toolsNode)
    .addNode("fallback", fallbackNode)
    .addEdge(START, "agent")
    .addConditionalEdges("agent", routeAfterAgent, ["tools", "fallback", END])
    .addEdge("tools", "agent")
    .addEdge("fallback", "agent")
    .compile();
}
