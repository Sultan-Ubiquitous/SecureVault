// apps/api/api/index.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/app.js';

let app: Awaited<ReturnType<typeof createApp>> | null = null;

const allowedOrigins = [
  'secure-vault-web-two.vercel.app',
  'https://secure-vault-g9xzkruth-sultan-ubiquitous-projects.vercel.app',
];

// Vercel serverless handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  const origin = req.headers.origin || '';
  const isAllowed = allowedOrigins.some(allowed => origin === allowed) || 
                    origin.endsWith('.vercel.app');

  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Initialize app if not already done
  if (!app) {
    app = await createApp();
    await app.ready();
  }

  // Let Fastify handle the request
  await app.inject({
    method: req.method as any,
    url: req.url || '/',
    headers: req.headers as Record<string, string>,
    payload: req.body,
    query: req.query as Record<string, string>,
  }).then((result) => {
    res.status(result.statusCode);
    
    // Merge headers (CORS already set above)
    Object.entries(result.headers).forEach(([key, value]) => {
      if (!key.toLowerCase().startsWith('access-control')) {
        res.setHeader(key, value as string);
      }
    });
    
    res.send(result.body);
  });
}