# TDM Frontend React.js Application

This project is a React.js application built to provide TDM application.

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
   cd tdm-factory/tdm-fe
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

### Running the Application

To start the development server:

```bash
npm run dev
```

The application will run on `http://localhost:3000` by default. Open this URL in your browser to view it.

## Folder Structure

The project structure is organized as follows:

- `public/`: Contains the public assets, HTML template, and favicon.
- `src/`: Contains the source code of the React application.
  - `app/`: 
    - `components/`: Reusable UI components.
    - `globals.css`: Global CSS of the application.
    - `page.tsx`: Main component where components are assembled.
    - `layout.tsx`: Entry point of the application.
  - `generated`: Generated from open api and swagger.json file.

## Available Scripts

In the project directory, you can run the following scripts:

- `npm run dev`: Runs the app in development mode.
- `npm run generate-api`: To generate front end api calls from `..\tdm-be\swagger.json` file.
- `npm run build`: Builds the app for production to the `.next` folder.