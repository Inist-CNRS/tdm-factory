# TDM Backend Express Application

This project is an Express.js backend designed to handle TDM API endpoints.

## Getting Started

To get started with this project, follow these steps:

### Prerequisites

Make sure you have the following installed on your machine:

- Node.js (v18 or higher)
- npm (Node Package Manager)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Inist-CNRS/tdm-factory.git
   ```

2. Navigate to the project directory:

   ```bash
   cd tdm-factory/tdm-be
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the server:

   ```bash
   npm run start
   ```

The server will start running at `http://localhost:3000` (or the port specified in your environment variables).

## Folder Structure

The project structure is organized as follows:

- `src/`: Contains the source code of the Express application.
  - `routers/`: Contains route definitions for different endpoints.
  - `model/`: Defines data models or interacts with the database.
  - `services/`: Custom services here we have only one to send mail.
- `app.ts`: Entry point of the application.
- `config.json`: Configuration file of the application.
- `swagger.ts`: script to generate swagger files.

## Available Scripts

- `npm run start`: Start the server in production mode.
- `npm run swagger-autogen`: To generate swagger for config route (swagger-config.json) and for front end application (swagger.json).