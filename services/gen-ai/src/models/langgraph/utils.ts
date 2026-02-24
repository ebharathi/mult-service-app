import { AgentStateSchema } from "./state";
import { AIMessage } from "@langchain/core/messages";

export function safeString(x: unknown) {
    return typeof x === "string" ? x : x == null ? "" : String(x);
}


export function needsFallback(state: typeof AgentStateSchema.State): boolean {
    const last = state.messages.at(-1);
    if (!last || !AIMessage.isInstance(last)) return false;
    return !safeString(last.content).trim();
}


export function parseToolJsonResult(resultString: string): {
    messageText: string;
} {
    let messageText = resultString;
  
    try {
        const parsed = JSON.parse(resultString);
        if (parsed && typeof parsed === "object") {
            const obj = parsed as Record<string, unknown>;
            messageText = obj.message as string;
        }
    }
    catch (error) {
        console.error("[ERROR] PARSING TOOL JSON RESULT:", error);
    }

    return { messageText };
}
