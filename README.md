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
docker build . -t tdm:v1.0.0 --no-cache
```

## Usage

To run the application in a Docker container:

```bash
docker run -p 3000:3000 tdm:v1.0.0
```

The frontend will be accessible at `http://localhost:3000/` and the swagger configuration at `http://localhost:3000/swagger-config`.


## Properties

There are two level of properties :

1. Back end property file `tdb-be\environment.ts`
   ```typescript
      const environment = {
      // Port configuration should be the same as dockerfile
      port: 3000,
      //Public URL of the project
      url: '',
      //Update with secured password
      password: '',
      // SMTP configuration for development
      smtp: {
         host: 'smtp.example.com',
         port: 587,
         auth: {
            user: '',
            pass: '',
         },
         service: 'gmail'
      },
      //ISTEX API retrieve file URL
      retrieveUrl: 'https://data-computer.services.istex.fr/v1/retrieve',
      fileFolder: 'uploads/',
      dumpFile: 'dump.tar.gz',
      finalFile: 'final.tar.gz',
      //CRON every day at 00:00 to remove file older than 7 days
      cron: {
         schedule: '0 0 * * *',
         deleteFileOlderThan: 7
      }
      };
      export default environment;
    ```
2. Dynamic property updatable from post request on swagger `${environment.url}/swagger-ui` protected with `user/${environment.password}`

   ```json
      {
         "wrappers": [
            {
               "url": "https://data-wrapper.services.istex.fr",
               "tags": [
               {
                  "name": "data-wrapper",
                  "excluded": []
               }
               ]
            }
         ],
         "enrichments": [
            {
               "url": "https://data-computer.services.istex.fr",
               "tags": [
               {
                  "name": "data-computer",
                  "excluded": [
                     "/v1/collect",
                     "/v1/lda",
                     "/v1/retrieve",
                     "/v1/mock-error-async",
                     "/v1/mock-error-sync"
                  ]
               }
               ]
            }
         ],
         "mailSuccess": {
            "subject": "Objet du mail succès",
            "text": "Vous pouvez télécharger le fichier enrichi à l&apos;adresse ci-dessous"
         },
         "mailError": {
            "subject": "Objet du mail d&apos;erreur",
            "text": "Une erreur s&apos;est produite lors de l&apos;enrichissement"
         }
      }
   ```
- `wrappers` Can contain multiple wrapper API
   - `url` URL of the APi
   - `tags` Tags to include from this api
      - `name` Tag Name 
      - `excluded` String table of route to exclude from this tag
- `enrichments` Can contain multiple enrichment API
   - `url` URL of the APi
   - `tags` Tags to include from this api
      - `name` Tag Name 
      - `excluded` String table of route to exclude from this tag
- `mailSuccess` Template for the success mail
   - `subject` Subject of the mail
   - `text` Text content for the mail
- `mailError` Template for the failure mail
   - `subject` Subject of the mail
   - `text` Text content for the mail

