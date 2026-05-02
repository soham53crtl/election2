# --- STAGE 1: BUILD FRONTEND ---
FROM node:20-alpine AS client-build
WORKDIR /app

# Install client dependencies
COPY client/package*.json ./
RUN npm install --legacy-peer-deps

# Build client
COPY client/ .
RUN npm run build

# --- STAGE 2: PRODUCTION RUNTIME ---
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy only production server dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --production && \
    npm cache clean --force

# Copy server source
COPY server/ .

# Copy built frontend assets to the server's public folder
COPY --from=client-build /app/dist /app/dist

# Go back to server root to run
WORKDIR /app/server

# Security: Non-root user
USER node

# Monitoring
EXPOSE 8080

CMD ["node", "index.js"]
