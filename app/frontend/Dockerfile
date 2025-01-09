FROM node:18-bullseye

# Install OpenSCAD and OpenSSL
RUN apt-get update && apt-get install -y \
    openscad \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Set up backend-js-api
WORKDIR /backend-js-api
# We don't copy files here because they'll be mounted as a volume

# Set up frontend
WORKDIR /app
COPY package*.json ./

# Expose the default Expo port
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002
EXPOSE 8081

# Start the application
CMD ["sh", "-c", "npm install && (npm run copy-api && npm run web)"] 