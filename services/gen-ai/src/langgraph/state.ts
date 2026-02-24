import {
  StateSchema,
  MessagesValue,
} from "@langchain/langgraph";
import { z } from "zod";

// Define the state schema using the new LangGraph API
export const AgentStateSchema = new StateSchema({
  messages: MessagesValue,
  userId: z.string(),
});

export type AgentState = typeof AgentStateSchema.State;
