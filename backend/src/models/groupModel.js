import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const GroupModel = {
  // Obtener todos los grupos ordenados por orden de exposición
  getAll() {
    const stmt = db.prepare(`
      SELECT * FROM groups 
      ORDER BY presentation_order ASC, group_number ASC
    `);
    const rows = stmt.all();
    return rows.map(row => ({
      ...row,
      members: JSON.parse(row.members || '[]'),
    }));
  },

  // Obtener un grupo por ID
  getById(id) {
    const stmt = db.prepare('SELECT * FROM groups WHERE id = ?');
    const row = stmt.get(id);
    if (!row) return null;
    return {
      ...row,
      members: JSON.parse(row.members || '[]'),
    };
  },

  // Obtener el siguiente número de orden disponible
  getNextOrder() {
    const stmt = db.prepare('SELECT MAX(presentation_order) as max_order FROM groups');
    const result = stmt.get();
    return (result?.max_order ?? 0) + 1;
  },

  // Crear un nuevo grupo
  create(data) {
    const id = data.id || uuidv4();
    const nextOrder = data.presentation_order ?? this.getNextOrder();
    const membersJson = JSON.stringify(data.members || []);

    const stmt = db.prepare(`
      INSERT INTO groups (
        id, group_number, group_name, topic, career, members,
        presentation_type, file_path, file_name, original_name,
        mime_type, file_size, external_url, presentation_order,
        duration_minutes, status
      ) VALUES (
        @id, @group_number, @group_name, @topic, @career, @members,
        @presentation_type, @file_path, @file_name, @original_name,
        @mime_type, @file_size, @external_url, @presentation_order,
        @duration_minutes, @status
      )
    `);

    stmt.run({
      id,
      group_number: Number(data.group_number),
      group_name: data.group_name,
      topic: data.topic,
      career: data.career || 'Ingeniería en Sistemas',
      members: membersJson,
      presentation_type: data.presentation_type,
      file_path: data.file_path || null,
      file_name: data.file_name || null,
      original_name: data.original_name || null,
      mime_type: data.mime_type || null,
      file_size: data.file_size || null,
      external_url: data.external_url || null,
      presentation_order: nextOrder,
      duration_minutes: Number(data.duration_minutes) || 15,
      status: data.status || 'pending',
    });

    return this.getById(id);
  },

  // Actualizar el orden de varios grupos en una transacción atómica
  updateOrder(orderList) {
    // orderList es un array de { id, presentation_order }
    const updateStmt = db.prepare(`
      UPDATE groups 
      SET presentation_order = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);

    const transaction = db.transaction((items) => {
      for (const item of items) {
        updateStmt.run(item.presentation_order, item.id);
      }
    });

    transaction(orderList);
    return this.getAll();
  },

  // Actualizar el estado de exposición de un grupo
  updateStatus(id, status) {
    const stmt = db.prepare(`
      UPDATE groups 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    stmt.run(status, id);
    return this.getById(id);
  },

  // Eliminar un grupo
  delete(id) {
    const group = this.getById(id);
    if (!group) return null;

    const stmt = db.prepare('DELETE FROM groups WHERE id = ?');
    stmt.run(id);
    return group;
  },
};

export default GroupModel;
