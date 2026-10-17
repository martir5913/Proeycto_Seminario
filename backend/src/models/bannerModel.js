import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const BannerModel = {
  // Obtener banners (opcionalmente solo los activos para la pantalla principal)
  getAll(onlyActive = false) {
    let sql = 'SELECT * FROM banners';
    if (onlyActive) {
      sql += ' WHERE is_active = 1';
    }
    sql += ' ORDER BY display_order ASC, created_at ASC';
    const stmt = db.prepare(sql);
    return stmt.all();
  },

  // Obtener banner por ID
  getById(id) {
    const stmt = db.prepare('SELECT * FROM banners WHERE id = ?');
    return stmt.get(id);
  },

  // Obtener el siguiente número de orden
  getNextOrder() {
    const stmt = db.prepare('SELECT MAX(display_order) as max_order FROM banners');
    const result = stmt.get();
    return (result?.max_order ?? 0) + 1;
  },

  // Crear nuevo banner
  create(data) {
    const id = data.id || uuidv4();
    const nextOrder = data.display_order ?? this.getNextOrder();

    const stmt = db.prepare(`
      INSERT INTO banners (
        id, title, subtitle, file_name, file_path, image_url, display_order, is_active
      ) VALUES (
        @id, @title, @subtitle, @file_name, @file_path, @image_url, @display_order, @is_active
      )
    `);

    stmt.run({
      id,
      title: data.title,
      subtitle: data.subtitle || '',
      file_name: data.file_name,
      file_path: data.file_path,
      image_url: data.image_url,
      display_order: nextOrder,
      is_active: data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
    });

    return this.getById(id);
  },

  // Actualizar banner existente
  update(id, data) {
    const stmt = db.prepare(`
      UPDATE banners 
      SET title = COALESCE(@title, title),
          subtitle = COALESCE(@subtitle, subtitle),
          is_active = COALESCE(@is_active, is_active),
          display_order = COALESCE(@display_order, display_order),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `);

    stmt.run({
      id,
      title: data.title !== undefined ? data.title : null,
      subtitle: data.subtitle !== undefined ? data.subtitle : null,
      is_active: data.is_active !== undefined ? (data.is_active ? 1 : 0) : null,
      display_order: data.display_order !== undefined ? Number(data.display_order) : null,
    });

    return this.getById(id);
  },

  // Alternar estado activo / inactivo
  toggle(id) {
    const current = this.getById(id);
    if (!current) return null;

    const newStatus = current.is_active === 1 ? 0 : 1;
    const stmt = db.prepare(`
      UPDATE banners 
      SET is_active = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    stmt.run(newStatus, id);
    return this.getById(id);
  },

  // Eliminar banner
  delete(id) {
    const banner = this.getById(id);
    if (!banner) return null;

    const stmt = db.prepare('DELETE FROM banners WHERE id = ?');
    stmt.run(id);
    return banner;
  },

  // Reordenar banners
  updateOrder(orderList) {
    const updateStmt = db.prepare(`
      UPDATE banners 
      SET display_order = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);

    const transaction = db.transaction((items) => {
      for (const item of items) {
        updateStmt.run(item.display_order, item.id);
      }
    });

    transaction(orderList);
    return this.getAll(false);
  },
};

export default BannerModel;
