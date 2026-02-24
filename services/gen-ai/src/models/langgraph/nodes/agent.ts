import { createAgent } from "../../advanced/agent";
import { AgentStateSchema } from "../state";
import { GraphNode } from "@langchain/langgraph";

export const agentNode: GraphNode<typeof AgentStateSchema> = async (state) => {
    const { model } = createAgent();
    const response = await model.invoke(state.messages);

    return {
        messages: [response],
    };
};
