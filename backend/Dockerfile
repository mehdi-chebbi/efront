# Use official Node.js LTS image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app
COPY . .

# Expose default Node.js port (optional, change if your app uses a different port)
EXPOSE 5001

# Command to run your app
CMD ["npm", "start"]
