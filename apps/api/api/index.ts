// apps/api/api/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/app.js';

// Initialize Fastify app
const app = await createApp();
await app.ready();

// Vercel serverless handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Emit the request to Fastify's server instance
  app.server.emit('request', req, res);
}