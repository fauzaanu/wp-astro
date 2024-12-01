FROM node:22.11.0-bullseye-slim

# Create and change to the app directory
WORKDIR /app

# Copy local code to the container image
COPY . ./

# Remove node_modules and package-lock.json, then install dependencies
RUN rm -rf node_modules package-lock.json && npm install

# Build the application
RUN npm run build
