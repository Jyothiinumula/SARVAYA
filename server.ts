import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { apiApp } from './src/server/apiApp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  // AI Studio preview environment requires server to listen on port 3000
  const PORT = 3000;

  // Mount API endpoints
  app.use(apiApp);

  // Serve static dist in production, or mount Vite middleware in development
  const distPath = path.resolve(__dirname, 'dist');
  if (process.env.NODE_ENV === 'production' && fs.existsSync(distPath)) {
    console.log('[SARVAYA Server] Serving production static build from dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    console.log('[SARVAYA Server] Mounting Vite dev middleware');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SARVAYA Central Hub] Full-Stack server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[SARVAYA Server Fatal Error]:', err);
  process.exit(1);
});
