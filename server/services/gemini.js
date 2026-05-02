import { GoogleGenerativeAI } from "@google/generative-ai";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { logger } from "../utils/logger.js";
import { GEMINI_CONFIG } from "../config/constants.js";

const secretClient = new SecretManagerServiceClient();

/**
 * Retrieves the Gemini API key from Google Cloud Secret Manager.
 * @returns {Promise<string>} The API key.
 * @throws {Error} If secret retrieval fails.
 */
async function getApiKey() {
  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || await secretClient.getProjectId();
    const [version] = await secretClient.accessSecretVersion({
      name: `projects/${projectId}/secrets/GEMINI_API_KEY/versions/latest`,
    });
    return version.payload.data.toString();
  } catch (error) {
    logger.error("Secret Manager Access Failed", { error: error.message });
    return process.env.GEMINI_API_KEY;
  }
}

/**
 * Initializes and starts a generative chat session with Gemini 1.5 Flash.
 * @param {Array<Object>} history - Previous message history for context.
 * @returns {Promise<Object>} The initialized chat session object.
 */
export const startChatSession = async (history = []) => {
  const apiKey = await getApiKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: GEMINI_CONFIG.MODEL_NAME,
    systemInstruction: GEMINI_CONFIG.SYSTEM_PROMPT
  });

  return model.startChat({
    history: history.map(msg => ({
      role: msg.role,
      parts: msg.parts
    })),
    generationConfig: {
      maxOutputTokens: GEMINI_CONFIG.MAX_TOKENS,
      temperature: GEMINI_CONFIG.TEMPERATURE,
    },
  });
};
