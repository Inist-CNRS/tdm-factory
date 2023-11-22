# Use an official Node.js runtime as a parent image
FROM node:lts-slim AS react-build

# Switch back to the main working directory
WORKDIR /app

# Copy both package.json and package-lock.json files
COPY tdm-fe/package*.json tdm-fe/. /app

#Install dependency
RUN npm install

# Copy the front source code into the container
COPY tdm-fe /app/

# Build the React app
RUN npm run build

# Stage 2: Serve React App using Express
FROM node:lts-slim

WORKDIR /usr/src/app


# Copy both package.json and package-lock.json files
COPY tdm-be/package*.json tdm-be/. /usr/src/app/

# Install backend dependencies
RUN npm install
RUN npm run build

# Copy the backend source code into the container
COPY tdm-be /usr/src/app


# Copy built React app from the previous stage
COPY --from=react-build /app/.next /usr/src/app/public/_next

# Expose the port your Express server will run on
EXPOSE 3000

# Start the Express app
CMD ["npm", "start"]