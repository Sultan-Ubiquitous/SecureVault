// apps/api/api/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/app.js';

let app: Awaited<ReturnType<typeof createApp>> | null = null;

// Vercel serverless handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Initialize app if not already done
  if (!app) {
    app = await createApp();
    await app.ready();
  }

  // Let Fastify handle the request properly
  await app.inject({
    method: req.method as any,
    url: req.url || '/',
    headers: req.headers as Record<string, string>,
    payload: req.body,
    query: req.query as Record<string, string>,
  }).then((result) => {
    // Set status code
    res.status(result.statusCode);
    
    // Set all headers from Fastify response (including CORS)
    Object.entries(result.headers).forEach(([key, value]) => {
      res.setHeader(key, value as string);
    });
    
    // Send response
    res.send(result.body);
  });
}