FROM node:24-alpine

RUN apk add --no-cache netcat-openbsd curl sqlite dos2unix

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Create data directory for SQLite
RUN mkdir -p /app/data

# Build TypeScript
RUN npm run build

# Convert line endings and make scripts executable (for Windows compatibility)
RUN dos2unix scripts/*.sh && chmod +x scripts/*.sh

EXPOSE 8000

CMD ["sh", "scripts/start.sh"]
