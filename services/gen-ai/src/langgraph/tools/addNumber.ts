// Use require for runtime since we're in CommonJS
const { DynamicStructuredTool } = require("@langchain/core/tools");
import { z } from "zod";
import { logger } from "../logger";

/**
 * Tool to add two numbers together
 */
export const addNumbersTool = new DynamicStructuredTool({
  name: "add_numbers",
  description: "Adds two numbers together. Use this when the user asks to add, sum, or calculate the addition of two numbers.",
  schema: z.object({
    a: z.number().describe("The first number to add"),
    b: z.number().describe("The second number to add"),
    userId: z.string().describe("The user id who is making the request"),
  }),
  func: async ({ a, b, userId }: { a: number; b: number; userId: string }) => {
    logger.info('add_numbers', 'Adding numbers', { a, b, userId });
    const result = a + b;
    return `The sum of ${a} and ${b} is ${result}.`;
  },
});
