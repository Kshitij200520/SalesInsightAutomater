const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sales Insight Automator API',
      version: '1.0.0',
      description: 'API for generating AI-powered executive summaries from sales datasets. Accessible via POST /analyze.',
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Local Development Server',
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to the API doc annotations
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
