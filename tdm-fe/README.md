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

The application will run on `http://localhost:5173` by default. Open this URL in your browser to view it.

## Folder Structure

The project structure is organized as follows:

- `public/`: Contains the public assets, HTML template, and favicon.
- `src/`: Contains the source code of the React application.
  - `app/`:
    - `components/`: Reusable UI components.
    - `globals.css`: Global CSS of the application.
    - `page.tsx`: Main component where components are assembled.
    - `layout.tsx`: Entry point of the application.

## Available Scripts

In the project directory, you can run the following scripts:

- `npm run dev`: Runs the app in development mode.
- `npm run build`: Builds the app for production to the `dist` folder.

## Static config

You can use this service in any React component, for example, the
`tdm-fe/src/app/components/MyComponent.tsx` file:

````typescript
import { useQuery } from '@tanstack/react-query';
import { getStaticConfig } from '~/app/services/config';

export const MyComponent = () => {
    const { data: config, isLoading, error } = useQuery({
        queryKey: ['static-config'],
        queryFn: getStaticConfig
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading configuration</div>;

    return (
        <div>
            <h2>Configuration</h2>
            <pre>{JSON.stringify(config, null, 2)}</pre>
        </div>
    );
};
````

Static config contains `flows`.
