FROM node:20-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Expo CLI globally
RUN npm install -g expo-cli

# Copy the rest of the application
COPY . .

# Expose the ports Expo uses
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

# Start the application
CMD ["npm", "start"] 