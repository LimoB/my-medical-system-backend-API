import swaggerJsdoc, { type Options } from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Application } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM replacement for __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My Medical System API',
      version: '1.0.0',
      description: 'API documentation for the Medical System',
    },
    servers: [
      {
        url: 'http://localhost:3030/api', // Update this for production
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
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/**/*.ts'], // Scan all .ts files for Swagger annotations
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Write to file (swagger-output.json) for SwaggerHub or external editor use
const outputPath = path.join(__dirname, '../swagger-output.json');
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
console.log('Swagger spec written to swagger-output.json');

/**
 * Mounts Swagger UI on /api-docs route.
 * @param app Express Application instance
 */
export function setupSwagger(app: Application): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  // console.log('Swagger docs available at http://localhost:3030/api-docs');
}
