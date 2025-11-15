FROM node:22-slim

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

#For Prisma
RUN apt-get update && \
    apt-get install -y libssl3 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN npm install --legacy-peer-deps

RUN npm install -g typescript

COPY . .

RUN cd /app/prisma && npx prisma generate

ENV NODE_OPTIONS="--max-old-space-size=3072"

RUN npm run build

EXPOSE 3000

CMD ["npm","start"]
