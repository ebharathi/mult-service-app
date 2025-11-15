import express from 'express';
import { authMiddleware } from '../middlewares/auth';
import { advancedModelController } from '../controllers/langchain.controller';
import { baseModelController } from '../controllers/basemodel.controller';
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

//Base model endpoint
router.post('/chat', authMiddleware, setStreamingHeaders, baseModelController);

//Langchain model with tools capabilities
router.post('/chat/advanced', authMiddleware, advancedModelController);



export default router;

