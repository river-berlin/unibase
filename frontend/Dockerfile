FROM node:18-bullseye

# Set up frontend
WORKDIR /app

# Expose the default Expo port
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002
EXPOSE 8081

# Start the application
CMD ["sh", "-c", "npm install && (npm run copy-api && npm run web)"] 