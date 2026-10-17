import express from 'express';
import db from '../config/database.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
const logsDir = process.env.LOGS_DIR || path.join(process.cwd(), 'logs');

router.get('/', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'disconnected',
    storage: {
      uploads: false,
      logs: false,
    },
    memory: process.memoryUsage(),
  };

  try {
    // 1. Probar conexión y lectura en SQLite
    const ping = db.prepare('SELECT 1 as ping').get();
    if (ping && ping.ping === 1) {
      healthcheck.database = 'connected';
    }

    // 2. Verificar accesibilidad de directorios persistentes
    healthcheck.storage.uploads = fs.existsSync(uploadsDir);
    healthcheck.storage.logs = fs.existsSync(logsDir);

    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.status = 'unhealthy';
    healthcheck.error = error.message;
    res.status(503).json(healthcheck);
  }
});

export default router;
