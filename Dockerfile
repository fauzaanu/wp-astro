# Use the Node alpine official image
# https://hub.docker.com/_/node
FROM node:22.8.0-alpine3.20

# Create and change to the app directory.
WORKDIR /app

# Copy the files to the container image
COPY package*.json ./

# Install packages
RUN npm i

# Copy local code to the container image.
COPY . ./