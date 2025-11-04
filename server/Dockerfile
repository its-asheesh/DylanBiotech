# server/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --silent

# Copy source code
COPY . .

# Expose port
EXPOSE 5001

# Start server
CMD ["npm", "run", "dev"]