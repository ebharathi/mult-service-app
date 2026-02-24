import type { DynamicStructuredTool } from "@langchain/core/dist/tools/index";

import { addNumbersTool } from "./addNumber";


export const tools: DynamicStructuredTool[] = [
    addNumbersTool,
  ];

  /**
 * Get tool by name
 */
export const getToolByName = (name: string): DynamicStructuredTool | undefined => {
    return tools.find((tool) => tool.name === name);
  };
