import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de almacenamiento en disco con UUID
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Sanitizar nombre original y generar identificador único
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueName = `${uuidv4()}-${cleanBase}${ext}`;
    cb(null, uniqueName);
  },
});

// Validación de tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.pptx', '.ppt'];
  const ext = path.extname(file.originalname).toLowerCase();

  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
    'application/octet-stream', // Para clientes que no detectan MIME de PPTX
  ];

  if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido (${ext}). Solo se aceptan presentaciones PDF (.pdf) y PowerPoint (.pptx).`), false);
  }
};

export const uploadPresentation = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB máximo
  },
});

export default uploadPresentation;
