import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { readHttpListenPort, readMongoConnectionString } from './config/env';
import { global_error_handler } from './middleware/global-error.handler';
import lessonsRouter from './routes/lessons.routes';
import catalogCategoriesRouter from './routes/categories.routes';
import catalogTopicsRouter from './routes/subcategories.routes';
import usersRouter from './routes/user.routes';

const app = express();
app.use(cors());
app.use(express.json({ limit: '512kb' }));

const PORT = readHttpListenPort();

mongoose
  .connect(readMongoConnectionString())
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  });

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Learning Platform API',
      version: '1.0.0',
      description: 'Backend API for the AI learning platform',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Local workstation',
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
  },
  apis: [
      './src/routes/*.ts',
      './src/controllers/*.ts',
      './dist/routes/*.js',
      './dist/controllers/*.js',
    ],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/api/ai', lessonsRouter);
app.use('/api/categories', catalogCategoriesRouter);
app.use('/api/sub-categories', catalogTopicsRouter);
app.use('/api/users', usersRouter);

app.use(global_error_handler);

export default app;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
