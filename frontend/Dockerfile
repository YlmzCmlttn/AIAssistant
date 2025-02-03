# Stage 1: Build the React app
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies and build
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the build with Nginx
FROM nginx:stable-alpine
# Remove default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*
# Copy the build output from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
