# Use lightweight Node.js image
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install dependencies with explicit mongoose installation
RUN npm install && npm install mongoose

# Install nodemon globally
RUN npm install -g nodemon

# Copy all files
COPY . .

# Expose WebSocket and backend ports
EXPOSE 3000 8080

# Use nodemon for live-reloading
CMD ["npm", "run", "dev"]
