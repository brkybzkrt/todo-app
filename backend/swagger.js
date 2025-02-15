const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Todo App API Documentation',
            version: '1.0.0',
            description: 'Documentation for Todo App REST API',
        },
        servers: [
            {
                url: 'http://localhost:3000/v1',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{
            bearerAuth: [],
        }],
    },
    apis: [
        './backend/routes/*.js',
    ],
};

const specs = swaggerJsdoc(options);
module.exports = specs;
