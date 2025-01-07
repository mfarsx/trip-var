FROM node:18-alpine

WORKDIR /app

# Set environment variables
ENV NODE_ENV=development
ENV VITE_ENABLE_ERROR_REPORTING=false
ENV VITE_APP_VERSION=0.1.0
ENV VITE_API_URL=http://localhost:8000
ENV VITE_AI_API_URL=http://localhost:1234/v1

# Install dependencies first (better caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Create .env file for development
RUN echo "NODE_ENV=development" > .env && \
    echo "VITE_ENABLE_ERROR_REPORTING=false" >> .env && \
    echo "VITE_APP_VERSION=0.1.0" >> .env && \
    echo "VITE_API_URL=http://localhost:8000" >> .env && \
    echo "VITE_AI_API_URL=http://localhost:1234/v1" >> .env

# Expose Vite's default port
EXPOSE 5173

# Start Vite dev server with host flag to allow external access
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"] 