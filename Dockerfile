# Use Debian-based Node image (NOT alpine)
FROM node:20-bookworm-slim

# Install Chromium and required libs
RUN apt-get update && apt-get install -y \
  chromium \
  fonts-liberation \
  libnss3 \
  libxss1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libgtk-3-0 \
  ca-certificates \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# App directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy app source
COPY . .

# Environment variables
ENV NODE_ENV=production
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Expose Cloud Run port
EXPOSE 8080

# Start app
CMD ["node", "index.js"]
