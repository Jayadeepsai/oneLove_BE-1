# Use the official Node.js base image
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application files to the container
COPY . .

# Expose the port on which your Node.js application runs (change this if your app runs on a different port)
EXPOSE 8080

# Command to start your Node.js application
CMD ["node", "server.js"]
