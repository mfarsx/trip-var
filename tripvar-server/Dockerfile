FROM node:20-alpine

WORKDIR /usr/src/app

# Install curl for health checks
RUN apk --no-cache add curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 8000

# Start the application
CMD ["npm", "run", "dev"]
