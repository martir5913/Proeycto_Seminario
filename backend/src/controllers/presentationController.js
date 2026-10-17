import GroupModel from '../models/groupModel.js';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger.js';

const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');

export const PresentationController = {
  // Servir archivo PDF o PPTX por ID de grupo
  async getFileByGroupId(req, res, next) {
    try {
      const { id } = req.params;
      const download = req.query.download === 'true';
      const group = GroupModel.getById(id);

      if (!group || !group.file_name) {
        return res.status(404).json({
          success: false,
          message: 'No existe archivo de presentación asociado a este grupo.',
        });
      }

      const filePath = path.join(uploadsDir, group.file_name);

      if (!fs.existsSync(filePath)) {
        logger.error(`Archivo físico no encontrado en disco: ${filePath}`, { reqId: req.id, groupId: id });
        return res.status(404).json({
          success: false,
          message: 'El archivo de presentación no fue encontrado en el servidor.',
        });
      }

      const originalName = group.original_name || group.file_name;
      const mimeType = group.mime_type || 'application/octet-stream';

      res.setHeader('Content-Type', mimeType);

      if (download || mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(originalName)}"`);
      } else {
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(originalName)}"`);
      }

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      next(error);
    }
  },

  // Servir archivo directamente por nombre de archivo sanitizado
  async getFileByName(req, res, next) {
    try {
      const { filename } = req.params;
      const cleanFilename = path.basename(filename); // Prevenir directory traversal
      const filePath = path.join(uploadsDir, cleanFilename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Archivo no encontrado.',
        });
      }

      const ext = path.extname(cleanFilename).toLowerCase();
      if (ext === '.pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${cleanFilename}"`);
      } else {
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}"`);
      }

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      next(error);
    }
  },
};

export default PresentationController;
