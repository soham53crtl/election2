import express from "express";
import rateLimit from "express-rate-limit";
import { startChatSession } from "../services/gemini.js";
import { saveMessage, getHistory } from "../services/db.js";
import { logger } from "../utils/logger.js";
import { CHAT_CONFIG } from "../config/constants.js";
import { validateChatInput } from "../middleware/validate.js";

const router = express.Router();

const userRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  keyGenerator: (req) => req.user.uid,
  message: { error: "Chat quota exceeded. Please wait a few minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/chat", userRateLimiter, validateChatInput, async (req, res) => {
  const { message, sessionId = "default" } = req.body;
  const userId = req.user.uid;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const abortController = new AbortController();
  req.on("close", () => {
    logger.info("Client disconnected", { userId, sessionId });
    abortController.abort();
  });

  const timeoutId = setTimeout(() => abortController.abort(), CHAT_CONFIG.TIMEOUT_MS);

  try {
    const history = await getHistory(userId, sessionId);
    const chat = await startChatSession(history.slice(-CHAT_CONFIG.MAX_HISTORY_LENGTH));
    
    const startTime = Date.now();
    const result = await chat.sendMessageStream(message, { signal: abortController.signal });

    let fullText = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
    }
    const latency = Date.now() - startTime;

    saveMessage(userId, sessionId, { 
      role: "user", 
      parts: [{ text: message }],
      meta: { latency }
    }).catch(e => logger.error("DB Save Failed", { userId }));
    
    saveMessage(userId, sessionId, { role: "model", parts: [{ text: fullText }] })
      .catch(e => logger.error("DB Save Failed", { userId }));

    clearTimeout(timeoutId);
    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name !== "AbortError") {
      logger.error("Chat API Error", { userId, error: error.message });
      res.write(`data: ${JSON.stringify({ error: "Service temporarily unavailable." })}\n\n`);
    }
    res.end();
  }
});

export default router;
