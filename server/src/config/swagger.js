const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sema API',
      version: '1.0.0',
      description: 'Anonymous messaging platform API. Send and receive anonymous messages.',
    },
    servers: [
      { url: '/api', description: 'API server' },
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
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
            username: { type: 'string', example: 'johndoe' },
            displayName: { type: 'string', example: 'John Doe' },
            activePrompt: { type: 'string', example: 'send me anonymous messages 👀' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Message: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d2' },
            recipient: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
            content: { type: 'string', example: 'You are really cool!' },
            prompt: { type: 'string', example: 'send me anonymous messages 👀' },
            isRead: { type: 'boolean', example: false },
            isFavorite: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Something went wrong' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
