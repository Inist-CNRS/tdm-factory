# TDM Factory

## Project Overview

This is a full-stack web application for easy access to TDM Factory. It consists of three main parts:

* **Backend (`tdm-be`):** An Express.js application that provides the API endpoints and handles server-side operations. It uses TypeScript and `better-sqlite3` for the database.
* **Frontend (`tdm-fe`):** A React.js application built with Vite that provides the main user interface for interacting with the backend services. It uses TypeScript and Material-UI.
* **Admin/Backoffice (`tdm-admin`):** A React.js application built with Vite that provides a simple way to handle the application configuration. It also uses TypeScript and Material-UI.

The entire application is containerized using Docker for streamlined deployment.

## Building and Running

### Development

To run the application in development mode, you need to have Node.js 20.19.5 (LTS) and Docker installed.

1. **Install dependencies:**

```bash
make install
```

2. **Run the development servers:**

You also need a [ngrok](https://ngrok.com/) host for the external host in `tdm-be/config/development.json`, to create a ngrok endpoints run `ngrok http 3000`.

```bash
make run-dev
```

This will start the following services:

* Backend: `http://localhost:3000`
* Frontend: `http://localhost:5173`
* Admin: `http://localhost:5174/admin/`
* MailHog (for testing emails): `http://localhost:1080`

### Production (Docker)

1. **Build the Docker image:**

    ```bash
    make run-docker
    ```

2. **Run the application:**

    The application will be accessible at `http://localhost:3000`.
    * The frontend will be accessible at `http://localhost:3000/`
    * The swagger configuration at `http://localhost:3000/swagger-config`
    * The back-office at `http://localhost:3000/admin`

## Development Conventions

* **Linting:** The project uses ESLint for linting. To run the linter, use the following command:

    ```bash
    make lint-fix
    ```

* **Testing:** The frontend application (`tdm-fe`) uses Playwright for end-to-end testing. You can run the tests with the following command:

    ```bash
    cd tdm-fe && npm run test:e2e
    ```
