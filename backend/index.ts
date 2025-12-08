import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import dotenv from 'dotenv';
import { generateExecutionTrace } from './services/geminiService.ts';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1) Load backend/.env explicitly
dotenv.config({ path: path.resolve(__dirname, '.env') });

// 2) Debug: confirm key loaded
console.log('GEMINI_API_KEY loaded in backend:', process.env.GEMINI_API_KEY ? 'YES' : 'NO');

const app = express();
app.use(bodyParser.json({ limit: '1mb' }));

app.post('/api/trace', async (req, res) => {
  const { code } = req.body as { code?: string };
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ status: 'error', error: 'Missing or invalid `code` in request body.' });
  }

  try {
    const trace = await generateExecutionTrace(code);
    // Use 200 even for model-reported errors so frontend receives structured payload
    return res.status(200).json(trace);
  } catch (err: any) {
    console.error('Server error while generating trace:', err);
    return res.status(500).json({ status: 'error', error: err?.message || 'Internal server error', steps: [] });
  }
});

const DEFAULT_PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

async function startServer(startPort = DEFAULT_PORT, maxAttempts = 5) {
  let port = startPort;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await new Promise<void>((resolve, reject) => {
        const server = app.listen(port, () => {
          // eslint-disable-next-line no-console
          console.log(`Trace server listening on http://localhost:${port}`);
          resolve();
        });
        server.on('error', (err: any) => reject(err));
      });
      return;
    } catch (err: any) {
      if (err && err.code === 'EADDRINUSE') {
        // eslint-disable-next-line no-console
        console.warn(`Port ${port} already in use, trying ${port + 1}...`);
        port += 1;
        continue;
      }
      // Unknown error — log and exit with failure
      // eslint-disable-next-line no-console
      console.error('Failed to start server:', err);
      process.exit(1);
    }
  }
  // If we exhausted attempts
  // eslint-disable-next-line no-console
  console.error(`Unable to bind server after ${maxAttempts} attempts starting at port ${startPort}.`);
  process.exit(1);
}

startServer();
