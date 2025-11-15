import { runChatStream } from "../models/base/model";
import { DEFAULT_SYSTEM_PROMPT } from "../models/advanced/prompt/default.prompt";
import { Request, Response } from 'express';

interface ConversationHistory {
  role: "user" | "assistant" | "system";
  content: string;
}
/**
 * Controller function that uses OpenAI service with streaming
 */
export const baseModelController = async (req: any, res: Response) => {
    try {
      console.log("BASE MODEL CONTROLLER - REQUEST STARTED")
      const { message } = req.body;
      const userId = req.user.id;
      
      
      const systemPrompt = DEFAULT_SYSTEM_PROMPT;
      const conversationHistory: ConversationHistory[] = [{ role: "user", content: message }];
  
      let fullOutput = "";
      // Stream chunks to the client
      await runChatStream(
        systemPrompt,
        conversationHistory,
        (chunk: string) => {
          // Send each chunk as Server-Sent Events (SSE) format
          res.write(`data: ${JSON.stringify({ chunk, done: false })}\n\n`);
          fullOutput += chunk;
        }
      );
  
      // Send final message indicating completion
      console.log("BASE MODEL CONTROLLER - REQUEST COMPLETED")
      res.write(`data: ${JSON.stringify({ chunk: "", done: true, message:message })}\n\n`);
      res.end();
    } catch (error) {
      console.error('Error in chatCompletion controller:', error);
      
      // Send error as SSE if streaming hasn't started, otherwise send error chunk
      if (!res.headersSent) {
        return res.status(500).json({ 
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error'
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
  };
  