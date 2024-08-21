# IA Factory (previously TDM Factory)

This project is a web application to have an easy access to
It is a full-stack application containing an Express.js backend and a React.js frontend, dockerized using a single
Dockerfile for easier deployment and containerization.

## Overview

This application is composed of three parts:

- **Backend**: Built using Express, it provides API endpoints and handles server-side operations.
- **Frontend**: Developed in React, it offers a user interface to interact with the backend services.
- **Backoffice**: Developed in React, it offers a simple way to handle the application configuration

Each part is encapsulated within a Docker container using a single Dockerfile for streamlined deployment.

## Prerequisites

Make sure you have the following prerequisites installed:

- Docker: [Install Docker](https://docs.docker.com/get-docker/)
- Node.js 18, we highly recommend using [nvm](https://github.com/nvm-sh/nvm)

## Getting Started

Follow these steps to set up and run the application:

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Inist-CNRS/tdm-factory.git
   ```

2. Navigate to the project directory:

   ```bash
   cd tdm-factory
   ```

### Building the Docker Image

Build the Docker image using the provided Dockerfile:

```bash
docker build . -t tdm:v1.0.0 --no-cache
```

### Publishing a new version

To create a new version of IA Factory, create a new
[GitHub release](https://github.com/Inist-CNRS/tdm-factory/releases/new) with an associated tags.
This will run the ci and push an image into Docker Hub.

## Usage

To run the application in a Docker container:

```bash
docker run -p 3000:3000 tdm:v1.0.0
```

The frontend will be accessible at `http://localhost:3000/`, the swagger configuration
at `http://localhost:3000/swagger-config` and the backoffice at `http://localhost:3000/admin`.

## Development mode

You also need a [ngrok](https://ngrok.com/) host for the external host in `tdm-be/config/devlopement.json`,
to create a ngrok endpoints run `ngrok http 3000`.

After setting up this you can run `make run-dev`

### Services address

When you start the dev mode, you will be able to access those links:

- `http://localhost:3000` - Backend part
- `http://localhost:5173` - Frontend part
- `http://localhost:5174` - Backoffice part
- `http://localhost:1080` - Mail service (use to test the mail sending functionality)
