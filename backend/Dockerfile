# backend/Dockerfile

# Use the official Node.js LTS image
FROM node:18

# Create and set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install backend dependencies
RUN npm install

# Copy the entire backend codebase
COPY . .

# Expose port 3000 to the host
EXPOSE 3000

# Define the command to run the backend server
CMD ["node", "index.js"]
