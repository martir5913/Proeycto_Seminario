import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

const logsDir = process.env.LOGS_DIR || path.join(process.cwd(), 'logs');

// Asegurar que el directorio de logs exista
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

// Formato personalizado para desarrollo
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, reqId, ...meta }) => {
    const reqStr = reqId ? ` [reqId:${reqId}]` : '';
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}]${reqStr}: ${message}${metaStr}`;
  })
);

// Formato estructurado JSON para producción
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Transporte rotativo para logs de aplicación general (info, warn, http)
const appRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logsDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: logLevel,
});

// Transporte rotativo exclusivo para errores críticos (error)
const errorRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error',
});

// Instancia central del Logger
export const logger = winston.createLogger({
  level: logLevel,
  format: isProduction ? prodFormat : devFormat,
  defaultMeta: { service: 'umg-presentaciones-api' },
  transports: [
    new winston.transports.Console({
      format: isProduction ? prodFormat : devFormat,
    }),
    appRotateTransport,
    errorRotateTransport,
  ],
  exitOnError: false,
});

export default logger;
