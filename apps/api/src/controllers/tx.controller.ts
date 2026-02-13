import type { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import type { TransactionService } from '../services/tx.services.js';
import type { EncryptRequest, IdParams } from '../types/api.types.js';
import { BadRequestError } from '../errors/api-errors.js';

/**
 * Request body schema for POST /tx/encrypt
 */
const encryptRequestSchema = z.object({
  partyId: z.string().min(1, 'partyId must not be empty'),
  payload: z
    .record(z.string(), z.unknown())
    .refine(
      (val) => {
        try {
          JSON.stringify(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'payload must be JSON serializable' }
    ),
});


/**
 * URL params schema for routes with :id
 */
const idParamsSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
});

/**
 * Transaction controller - handles HTTP request/response
 */
export class TransactionController {
  constructor(private service: TransactionService) {}

  /**
   * POST /tx/encrypt
   * Encrypt and store a new transaction
   */
  encryptHandler = async (
    request: FastifyRequest<{ Body: EncryptRequest }>,
    reply: FastifyReply
  ) => {
    // Validate request body
    const validationResult = encryptRequestSchema.safeParse(request.body);
    if (!validationResult.success) {
      throw new BadRequestError(
        `Invalid request: ${validationResult.error.issues.map((e) => e.message).join(', ')}`
      );
    }

    const { partyId, payload } = validationResult.data;

    // Encrypt and store
    const record = await this.service.encrypt({ partyId, payload });

    return reply.status(201).send(record);
  };

  /**
   * GET /tx/:id
   * Retrieve an encrypted transaction (no decryption)
   */
  getHandler = async (
    request: FastifyRequest<{ Params: IdParams }>,
    reply: FastifyReply
  ) => {
    // Validate params
    const validationResult = idParamsSchema.safeParse(request.params);
    if (!validationResult.success) {
      throw new BadRequestError(
        `Invalid request: ${validationResult.error.issues.map((e) => e.message).join(', ')}`
      );
    }

    const { id } = validationResult.data;

    // Fetch encrypted record
    const record = await this.service.getById(id);

    return reply.status(200).send(record);
  };

  /**
   * POST /tx/:id/decrypt
   * Decrypt a transaction and return the original payload
   */
  decryptHandler = async (
    request: FastifyRequest<{ Params: IdParams }>,
    reply: FastifyReply
  ) => {
    // Validate params
    const validationResult = idParamsSchema.safeParse(request.params);
    if (!validationResult.success) {
      throw new BadRequestError(
        `Invalid request: ${validationResult.error.issues.map((e) => e.message).join(', ')}`
      );
    }

    const { id } = validationResult.data;

    // Decrypt
    const result = await this.service.decrypt(id);

    return reply.status(200).send(result);
  };

  listHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const list = await this.service.list();
    return reply.status(200).send(list);
  };
}