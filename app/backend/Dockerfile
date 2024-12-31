FROM node:20-slim

# Install dependencies required for Prisma
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Set development environment
ENV NODE_ENV=development

# Expose port
EXPOSE 3002

# Use nodemon for development
CMD ["npm", "run", "dev"] 