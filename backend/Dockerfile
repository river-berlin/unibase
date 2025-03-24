# This Dockerfile is to be used for development purposes only.
# It is not intended to be used in production.

FROM node:23-slim

# Add build version for verification
ENV BUILD_VERSION=1

# Install build dependencies including Xvfb and OpenGL support
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    git \
    openscad \
    xvfb \
    mesa-utils \
    libosmesa6 \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

# Set up virtual display
ENV DISPLAY=:99

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and rebuild SQLite
RUN npm install && \
    npm rebuild better-sqlite3

# Copy the rest of the application
COPY . .

# Compile TypeScript files
RUN npx tsc src/database/migrations/*.ts --outDir dist/migrations --esModuleInterop true --target es2020 --module es2020 --moduleResolution node

# Start Xvfb before the application
CMD Xvfb :99 -screen 0 1024x768x16 -ac & \
    npm run dev