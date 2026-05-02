import { getAuth } from "firebase-admin/auth";
import { logger } from "../utils/logger.js";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    req.user = decodedToken; // Contains userId as 'uid'
    next();
  } catch (error) {
    logger.warn("Invalid token attempt", { error: error.message });
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};
