import BannerModel from '../models/bannerModel.js';
import logger from '../utils/logger.js';
import fs from 'fs';
import path from 'path';

export const BannerController = {
  // Obtener todos los banners
  async getAll(req, res, next) {
    try {
      const onlyActive = req.query.active === 'true';
      const banners = BannerModel.getAll(onlyActive);
      res.json({
        success: true,
        count: banners.length,
        data: banners,
      });
    } catch (error) {
      next(error);
    }
  },

  // Obtener un banner por ID
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const banner = BannerModel.getById(id);
      if (!banner) {
        return res.status(404).json({
          success: false,
          message: `Banner con ID ${id} no encontrado.`,
        });
      }
      res.json({
        success: true,
        data: banner,
      });
    } catch (error) {
      next(error);
    }
  },

  // Subir y crear un nuevo banner para el carrusel
  async create(req, res, next) {
    try {
      const { title, subtitle } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Es obligatorio adjuntar una imagen (JPG, PNG, WEBP, SVG) para el banner.',
        });
      }

      if (!title || !title.trim()) {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          success: false,
          message: 'El título del banner es obligatorio.',
        });
      }

      // La URL pública con la que el frontend accederá a la imagen
      const imageUrl = `/uploads/banners/${req.file.filename}`;

      const newBanner = BannerModel.create({
        title: title.trim(),
        subtitle: subtitle ? subtitle.trim() : '',
        file_name: req.file.filename,
        file_path: req.file.path,
        image_url: imageUrl,
        is_active: 1,
      });

      logger.info(`Nuevo banner subido y registrado: "${newBanner.title}"`, {
        reqId: req.id,
        bannerId: newBanner.id,
        imageUrl,
      });

      res.status(201).json({
        success: true,
        message: 'Banner agregado al carrusel exitosamente.',
        data: newBanner,
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupErr) {
          logger.error('Error al limpiar imagen de banner tras fallo', { error: cleanupErr.message });
        }
      }
      next(error);
    }
  },

  // Actualizar datos del banner
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { title, subtitle, is_active, display_order } = req.body;

      const existing = BannerModel.getById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Banner con ID ${id} no encontrado.`,
        });
      }

      const updated = BannerModel.update(id, {
        title,
        subtitle,
        is_active,
        display_order,
      });

      logger.info(`Banner "${updated.title}" actualizado`, {
        reqId: req.id,
        bannerId: id,
      });

      res.json({
        success: true,
        message: 'Banner actualizado correctamente.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // Alternar visibilidad en el carrusel
  async toggle(req, res, next) {
    try {
      const { id } = req.params;
      const updated = BannerModel.toggle(id);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: `Banner con ID ${id} no encontrado.`,
        });
      }

      logger.info(`Estado de visibilidad de banner "${updated.title}" cambiado a: ${updated.is_active === 1 ? 'Activo' : 'Oculto'}`, {
        reqId: req.id,
        bannerId: id,
        isActive: updated.is_active,
      });

      res.json({
        success: true,
        message: `Banner ${updated.is_active === 1 ? 'activado' : 'desactivado'} en el carrusel.`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // Eliminar banner
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const banner = BannerModel.delete(id);

      if (!banner) {
        return res.status(404).json({
          success: false,
          message: `Banner con ID ${id} no encontrado.`,
        });
      }

      // Eliminar archivo físico si existe en disco
      if (banner.file_path && fs.existsSync(banner.file_path)) {
        try {
          fs.unlinkSync(banner.file_path);
          logger.info(`Archivo físico de banner eliminado: ${banner.file_name}`, { reqId: req.id });
        } catch (fileErr) {
          logger.warn(`No se pudo eliminar archivo físico de banner: ${fileErr.message}`, { reqId: req.id });
        }
      }

      logger.info(`Banner "${banner.title}" eliminado correctamente`, {
        reqId: req.id,
        bannerId: id,
      });

      res.json({
        success: true,
        message: 'Banner eliminado exitosamente.',
      });
    } catch (error) {
      next(error);
    }
  },

  // Reordenar banners
  async updateOrder(req, res, next) {
    try {
      const { orders } = req.body; // Array de { id, display_order }

      if (!Array.isArray(orders)) {
        return res.status(400).json({
          success: false,
          message: 'El campo "orders" debe ser un arreglo de objetos con id y display_order.',
        });
      }

      const updatedBanners = BannerModel.updateOrder(orders);

      logger.info('Orden de banners actualizado exitosamente', {
        reqId: req.id,
        count: orders.length,
      });

      res.json({
        success: true,
        message: 'Orden de banners actualizado correctamente.',
        data: updatedBanners,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default BannerController;
