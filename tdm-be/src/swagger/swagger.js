const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');

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
                url: `/api`,
            },
        ],
    },
    apis: ['./src/controller/data-enrichment.ts', './src/controller/data-wrapper.ts', './src/controller/traitment.ts'], // Specify the file containing your routes
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
                url: `/`,
            },
        ],
    },
    apis: ['./src/controller/config.ts'], // Specify the file containing your routes
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Write Swagger JSON to a file
const swaggerJson = JSON.stringify(swaggerSpec, null, 2);
fs.writeFileSync(__dirname + '/swagger.json', swaggerJson);

const swaggerSpecConfig = swaggerJsdoc(swaggerOptionsConfig);

// Write Swagger JSON to a file
const swaggerJsonConfig = JSON.stringify(swaggerSpecConfig, null, 2);
fs.writeFileSync(__dirname + '/swagger-config.json', swaggerJsonConfig);

console.log('Swagger JSON file generated successfully');
