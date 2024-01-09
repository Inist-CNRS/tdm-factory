# TDM Factory

This project is a web application to have an easy access to 
It is a full-stack application containing an Express.js backend and a React.js frontend, dockerized using a single Dockerfile for easier deployment and containerization.

## Overview

This application comprises both the backend and frontend components:

- **Backend**: Built using Express.js, it provides API endpoints and handles server-side operations.
- **Frontend**: Developed in React.js, it offers a user interface to interact with the backend services.

Both the backend and frontend are encapsulated within a Docker container using a single Dockerfile for streamlined deployment.

## Prerequisites

Make sure you have the following prerequisites installed:

- Docker: [Install Docker](https://docs.docker.com/get-docker/)
- Node.js (v18 or higher) and npm (for local development)

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
	- docker build . -t tdm:v1.0.0 --no-cache
```

## Usage

To run the application in a Docker container:

```bash
docker run -p 8080:8080 tdm:v1.0.0
```

The frontend will be accessible at `http://localhost:8080/` and the swagger configuration at `http://localhost:8080/swagger-config`.
