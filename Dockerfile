# Stage 1 - Building Stage: Build the front-end application
FROM node:20.19.5-bullseye-slim AS front-end-build

# Switch to the main working directory
WORKDIR /app

# Copy both package.json and package-lock.json files
COPY tdm-fe/package*.json /app/

# Install dependency
RUN npm ci

# Copy the front-end source code into the build container
COPY tdm-fe /app/

# Build the React app
RUN VITE_TDM_FACTORY_HOST="" npm run build

#######################################################

# Stage 1 - Building Stage: Build the back-office application
FROM node:20.19.5-bullseye-slim AS back-office-build

# Switch to the main working directory
WORKDIR /app

# Copy both package.json and package-lock.json files
COPY tdm-admin/package*.json /app/

# Install dependency
RUN npm ci

# Copy the front-end source code into the build container
COPY tdm-admin /app/

# Build the React app
RUN VITE_TDM_FACTORY_HOST="" npm run build

#######################################################

# Stage 1 - Building Stage: Build back-end application
FROM node:20.19.5-bullseye-slim AS express-build

# Switch to the main working directory
WORKDIR /app

# Copy package.json, package-lock.json and tsconfig.json files
COPY tdm-be/package*.json tdm-be/ts*.json /app/

# Install dependency
RUN npm ci --omit=dev

# Copy the back-end source code into the build container
COPY tdm-be /app/

#######################################################

# Stage 2 - Application Stage: Build the application image
FROM node:20.19.5-bullseye-slim AS application

# Add ezmaster config file
RUN echo '{ \
    "httpPort": 3000, \
    "configPath": "/app/config/production.json", \
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
COPY --chown=daemon:daemon --from=express-build /app/tsconfig.json /app/
COPY --chown=daemon:daemon --from=express-build /app/node_modules /app/node_modules/
COPY --chown=daemon:daemon --from=express-build /app/config/default.json /app/config/
COPY --chown=daemon:daemon --from=express-build /app/config/production.json /app/config/
COPY --chown=daemon:daemon --from=express-build /app/src /app/src

# Copy front-end files from the build container
COPY --chown=daemon:daemon --from=front-end-build /app/dist /app/public/

# Copy front-end files from the build container
COPY --chown=daemon:daemon --from=back-office-build /app/dist /app/public/admin/

# Create the required folder
RUN mkdir /app/public/downloads
RUN mkdir /app/uploads
RUN mkdir /app/logs
RUN mkdir /app/tmp

# Start the application
EXPOSE 3000
ENV NODE_ENV="production"
CMD ["npm", "start"]
