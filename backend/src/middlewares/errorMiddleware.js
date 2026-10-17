import logger from '../utils/logger.js';

export const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const reqId = req.id || 'N/A';

  logger.error(`Error no controlado al procesar ${req.method} ${req.originalUrl}: ${err.message}`, {
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
    message: statusCode === 500 && process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor. Por favor consulte al administrador.' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

export default errorMiddleware;
