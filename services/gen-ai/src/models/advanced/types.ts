/**
 * Type declarations for @langchain/core subpath exports
 * This helps TypeScript resolve the subpath exports correctly
 */
declare module "@langchain/core/tools" {
    export {
      DynamicStructuredTool,
      DynamicTool,
      StructuredTool,
      type DynamicStructuredToolInput,
      type DynamicToolInput,
    } from "@langchain/core/dist/tools/index.js";
  }
  
  declare module "@langchain/core/messages" {
    export {
      HumanMessage,
      AIMessage,
      ToolMessage,
      SystemMessage,
      ChatMessage,
      BaseMessage,
      type HumanMessageFields,
      type AIMessageFields,
      type ToolMessageFields,
    } from "@langchain/core/dist/messages/index.js";
  }
  
  