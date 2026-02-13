import type { FastifyInstance } from 'fastify';
import { TransactionController } from '../controllers/tx.controller.js';
import type { TransactionService } from '../services/tx.services.js';

/**
 * Register transaction routes
 */
export async function txRoutes(
  fastify: FastifyInstance,
  service: TransactionService
) {
  const controller = new TransactionController(service);

  // POST /tx/encrypt - Encrypt and store transaction
  fastify.post('/tx/encrypt', controller.encryptHandler);
  
  //GET /tx - Get all transactions
  fastify.get('/tx', controller.listHandler);

  // GET /tx/:id - Get encrypted transaction
  fastify.get('/tx/:id', controller.getHandler);

  // POST /tx/:id/decrypt - Decrypt transaction
  fastify.post('/tx/:id/decrypt', controller.decryptHandler);
}