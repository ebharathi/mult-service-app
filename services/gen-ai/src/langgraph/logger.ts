/**
 * Simple logger utility for tool execution
 */

enum LogLevel {
    INFO = 'INFO',
    ERROR = 'ERROR',
    WARN = 'WARN',
    DEBUG = 'DEBUG',
  }

  interface LogEntry {
    timestamp: string;
    level: LogLevel;
    tool: string;
    message: string;
    data?: any;
  }

  function formatTimestamp(): string {
    return new Date().toISOString();
  }

  function formatLog(entry: LogEntry): string {
    const { timestamp, level, tool, message, data } = entry;
    let logMessage = `[${timestamp}] [${level}] [${tool}] ${message}`;

    if (data) {
      logMessage += `\nData: ${JSON.stringify(data, null, 2)}`;
    }

    return logMessage;
  }

  export const logger = {
    info: (tool: string, message: string, data?: any) => {
      const entry: LogEntry = {
        timestamp: formatTimestamp(),
        level: LogLevel.INFO,
        tool,
        message,
        data,
      };
      console.log(formatLog(entry));
    },

    error: (tool: string, message: string, data?: any) => {
      const entry: LogEntry = {
        timestamp: formatTimestamp(),
        level: LogLevel.ERROR,
        tool,
        message,
        data,
      };
      console.error(formatLog(entry));
    },

    warn: (tool: string, message: string, data?: any) => {
      const entry: LogEntry = {
        timestamp: formatTimestamp(),
        level: LogLevel.WARN,
        tool,
        message,
        data,
      };
      console.warn(formatLog(entry));
    },

    debug: (tool: string, message: string, data?: any) => {
      const entry: LogEntry = {
        timestamp: formatTimestamp(),
        level: LogLevel.DEBUG,
        tool,
        message,
        data,
      };
      console.debug(formatLog(entry));
    },
  };
