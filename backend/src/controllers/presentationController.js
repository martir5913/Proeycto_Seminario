import GroupModel from '../models/groupModel.js';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger.js';
import { parsePptx } from '../utils/pptxParser.js';
import { renderSlidesFromPresentation } from '../utils/slideRenderer.js';

const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');

export const PresentationController = {
  // Obtener diapositivas de alta resolución (preservando diseño original de PowerPoint/PDF)
  async getSlidesByGroupId(req, res, next) {
    try {
      const { id } = req.params;
      const group = GroupModel.getById(id);

      if (!group || !group.file_name) {
        return res.status(404).json({
          success: false,
          message: 'No existe archivo de presentación asociado a este grupo.',
        });
      }

      const filePath = path.join(uploadsDir, group.file_name);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'El archivo de presentación no fue encontrado en el servidor.',
        });
      }

      const ext = path.extname(group.file_name).toLowerCase();

      // 1. Intentar renderizar imágenes de alta fidelidad con el diseño real de las diapositivas
      try {
        const rendered = await renderSlidesFromPresentation(filePath, id);
        if (rendered && rendered.slides && rendered.slides.length > 0) {
          return res.json({
            success: true,
            mode: 'highres',
            type: ext === '.pdf' ? 'pdf' : 'pptx',
            totalSlides: rendered.totalSlides,
            slides: rendered.slides,
            filename: group.original_name || group.file_name,
          });
        }
      } catch (renderError) {
        logger.warn(`No se pudo renderizar gráficamente las diapositivas para grupo ${id}: ${renderError.message}`);
      }

      // 2. Fallbacks de contingencia si no se pudieron renderizar imágenes nativas
      if (ext === '.pptx' || ext === '.ppt') {
        const presentationData = await parsePptx(filePath);
        return res.json({
          success: true,
          mode: 'text',
          type: 'pptx',
          filename: group.original_name || group.file_name,
          ...presentationData,
        });
      } else if (ext === '.pdf') {
        return res.json({
          success: true,
          mode: 'pdf',
          type: 'pdf',
          fileUrl: `/api/presentations/${id}/file`,
          filename: group.original_name || group.file_name,
        });
      } else {
        return res.json({
          success: true,
          mode: 'other',
          type: 'other',
          fileUrl: `/api/presentations/${id}/file`,
          filename: group.original_name || group.file_name,
        });
      }
    } catch (error) {
      next(error);
    }
  },

  // Servir imagen PNG individual de una diapositiva en alta resolución
  async getSlideImage(req, res, next) {
    try {
      const { id, slideNum } = req.params;
      const num = parseInt(slideNum, 10);
      if (isNaN(num) || num < 1) {
        return res.status(400).json({ success: false, message: 'Número de diapositiva inválido.' });
      }

      const slideImagePath = path.join(uploadsDir, `slides_${id}`, `slide-${num}.png`);

      if (!fs.existsSync(slideImagePath)) {
        return res.status(404).json({
          success: false,
          message: 'Imagen de diapositiva no encontrada.',
        });
      }

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      const fileStream = fs.createReadStream(slideImagePath);
      fileStream.pipe(res);
    } catch (error) {
      next(error);
    }
  },

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
      const cleanFilename = path.basename(filename);
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
