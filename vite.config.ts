import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import dotenv from 'dotenv';
import {spawn} from 'child_process';
import http from 'http';
import {defineConfig, Plugin} from 'vite';
import {GoogleGenAI} from '@google/genai';

dotenv.config();

function ensurePythonBackendRunning() {
  const req = http.get('http://127.0.0.1:8001/api/health', res => {
    // Already running
  });
  req.on('error', () => {
    // Start Python uvicorn backend
    const proc = spawn('python3', ['-m', 'uvicorn', 'backend.main:app', '--host', '127.0.0.1', '--port', '8001'], {
      stdio: 'ignore',
      detached: true,
    });
    proc.unref();
  });
}

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-plugin',
    configureServer(server) {
      ensurePythonBackendRunning();
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/ai/ask' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const {prompt, systemContext} = JSON.parse(body || '{}');
              const apiKey = process.env.GEMINI_API_KEY;

              if (!apiKey) {
                res.setHeader('Content-Type', 'application/json');
                res.end(
                  JSON.stringify({
                    mode: 'demo',
                    text: 'DEMO_FALLBACK',
                    message: 'Gemini API key not configured on server.',
                  })
                );
                return;
              }

              const ai = new GoogleGenAI({apiKey});
              const response = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: [
                  {
                    role: 'user',
                    parts: [
                      {
                        text: `You are HealthFlow AI - a specialized Chief Medical Logistics & Supply Chain Resilience Intelligence Officer.
Your objective is to provide actionable, clinical-grade operational recommendations based STRICTLY on the real-time operational data context provided below.

When answering:
1. Cite specific facilities, SKUs, inventory counts, days remaining runway, and lot numbers from the provided context.
2. Structure your analysis clearly using Markdown headers (###), bullet points, and bold emphasis on key figures.
3. Quantify clinical risk: explain which hospital wards (e.g. ICU, Emergency, Surgery) are endangered if a specific SKU stocks out.
4. Provide prioritized, concrete mitigation actions: e.g. which surplus facility should transfer stock to which shortage facility, shipment expedites, or depot releases.

REAL-TIME OPERATIONAL DATA CONTEXT:
${systemContext || 'None provided.'}

OPERATOR QUESTION:
${prompt}`,
                      },
                    ],
                  },
                ],
              });

              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  mode: 'gemini',
                  text: response.text || 'No response generated.',
                })
              );
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  mode: 'demo',
                  error: err?.message || 'Server error calling Gemini API',
                  text: 'DEMO_FALLBACK',
                })
              );
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8001',
          changeOrigin: true,
        },
      },
    },
  };
});
