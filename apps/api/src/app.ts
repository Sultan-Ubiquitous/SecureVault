// src/app.ts - Keep as is, no changes needed
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { loadMasterKey } from '@repo/crypto';
import {
  ValidationError,
  AuthenticationError,
  DecryptionError,
  KeyManagementError,
} from '@repo/crypto';
import { env } from './config/env.js';
import { StorageFactory } from './storage/storage.factory.js';
import { TransactionService } from './services/tx.services.js';
import { txRoutes } from './routes/tx.routes.js';
import { ApiError, BadRequestError } from './errors/api-errors.js';
import type { ErrorResponse } from './types/api.types.js';

/**
 * Create and configure Fastify application
 */
export async function createApp() {
  const fastify = Fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'info' : 'warn',
    },
  });

  // Security plugins
  await fastify.register(helmet);
  await fastify.register(cors, {
    origin: env.NODE_ENV === 'development' ? '*' : '*',
  });

  // Initialize dependencies
  const storage = StorageFactory.create();
  const masterKey = loadMasterKey(env.MASTER_KEY_HEX);
  const transactionService = new TransactionService(storage, masterKey);

  // Health check endpoint
  fastify.get('/health', async () => {
    const storageHealthy = await transactionService.healthCheck();
    return {
      status: storageHealthy ? 'healthy' : 'unhealthy',
      storage: env.STORAGE_TYPE,
      timestamp: new Date().toISOString(),
    };
  });

  // Register transaction routes
  await fastify.register(async (instance) => {
    await txRoutes(instance, transactionService);
  });

  // Global error handler
  fastify.setErrorHandler((error, request, reply) => {
    // Handle known API errors
    if (error instanceof ApiError) {
      const response: ErrorResponse = {
        error: error.name,
        message: error.message,
        statusCode: error.statusCode,
      };
      return reply.status(error.statusCode).send(response);
    }

    // Handle crypto validation errors
    if (error instanceof ValidationError) {
      const response: ErrorResponse = {
        error: 'Validation Error',
        //@ts-ignore
        message: error.message,
        statusCode: 400,
      };
      return reply.status(400).send(response);
    }

    // Handle authentication errors (tampered data)
    if (error instanceof AuthenticationError) {
      const response: ErrorResponse = {
        error: 'Authentication Error',
        message: 'Data integrity check failed - data may have been tampered with',
        statusCode: 400,
      };
      return reply.status(400).send(response);
    }

    // Handle decryption errors
    if (error instanceof DecryptionError) {
      const response: ErrorResponse = {
        error: 'Decryption Error',
        message: 'Failed to decrypt data',
        statusCode: 400,
      };
      return reply.status(400).send(response);
    }

    // Handle key management errors
    if (error instanceof KeyManagementError) {
      fastify.log.error(error, 'Key management error');
      const response: ErrorResponse = {
        error: 'Internal Server Error',
        message: 'Cryptographic configuration error',
        statusCode: 500,
      };
      return reply.status(500).send(response);
    }

    // Log unexpected errors
    fastify.log.error(error, 'Unexpected error');

    // Generic error respons
    const response: ErrorResponse = {
      error: 'Internal Server Error',
      message:
        env.NODE_ENV === 'development' && error instanceof Error
          ? error.message
          : 'An unexpected error occurred',
      statusCode: 500,
    };

    return reply.status(500).send(response);
  });

  return fastify;
}