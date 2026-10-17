import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

export const requestLogger = (req, res, next) => {
  // Asignar o reutilizar Correlation ID para trazabilidad
  const reqId = req.headers['x-request-id'] || uuidv4();
  req.id = reqId;
  res.setHeader('X-Request-Id', reqId);

  const startTime = Date.now();
  const { method, originalUrl, ip } = req;

  // Interceptar la finalización de la respuesta
  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const { statusCode } = res;

    const logData = {
      reqId,
      method,
      url: originalUrl,
      status: statusCode,
      durationMs,
      ip: ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
    };

    if (statusCode >= 500) {
      logger.error(`HTTP ${method} ${originalUrl} -> ${statusCode} (${durationMs}ms)`, logData);
    } else if (statusCode >= 400) {
      logger.warn(`HTTP ${method} ${originalUrl} -> ${statusCode} (${durationMs}ms)`, logData);
    } else {
      logger.info(`HTTP ${method} ${originalUrl} -> ${statusCode} (${durationMs}ms)`, logData);
    }
  });

  next();
};

export default requestLogger;
