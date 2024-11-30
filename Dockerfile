# Use the official Node.js image as the base image
FROM node:18 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project into the container
COPY . .

# Build the Astro project (for production)
RUN npm run build

# Install the necessary packages to run Astro in production
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to install production dependencies
COPY package*.json ./

# Install only the production dependencies
RUN npm install --omit=dev

# Copy the rest of the application
COPY . .

ENV ASTRO_PORT=3000

# Expose the port for the Astro app (default is 3000)
EXPOSE 3000

# Start the Astro app in production mode
CMD ["npm", "run", "start"]
