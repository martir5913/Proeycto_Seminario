import logger from '../utils/logger.js';

export const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.status || err.statusCode || 500;
  let message = err.message;
  const reqId = req.id || 'N/A';

  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'El archivo supera el tamaño máximo permitido.';
    } else {
      message = `Error en la subida del archivo: ${err.message}`;
    }
  }

  logger.error(`Error al procesar ${req.method} ${req.originalUrl}: ${err.message}`, {
    reqId,
    statusCode,
    stack: err.stack,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  res.status(statusCode).json({
    success: false,
    reqId,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

export default errorMiddleware;
