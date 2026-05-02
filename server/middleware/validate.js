import { logger } from "../utils/logger.js";
import { CHAT_CONFIG } from "../config/constants.js";

export const validateChatInput = (req, res, next) => {
  const { message, sessionId } = req.body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Message is required and must be a string." });
  }

  if (message.length > CHAT_CONFIG.MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: `Message too long. Max ${CHAT_CONFIG.MAX_MESSAGE_LENGTH} characters.` });
  }

  if (sessionId && (typeof sessionId !== "string" || sessionId.length > 50)) {
    return res.status(400).json({ error: "Invalid session identifier." });
  }

  // Sanitization: Basic trim (HTML sanitization happens on frontend via DOMPurify before display)
  req.body.message = message.trim();
  
  next();
};
