# syntax=docker/dockerfile:1.4
FROM node:22-slim

WORKDIR /app

# Copy app source
COPY package*.json ./
COPY tsconfig.json ./

RUN apt-get update -y && \
    apt-get install -y openssl libssl-dev && \
    rm -rf /var/lib/apt/lists/*

RUN npm install --legacy-peer-deps

# Install TypeScript globally
RUN npm install -g typescript

COPY . .

RUN npx prisma generate 

RUN npm run nexus

# Build the server
RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build

EXPOSE 4000

CMD ["node", "dist/src/server.js"]