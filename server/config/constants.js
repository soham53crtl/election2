import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 8080;
export const NODE_ENV = process.env.NODE_ENV || "production";
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const ALLOWED_ORIGIN = "https://civicguide-india-619800545642.us-central1.run.app";

export const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 500,
  MAX_HISTORY_LENGTH: 10,
  TIMEOUT_MS: 20000,
  MODEL: "gemini-1.5-flash",
  SYSTEM_INSTRUCTION: "You are CivicGuide, a neutral expert on Indian Election processes. Use bullet points. No politics or parties. Refocus non-election questions."
};
