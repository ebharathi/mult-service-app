import { runChatStream } from "../langgraph/runner";
import { Response } from "express";
import { DEFAULT_SYSTEM_PROMPT } from "../langgraph/prompt";

interface ConversationHistory {
  role: "user" | "assistant" | "system";
  content: string;
}

export const chatController = async (req: any, res: Response): Promise<void> => {
    try {
        console.log("CHAT CONTROLLER - REQUEST STARTED")
        const { message } = req.body;
        const userId = req.user.id;

        const systemPrompt = DEFAULT_SYSTEM_PROMPT;
        const conversationHistory: ConversationHistory[] = [{ role: "user", content: message }];

        let fullOutput = "";
        await runChatStream(
            systemPrompt,
            conversationHistory,
            userId,
            (chunk: string, append: boolean) => {
                res.write(`data: ${JSON.stringify({ chunk, done: false })}\n\n`);
                if (append) fullOutput += chunk;
            },
        );

        console.log("CHAT CONTROLLER - REQUEST COMPLETED")
        res.write(`data: ${JSON.stringify({ chunk: "", done: true, message: message })}\n\n`);
        res.end();
    } catch (error) {
        console.error('Error processing message:', error);

        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        } else {
            res.write(`data: ${JSON.stringify({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
                done: true
            })}\n\n`);
            res.end();
        }
    }
}
