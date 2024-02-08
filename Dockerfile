# Stage 1 - Building Stage: Build the front-end application
FROM node:18.19-bullseye-slim AS react-build

# Switch to the main working directory
WORKDIR /app

# Copy both package.json and package-lock.json files
COPY tdm-fe/package*.json /app/

# Install dependency
RUN npm install

# Copy the front-end source code into the build container
COPY tdm-fe /app/

# Build the React app
RUN npm run build

#######################################################

# Stage 1 - Building Stage: Build back-end application
FROM node:18.19-bullseye-slim AS express-build

# Switch to the main working directory
WORKDIR /app

# Copy package.json, package-lock.json and tsconfig.json files
COPY tdm-be/package*.json tdm-be/ts*.json /app/

# Install dependency
RUN npm install

# Copy the back-end source code into the build container
COPY tdm-be /app/

# Build the Express app
RUN npm run build

#######################################################

# Stage 1 - Building Stage: Build back-end node modules
FROM node:18.19-bullseye-slim AS node-modules

# Switch to the main working directory
WORKDIR /app

# Copy package.json, package-lock.json and tsconfig.json files
COPY tdm-be/package*.json tdm-be/ts*.json /app/

# Install production dependency
RUN npm install --omit=dev

#######################################################

# Stage 2 - Application Stage: Build the application image
FROM node:18.19-bullseye-slim AS application

# Add ezmaster config file
RUN echo '{ \
    "httpPort": 3000, \
    "configPath": "/app/config.json", \
    "dataPath": "/app" \
    }' > /etc/ezmaster.json

# Update npm folder write permision
WORKDIR /usr/sbin/.npm
RUN chmod -R a+rwx /usr/sbin/.npm

# Switch to the daemon user and main working directory
USER daemon
WORKDIR /app

# Copy back-end files from the build container
COPY --chown=daemon:daemon --from=express-build /app/package.json /app/
COPY --chown=daemon:daemon --from=express-build /app/package-lock.json /app/
COPY --chown=daemon:daemon --from=node-modules /app/node_modules /app/node_modules/
COPY --chown=daemon:daemon --from=express-build /app/swagger-config.json /app/
COPY --chown=daemon:daemon --from=express-build /app/swagger.json /app/
COPY --chown=daemon:daemon --from=express-build /app/config.json /app/
COPY --chown=daemon:daemon --from=express-build /app/dist /app/

# Copy front-end files from the build container and create the required folder
COPY --chown=daemon:daemon --from=react-build /app/.next /app/public/_next/
RUN mkdir /app/public/downloads
RUN mkdir /app/uploads

# Start the application
EXPOSE 3000
ENV NODE_ENV="production"
CMD ["npm", "start"]