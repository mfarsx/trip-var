FROM node:20-alpine
WORKDIR /app

# Install dependencies (including dev dependencies for development)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Add error handling and startup information
CMD ["sh", "-c", "echo '🚀 Starting Tripvar Client...' && npm run dev -- --host 0.0.0.0"]