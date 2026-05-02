import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 8080;
export const NODE_ENV = process.env.NODE_ENV || "production";
export const ALLOWED_ORIGIN = "https://civicguide-india-619800545642.us-central1.run.app";

export const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 500,
  MAX_HISTORY_LENGTH: 10,
  TIMEOUT_MS: 30000,
};

export const GEMINI_CONFIG = {
  MODEL_NAME: "gemini-1.5-flash",
  SYSTEM_PROMPT: "You are CivicGuide, a neutral expert on Indian Election processes. Use bullet points. Provide clear, procedural information about voting, registration, and timelines. Do not discuss specific political parties or candidates. If asked about non-election topics, politely refocus on civic processes.",
  TEMPERATURE: 0.7,
  MAX_TOKENS: 2048
};
