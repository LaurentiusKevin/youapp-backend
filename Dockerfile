# Dockerfile

# Use Node.js image
FROM node:20

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./

# Install the application dependencies
RUN npm install
RUN npm rebuild bcrypt

# Copy the rest of the app
COPY . .

# Expose the port your app runs on (e.g., 3000)
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start:dev"]
