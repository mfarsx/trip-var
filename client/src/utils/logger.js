import config from "../config";

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function formatError(error, context) {
  const timestamp = new Date().toISOString();
  const errorLog = {
    timestamp,
    context,
    name: error.name,
    message: error.message,
    statusCode: error.statusCode,
    stack: error.stack,
    originalError: error.originalError,
  };

  // Format for terminal output
  const terminalOutput = [
    `${colors.bright}${colors.magenta}[${timestamp}]${colors.reset}`,
    `${colors.bright}${colors.red}[ERROR]${colors.reset}`,
    `${colors.cyan}[${context}]${colors.reset}`,
    `${colors.bright}${error.name}${colors.reset}:`,
    error.message,
    error.statusCode
      ? `${colors.yellow}Status: ${error.statusCode}${colors.reset}`
      : "",
    config.isDevelopment && error.stack
      ? `\n${colors.bright}Stack:${colors.reset}\n${error.stack}`
      : "",
    error.originalError
      ? `\n${colors.bright}Original Error:${colors.reset}\n${JSON.stringify(
          error.originalError,
          null,
          2
        )}`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    terminalOutput,
    jsonLog: {
      level: "error",
      ...errorLog,
    },
  };
}

export function logError(error, context, service = "client") {
  const { terminalOutput, jsonLog } = formatError(error, context);

  // Always log to terminal for local development
  console.error(terminalOutput);

  // Log structured JSON for container logs
  console.error(
    JSON.stringify({
      service,
      ...jsonLog,
    })
  );
}

export function logInfo(message, context, data = {}) {
  const timestamp = new Date().toISOString();
  const terminalOutput = [
    `${colors.bright}${colors.magenta}[${timestamp}]${colors.reset}`,
    `${colors.bright}${colors.blue}[INFO]${colors.reset}`,
    `${colors.cyan}[${context}]${colors.reset}`,
    message,
    Object.keys(data).length ? `\n${JSON.stringify(data, null, 2)}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  console.log(terminalOutput);
}

export function logWarning(message, context, data = {}) {
  const timestamp = new Date().toISOString();
  const terminalOutput = [
    `${colors.bright}${colors.magenta}[${timestamp}]${colors.reset}`,
    `${colors.bright}${colors.yellow}[WARN]${colors.reset}`,
    `${colors.cyan}[${context}]${colors.reset}`,
    message,
    Object.keys(data).length ? `\n${JSON.stringify(data, null, 2)}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  console.warn(terminalOutput);
}
