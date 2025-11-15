import { processMessage } from "../models/advanced/model";
import { Response } from "express";
import { DEFAULT_SYSTEM_PROMPT } from "../models/advanced/prompt/default.prompt";

export const advancedModelController = async (req: any, res: Response): Promise<void> => {
    try {
        console.log("ADVANCED MODEL CONTROLLER - REQUEST STARTED")
        const { message } = req.body;
        const userId= req.user.id;
        const response = await processMessage(message,[],DEFAULT_SYSTEM_PROMPT, userId);
        console.log("ADVANCED MODEL CONTROLLER - REQUEST COMPLETED")
        res.status(200).json({
            success: true,
            message: 'Message processed successfully',
            data: response
        });
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
