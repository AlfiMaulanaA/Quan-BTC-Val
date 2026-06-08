import { serve } from '@hono/node-server';
import { app } from '../app.ts';

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

console.log(`Starting Node.js server on port ${port}...`);

serve({
  fetch: app.fetch,
  port
});
