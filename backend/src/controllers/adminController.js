import db from '../config/database.js';
import GroupModel from '../models/groupModel.js';
import logger from '../utils/logger.js';
import path from 'path';
import fs from 'fs';

export const AdminController = {
  // Descargar copia de seguridad en caliente de la base de datos SQLite
  async downloadBackup(req, res, next) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFilename = `umg_backup_${timestamp}.sqlite`;
      const tempBackupPath = path.join(process.cwd(), backupFilename);

      // Usar la API de backup online de better-sqlite3 para máxima consistencia y cero bloqueo
      await db.backup(tempBackupPath);

      logger.info(`Copia de seguridad de base de datos generada: ${backupFilename}`, { reqId: req.id });

      res.setHeader('Content-Type', 'application/x-sqlite3');
      res.setHeader('Content-Disposition', `attachment; filename="${backupFilename}"`);

      const fileStream = fs.createReadStream(tempBackupPath);
      fileStream.pipe(res);

      fileStream.on('end', () => {
        // Eliminar archivo temporal tras enviarlo
        fs.unlink(tempBackupPath, () => {});
      });
    } catch (error) {
      next(error);
    }
  },

  // Exportar reporte de exposiciones y asistencia en CSV
  async exportCsvReport(req, res, next) {
    try {
      const groups = GroupModel.getAll();

      // Cabeceras del reporte CSV
      const headers = [
        'Orden',
        'No_Grupo',
        'Nombre_Grupo',
        'Tema',
        'Carrera',
        'Integrantes',
        'Tipo_Material',
        'Recurso',
        'Duracion_Minutos',
        'Estado',
        'Fecha_Registro',
      ];

      const csvRows = [headers.join(',')];

      for (const g of groups) {
        const membersList = (g.members || []).join('; ');
        const resource = g.presentation_type === 'file' ? (g.original_name || g.file_name) : g.external_url;

        const row = [
          g.presentation_order,
          g.group_number,
          `"${(g.group_name || '').replace(/"/g, '""')}"`,
          `"${(g.topic || '').replace(/"/g, '""')}"`,
          `"${(g.career || '').replace(/"/g, '""')}"`,
          `"${membersList.replace(/"/g, '""')}"`,
          g.presentation_type,
          `"${(resource || '').replace(/"/g, '""')}"`,
          g.duration_minutes || 15,
          g.status || 'pending',
          `"${g.created_at || ''}"`,
        ];

        csvRows.push(row.join(','));
      }

      const csvContent = '\uFEFF' + csvRows.join('\r\n'); // BOM para compatibilidad con Excel

      logger.info('Reporte de exposiciones CSV exportado exitosamente', { reqId: req.id, totalGrupos: groups.length });

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="reporte_exposiciones_umg.csv"');
      res.send(csvContent);
    } catch (error) {
      next(error);
    }
  },

  // Reiniciar el estado de todos los grupos a 'pending'
  async resetAllStatuses(req, res, next) {
    try {
      const stmt = db.prepare(`
        UPDATE groups 
        SET status = 'pending', updated_at = CURRENT_TIMESTAMP
      `);
      const result = stmt.run();

      logger.info(`Reinicio de jornada: todos los estados de grupos fueron restablecidos a 'pending' (${result.changes} grupos)`, {
        reqId: req.id,
      });

      res.json({
        success: true,
        message: `Se restableció el estado de ${result.changes} grupos a 'Pendiente'.`,
        affected: result.changes,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default AdminController;
