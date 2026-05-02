import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { logger } from "../utils/logger.js";

let db;

try {
  // initializeApp() with no args auto-detects GCP environment credentials
  initializeApp();
  db = getFirestore();
  db.settings({ ignoreUndefinedProperties: true });
  logger.info("Firestore service initialized");
} catch (error) {
  logger.error("Firestore initialization failed", { error: error.message });
}

/**
 * Persist a chat message to a user's conversation session.
 * Uses atomic arrayUnion for thread safety.
 */
export const saveMessage = async (userId, conversationId, message) => {
  if (!db) return;
  
  try {
    const docRef = db.collection("users").doc(userId).collection("conversations").doc(conversationId);
    
    await docRef.set({
      messages: FieldValue.arrayUnion({
        role: message.role,
        parts: message.parts,
        timestamp: new Date().toISOString(),
        meta: message.meta || {}
      }),
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
    
  } catch (error) {
    logger.error("Firestore save error", { userId, error: error.message });
  }
};

/**
 * Retrieve chat history for context.
 * Limits to the most recent messages for performance and token efficiency.
 */
export const getHistory = async (userId, conversationId) => {
  if (!db) return [];

  try {
    const doc = await db.collection("users").doc(userId).collection("conversations").doc(conversationId).get();
    
    if (doc.exists) {
      const messages = doc.data().messages || [];
      // Return last 10 messages to stay within context window limits
      return messages.slice(-10);
    }
    return [];
  } catch (error) {
    logger.error("Firestore fetch error", { userId, error: error.message });
    return [];
  }
};
