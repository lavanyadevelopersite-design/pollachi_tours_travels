const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tours & Travels CRM API',
      version: '1.0.0',
      description: 'Production-ready Tours & Travels CRM backend API documentation',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: process.env.PUBLIC_API_URL || `http://127.0.0.1:${process.env.PORT || 5000}`,
        description: 'API',
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
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {},
            errors: { type: 'array', nullable: true },
            pagination: {
              type: 'object',
              nullable: true,
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [path.join(__dirname, '../routes/*.js'), path.join(__dirname, '../docs/*.yaml')],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
