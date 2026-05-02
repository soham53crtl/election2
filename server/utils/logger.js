/**
 * Structured logger for production-grade cloud observability.
 * Formats logs as JSON for seamless integration with Google Cloud Logging.
 */
export const logger = {
  /**
   * Log an informational message.
   * @param {string} msg - The message to log.
   * @param {Object} [meta={}] - Additional metadata to include in the JSON log.
   */
  info: (msg, meta = {}) => {
    console.log(JSON.stringify({ 
      severity: "INFO", 
      timestamp: new Date().toISOString(), 
      message: msg, 
      ...meta 
    }));
  },

  /**
   * Log an error message.
   * @param {string} msg - The error message to log.
   * @param {Object} [meta={}] - Error details or context.
   */
  error: (msg, meta = {}) => {
    console.error(JSON.stringify({ 
      severity: "ERROR", 
      timestamp: new Date().toISOString(), 
      message: msg, 
      ...meta 
    }));
  },

  /**
   * Log a warning message.
   * @param {string} msg - The warning message.
   * @param {Object} [meta={}] - Warning context.
   */
  warn: (msg, meta = {}) => {
    console.warn(JSON.stringify({ 
      severity: "WARNING", 
      timestamp: new Date().toISOString(), 
      message: msg, 
      ...meta 
    }));
  }
};
