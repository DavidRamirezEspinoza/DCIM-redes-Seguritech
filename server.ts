import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'database_seguritech.json');

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  // API para CARGAR datos
  app.get('/api/load', (req, res) => {
    try {
      if (fs.existsSync(DB_FILE)) {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        res.json(JSON.parse(data));
      } else {
        res.json({ racks: [] });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      res.status(500).json({ error: 'Error al cargar' });
    }
  });

  // API para GUARDAR datos
  app.post('/api/save', (req, res) => {
    try {
      const data = req.body;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
      res.json({ success: true });
    } catch (error) {
      console.error('Error saving data:', error);
      res.status(500).json({ error: 'Error al guardar' });
    }
  });

  // Configuración de Vite (Modo Desarrollo)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`-------------------------------------------`);
    console.log(`🚀 SERVIDOR SEGURITECH OPERATIVO`);
    console.log(`💻 Acceso Local: http://localhost:${PORT}`);
    console.log(`-------------------------------------------`);
  });
}

startServer();