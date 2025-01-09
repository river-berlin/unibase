FROM node:18-bullseye

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm rebuild better-sqlite3

COPY . .

CMD npm install && npm rebuild better-sqlite3 && npm run dev