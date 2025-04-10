import swaggerJsdoc from 'swagger-jsdoc';
import { writeFileSync } from 'fs';

// Replace this with http://localhost:3000 in dev mode and run `make update-front-api`
const HOST = '';

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Express Swagger API',
            version: '1.0.0',
            description: 'A simple Express API with Swagger documentation',
        },
        servers: [
            {
                url: `${HOST}/api`,
            },
        ],
    },
    // Specify the file containing your routes
    apis: ['./src/controller/data-enrichment.ts', './src/controller/data-wrapper.ts', './src/controller/traitment.ts'],
};

const swaggerOptionsConfig = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Express Swagger API',
            version: '1.0.0',
            description: 'A simple Express API with Swagger documentation',
        },
        servers: [
            {
                url: `${HOST}/`,
            },
        ],
    },
    apis: ['./src/controller/config.ts', './src/controller/config-static.ts'], // Specify the file containing your routes
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Write Swagger JSON to a file
const swaggerJson = JSON.stringify(swaggerSpec, null, 2);
writeFileSync('../tdm-fe/src/swagger.json', swaggerJson);

const swaggerSpecConfig = swaggerJsdoc(swaggerOptionsConfig);

// Write Swagger JSON to a file
const swaggerJsonConfig = JSON.stringify(swaggerSpecConfig, null, 2);
writeFileSync('./src/swagger/swagger-config.json', swaggerJsonConfig);

console.log('Swagger JSON file generated successfully');
