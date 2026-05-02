import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CHAT_CONFIG, NODE_ENV } from "../config/constants.js";
import { logger } from "../utils/logger.js";

const client = new SecretManagerServiceClient();
let genAI;

async function getApiKey() {
  if (NODE_ENV !== "production") {
    return process.env.GEMINI_API_KEY;
  }
  
  try {
    const [version] = await client.accessSecretVersion({
      name: "projects/speedy-aurora-471602-c2/secrets/GEMINI_API_KEY/versions/latest",
    });
    return version.payload.data.toString();
  } catch (error) {
    logger.error("Failed to fetch GEMINI_API_KEY from Secret Manager", { error: error.message });
    throw error;
  }
}

export const getGeminiModel = async () => {
  if (!genAI) {
    const apiKey = await getApiKey();
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI.getGenerativeModel({
    model: CHAT_CONFIG.MODEL,
    systemInstruction: CHAT_CONFIG.SYSTEM_INSTRUCTION
  });
};

export const startChatSession = async (history) => {
  const model = await getGeminiModel();
  return model.startChat({
    history,
    generationConfig: {
      maxOutputTokens: 600,
      temperature: 0.2,
    },
  });
};
