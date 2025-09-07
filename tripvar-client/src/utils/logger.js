const LOG_LEVELS = {
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
};

const COLORS = {
  debug: "#7f8c8d", // Gray
  info: "#2ecc71", // Green
  warn: "#f1c40f", // Yellow
  error: "#e74c3c", // Red
};

class Logger {
  constructor() {
    this.isDevelopment = import.meta.env.MODE === "development";
  }

  _formatMessage(level, message, data) {
    const timestamp = new Date().toISOString();
    const color = COLORS[level];

    let formattedData = "";
    if (data) {
      formattedData =
        typeof data === "object"
          ? `\n${JSON.stringify(data, null, 2)}`
          : ` ${data}`;
    }

    return {
      messageString: `[${timestamp}] [${level.toUpperCase()}] ${message}${formattedData}`,
      color,
    };
  }

  debug(message, data) {
    if (this.isDevelopment) {
      const { messageString, color } = this._formatMessage(
        LOG_LEVELS.DEBUG,
        message,
        data
      );
      console.debug(`%c${messageString}`, `color: ${color}`);
    }
  }

  info(message, data) {
    const { messageString, color } = this._formatMessage(
      LOG_LEVELS.INFO,
      message,
      data
    );
    console.info(`%c${messageString}`, `color: ${color}`);
  }

  warn(message, data) {
    const { messageString, color } = this._formatMessage(
      LOG_LEVELS.WARN,
      message,
      data
    );
    console.warn(`%c${messageString}`, `color: ${color}`);
  }

  error(message, error) {
    const data =
      error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
            ...error,
          }
        : error;

    const { messageString, color } = this._formatMessage(
      LOG_LEVELS.ERROR,
      message,
      data
    );
    console.error(`%c${messageString}`, `color: ${color}`);
  }

  // Special method for logging HTTP requests
  logRequest(method, url) {
    this.debug(`${method} ${url}`);
  }

  // Special method for logging HTTP responses
  logResponse(method, url, response, duration) {
    const logData = {
      status: response.status,
      duration: `${duration}ms`,
    };

    if (response.status >= 200 && response.status < 300) {
      this.info(`${method} ${url} - Success`, logData);
    } else {
      this.error(`${method} ${url} - Failed`, logData);
    }
  }
}

export const logger = new Logger();
export default logger;
