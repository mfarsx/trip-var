import config from "../config";

/**
 * Log levels and their priorities
 */
const LOG_LEVELS = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
  TRACE: "trace",
};

const LOG_LEVEL_PRIORITIES = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4,
};

/**
 * Terminal colors for different log levels
 */
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

/**
 * Get current log level from config or environment
 */
const getCurrentLogLevel = () => {
  return config.logging?.level || process.env.VITE_LOG_LEVEL || LOG_LEVELS.INFO;
};

/**
 * Check if a log level should be displayed
 */
const shouldLog = (level) => {
  const currentPriority = LOG_LEVEL_PRIORITIES[getCurrentLogLevel()];
  const logPriority = LOG_LEVEL_PRIORITIES[level];
  return logPriority <= currentPriority;
};

/**
 * Format a log entry with consistent structure
 */
function formatLogEntry(level, message, context = null, data = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    context: context || "app",
    message,
  };

  if (data) {
    logEntry.data = data;
  }

  const levelColors = {
    error: colors.red,
    warn: colors.yellow,
    info: colors.blue,
    debug: colors.gray,
    trace: colors.gray,
  };

  const terminalOutput = [
    `${colors.bright}${colors.magenta}[${timestamp}]${colors.reset}`,
    `${colors.bright}${levelColors[level]}[${level.toUpperCase()}]${
      colors.reset
    }`,
    `${colors.cyan}[${logEntry.context}]${colors.reset}`,
    message,
    data ? `\n${JSON.stringify(data, null, 2)}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    terminalOutput,
    jsonLog: logEntry,
  };
}

/**
 * Format error with additional context
 */
function formatError(error, context) {
  const errorLog = {
    name: error.name,
    message: error.message,
    statusCode: error.statusCode,
    code: error.code,
    stack: error.stack,
    originalError: error.originalError,
  };

  return formatLogEntry(LOG_LEVELS.ERROR, error.message, context, errorLog);
}

/**
 * Log error messages
 */
export function logError(error, context) {
  if (!shouldLog(LOG_LEVELS.ERROR)) return;

  const { terminalOutput, jsonLog } = formatError(error, context);

  if (config.isDevelopment) {
    console.error(terminalOutput);
  } else {
    console.error(
      JSON.stringify({
        service: "client",
        ...jsonLog,
      })
    );
  }
}

/**
 * Log info messages
 */
export function logInfo(message, context, data = {}) {
  if (!shouldLog(LOG_LEVELS.INFO)) return;

  const { terminalOutput, jsonLog } = formatLogEntry(
    LOG_LEVELS.INFO,
    message,
    context,
    data
  );

  if (config.isDevelopment) {
    console.log(terminalOutput);
  } else {
    console.log(
      JSON.stringify({
        service: "client",
        ...jsonLog,
      })
    );
  }
}

/**
 * Log warning messages
 */
export function logWarning(message, context, data = {}) {
  if (!shouldLog(LOG_LEVELS.WARN)) return;

  const { terminalOutput, jsonLog } = formatLogEntry(
    LOG_LEVELS.WARN,
    message,
    context,
    data
  );

  if (config.isDevelopment) {
    console.warn(terminalOutput);
  } else {
    console.warn(
      JSON.stringify({
        service: "client",
        ...jsonLog,
      })
    );
  }
}

/**
 * Log debug messages
 */
export function logDebug(message, context, data = {}) {
  if (!shouldLog(LOG_LEVELS.DEBUG)) return;

  const { terminalOutput, jsonLog } = formatLogEntry(
    LOG_LEVELS.DEBUG,
    message,
    context,
    data
  );

  if (config.isDevelopment) {
    console.debug(terminalOutput);
  } else {
    console.debug(
      JSON.stringify({
        service: "client",
        ...jsonLog,
      })
    );
  }
}

/**
 * Log trace messages
 */
export function logTrace(message, context, data = {}) {
  if (!shouldLog(LOG_LEVELS.TRACE)) return;

  const { terminalOutput, jsonLog } = formatLogEntry(
    LOG_LEVELS.TRACE,
    message,
    context,
    data
  );

  if (config.isDevelopment) {
    console.debug(terminalOutput);
  } else {
    console.debug(
      JSON.stringify({
        service: "client",
        ...jsonLog,
      })
    );
  }
}
