import GroupModel from '../models/groupModel.js';
import logger from '../utils/logger.js';
import fs from 'fs';
import path from 'path';

export const GroupController = {
  // Obtener lista completa de grupos
  async getAll(req, res, next) {
    try {
      const groups = GroupModel.getAll();
      res.json({
        success: true,
        count: groups.length,
        data: groups,
      });
    } catch (error) {
      next(error);
    }
  },

  // Obtener detalle de un grupo
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const group = GroupModel.getById(id);

      if (!group) {
        return res.status(404).json({
          success: false,
          message: `Grupo con ID ${id} no encontrado.`,
        });
      }

      res.json({
        success: true,
        data: group,
      });
    } catch (error) {
      next(error);
    }
  },

  // Registrar nuevo grupo con archivo o enlace
  async create(req, res, next) {
    try {
      const {
        group_number,
        group_name,
        topic,
        career,
        members,
        presentation_type,
        external_url,
        duration_minutes,
      } = req.body;

      if (!group_number || !group_name || !topic || !presentation_type) {
        return res.status(400).json({
          success: false,
          message: 'Los campos group_number, group_name, topic y presentation_type son requeridos.',
        });
      }

      // Procesar miembros
      let parsedMembers = [];
      if (typeof members === 'string') {
        try {
          parsedMembers = JSON.parse(members);
        } catch {
          parsedMembers = members.split(',').map((m) => m.trim());
        }
      } else if (Array.isArray(members)) {
        parsedMembers = members;
      }

      let filePath = null;
      let fileName = null;
      let originalName = null;
      let mimeType = null;
      let fileSize = null;

      if (presentation_type === 'file') {
        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: 'Es obligatorio adjuntar un archivo (PDF o PPTX) cuando presentation_type es "file".',
          });
        }
        filePath = req.file.path;
        fileName = req.file.filename;
        originalName = req.file.originalname;
        mimeType = req.file.mimetype;
        fileSize = req.file.size;
      } else if (presentation_type === 'link') {
        if (!external_url || !external_url.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Es obligatorio proporcionar un enlace externo (Canva, Slides, Prezi) cuando presentation_type es "link".',
          });
        }
      }

      const newGroup = GroupModel.create({
        group_number,
        group_name,
        topic,
        career,
        members: parsedMembers,
        presentation_type,
        file_path: filePath,
        file_name: fileName,
        original_name: originalName,
        mime_type: mimeType,
        file_size: fileSize,
        external_url,
        duration_minutes,
      });

      logger.info(`Nuevo grupo registrado: "${group_name}" (Grupo #${group_number}) con material tipo "${presentation_type}"`, {
        reqId: req.id,
        groupId: newGroup.id,
        groupNumber: group_number,
        materialType: presentation_type,
      });

      res.status(201).json({
        success: true,
        message: 'Grupo registrado exitosamente.',
        data: newGroup,
      });
    } catch (error) {
      // Limpiar archivo subido si falla la base de datos
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupErr) {
          logger.error('Error al limpiar archivo tras fallo de registro', { error: cleanupErr.message });
        }
      }
      next(error);
    }
  },

  // Modificar grupo existente
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const existing = GroupModel.getById(id);
      if (!existing) {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({
          success: false,
          message: `Grupo con ID ${id} no encontrado.`,
        });
      }

      const {
        group_number,
        group_name,
        topic,
        career,
        members,
        presentation_type,
        external_url,
        duration_minutes,
      } = req.body;

      let parsedMembers = undefined;
      if (members !== undefined) {
        if (typeof members === 'string') {
          try {
            parsedMembers = JSON.parse(members);
          } catch {
            parsedMembers = members.split(',').map((m) => m.trim());
          }
        } else if (Array.isArray(members)) {
          parsedMembers = members;
        }
      }

      let filePath = undefined;
      let fileName = undefined;
      let originalName = undefined;
      let mimeType = undefined;
      let fileSize = undefined;

      if (req.file) {
        filePath = req.file.path;
        fileName = req.file.filename;
        originalName = req.file.originalname;
        mimeType = req.file.mimetype;
        fileSize = req.file.size;

        // Si se subió un nuevo archivo y el anterior existía físicamente, eliminar el viejo
        if (existing.file_path && fs.existsSync(existing.file_path)) {
          try {
            fs.unlinkSync(existing.file_path);
          } catch (err) {
            logger.warn(`No se pudo eliminar archivo previo: ${err.message}`);
          }
        }
      }

      const updated = GroupModel.update(id, {
        group_number,
        group_name,
        topic,
        career,
        members: parsedMembers,
        presentation_type,
        external_url,
        duration_minutes,
        file_path: filePath,
        file_name: fileName,
        original_name: originalName,
        mime_type: mimeType,
        file_size: fileSize,
      });

      logger.info(`Grupo #${updated.group_number} (${updated.group_name}) actualizado exitosamente`, {
        reqId: req.id,
        groupId: id,
      });

      res.json({
        success: true,
        message: 'Grupo actualizado correctamente.',
        data: updated,
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupErr) {
          logger.error('Error al limpiar archivo tras fallo de actualización', { error: cleanupErr.message });
        }
      }
      next(error);
    }
  },

  // Actualizar el orden de las exposiciones
  async updateOrder(req, res, next) {
    try {
      const { orders } = req.body; // Array de { id, presentation_order }

      if (!Array.isArray(orders)) {
        return res.status(400).json({
          success: false,
          message: 'El campo "orders" debe ser un arreglo de objetos con id y presentation_order.',
        });
      }

      const updatedGroups = GroupModel.updateOrder(orders);

      logger.info('Orden de presentaciones actualizado exitosamente por el moderador', {
        reqId: req.id,
        groupsCount: orders.length,
      });

      res.json({
        success: true,
        message: 'Orden de presentaciones actualizado correctamente.',
        data: updatedGroups,
      });
    } catch (error) {
      next(error);
    }
  },

  // Cambiar estado de exposición (pending, presenting, completed)
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['pending', 'presenting', 'completed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido. Opciones permitidas: pending, presenting, completed.',
        });
      }

      const updatedGroup = GroupModel.updateStatus(id, status);

      if (!updatedGroup) {
        return res.status(404).json({
          success: false,
          message: `Grupo con ID ${id} no encontrado.`,
        });
      }

      logger.info(`Estado del grupo #${updatedGroup.group_number} actualizado a: ${status}`, {
        reqId: req.id,
        groupId: id,
        status,
      });

      res.json({
        success: true,
        data: updatedGroup,
      });
    } catch (error) {
      next(error);
    }
  },

  // Eliminar un grupo
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const group = GroupModel.delete(id);

      if (!group) {
        return res.status(404).json({
          success: false,
          message: `Grupo con ID ${id} no encontrado.`,
        });
      }

      // Eliminar archivo físico si existía
      if (group.file_path && fs.existsSync(group.file_path)) {
        try {
          fs.unlinkSync(group.file_path);
          logger.info(`Archivo físico eliminado: ${group.file_name}`, { reqId: req.id });
        } catch (fileErr) {
          logger.warn(`No se pudo eliminar el archivo físico: ${fileErr.message}`, { reqId: req.id });
        }
      }

      logger.info(`Grupo #${group.group_number} eliminado correctamente`, {
        reqId: req.id,
        groupId: id,
      });

      res.json({
        success: true,
        message: 'Grupo y recursos asociados eliminados exitosamente.',
      });
    } catch (error) {
      next(error);
    }
  },
};

export default GroupController;
