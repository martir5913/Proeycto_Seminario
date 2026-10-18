import SettingsModel from '../models/settingsModel.js';
import logger from '../utils/logger.js';

export const SettingsController = {
  // Obtener configuraciones del sitio
  async getSettings(req, res, next) {
    try {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      const settings = SettingsModel.getAll();
      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  },

  // Actualizar configuraciones del sitio
  async updateSettings(req, res, next) {
    try {
      const newSettings = req.body;

      if (!newSettings || typeof newSettings !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'El cuerpo de la solicitud debe ser un objeto con configuraciones.',
        });
      }

      const updated = SettingsModel.updateMany(newSettings);

      logger.info('Configuraciones generales del sitio actualizadas', {
        reqId: req.id,
        keys: Object.keys(newSettings),
      });

      res.json({
        success: true,
        message: 'Configuración actualizada exitosamente.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default SettingsController;
