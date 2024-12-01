# Use the Node alpine official image
# https://hub.docker.com/_/node
FROM node:22.8.0-alpine3.20

# Create and change to the app directory.
WORKDIR /app

# Copy local code to the container image.
COPY . ./

# Install packages
RUN npm i

RUN npm run build