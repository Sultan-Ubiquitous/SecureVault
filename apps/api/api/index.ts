import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/app.js';

let app: Awaited<ReturnType<typeof createApp>> | null = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for every request
  const origin = req.headers.origin || '';
  
  // Always reflect the origin back (most permissive)
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    // Fallback for requests without origin header
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, Accept');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Initialize Fastify app (singleton pattern)
  if (!app) {
    app = await createApp();
    await app.ready();
  }

  // Inject request into Fastify
  try {
    const response = await app.inject({
      method: req.method as any,
      url: req.url || '/',
      headers: req.headers as Record<string, string>,
      payload: req.body,
      query: req.query as Record<string, string>,
    });

    // Set status
    res.status(response.statusCode);
    
    // Set content-type and other headers from Fastify (skip CORS headers)
    Object.entries(response.headers).forEach(([key, value]) => {
      if (!key.toLowerCase().startsWith('access-control')) {
        res.setHeader(key, value as string);
      }
    });
    
    // Send response
    res.send(response.body);
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}