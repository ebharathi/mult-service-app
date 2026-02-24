import express from 'express';
import { authMiddleware } from '../middlewares/auth';
import { chatController } from '../controllers/chat.controller';
import { NextFunction, Request, Response } from 'express';
const router = express.Router();

//for streaming response
const setStreamingHeaders = (req: Request, res: Response,next: NextFunction) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
  next();
}

//LangGraph chat endpoint (streaming)
router.post('/chat', authMiddleware, setStreamingHeaders, chatController);

export default router;
