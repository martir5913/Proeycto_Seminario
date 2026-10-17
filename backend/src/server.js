import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import logger from './utils/logger.js';
import { initDatabaseSchema, db } from './config/database.js';
import requestLogger from './middlewares/requestLogger.js';
import errorMiddleware from './middlewares/errorMiddleware.js';
import apiRoutes from './routes/apiRoutes.js';
import healthRoutes from './routes/healthRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');

// Inicializar tablas en SQLite
initDatabaseSchema();

// Middlewares base
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de auditoría y trazabilidad con Winston y reqId
app.use(requestLogger);

// Servir archivos estáticos de subidas
app.use('/uploads', express.static(uploadsDir));

// Rutas API y Healthcheck
app.use('/health', healthRoutes);
app.use('/api', apiRoutes);

// Servir frontend compilado en producción si existe la carpeta dist
const distPath = process.env.DIST_PATH || path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(distPath)) {
  logger.info(`Servidor configurado para servir estáticos del Frontend desde: ${distPath}`);
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    // Si la ruta inicia con /api o /health no enviar index.html
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Middleware global de errores
app.use(errorMiddleware);

// Iniciar servidor HTTP
const server = app.listen(PORT, () => {
  logger.info(`🚀 Servidor backend escuchando en puerto ${PORT} [Modo: ${process.env.NODE_ENV || 'development'}]`);
  logger.info(`📡 Healthcheck disponible en: http://localhost:${PORT}/health`);
  logger.info(`🔌 API disponible en: http://localhost:${PORT}/api/groups`);
});

// Graceful Shutdown (Gestión limpia de cierre de procesos para Docker)
const handleShutdown = (signal) => {
  logger.info(`Señal ${signal} recibida. Cerrando servidor de forma ordenada...`);
  server.close(() => {
    logger.info('Servidor HTTP cerrado.');
    try {
      db.close();
      logger.info('Conexión con base de datos SQLite cerrada.');
    } catch (err) {
      logger.error('Error al cerrar base de datos', { error: err.message });
    }
    process.exit(0);
  });

  // Forzar cierre si no responde en 5 segundos
  setTimeout(() => {
    logger.error('No se pudo cerrar ordenadamente a tiempo, forzando detención.');
    process.exit(1);
  }, 5000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export default app;
