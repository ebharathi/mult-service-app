import { HumanMessage } from "@langchain/core/messages";
import { AgentStateSchema } from "../state";
import { GraphNode } from "@langchain/langgraph";

export const fallbackNode: GraphNode<typeof AgentStateSchema> = async (state) => {

  return {
    messages: [new HumanMessage("You forgot to mention what you did. Please just mention what you did.")],
  };
};
