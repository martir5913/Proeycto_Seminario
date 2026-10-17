import db from '../config/database.js';

export const SettingsModel = {
  // Obtener todas las configuraciones como objeto clave-valor
  getAll() {
    const stmt = db.prepare('SELECT setting_key, setting_value, description FROM site_settings');
    const rows = stmt.all();
    const settings = {};
    for (const row of rows) {
      settings[row.setting_key] = row.setting_value;
    }
    return settings;
  },

  // Obtener configuración específica
  get(key) {
    const stmt = db.prepare('SELECT setting_value FROM site_settings WHERE setting_key = ?');
    const row = stmt.get(key);
    return row ? row.setting_value : null;
  },

  // Actualizar o insertar configuración
  set(key, value, description = null) {
    const stmt = db.prepare(`
      INSERT INTO site_settings (setting_key, setting_value, description, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(setting_key) DO UPDATE SET
        setting_value = excluded.setting_value,
        updated_at = CURRENT_TIMESTAMP
    `);
    stmt.run(key, String(value), description);
    return this.get(key);
  },

  // Actualizar múltiples configuraciones a la vez en una transacción
  updateMany(settingsObj) {
    const updateStmt = db.prepare(`
      INSERT INTO site_settings (setting_key, setting_value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(setting_key) DO UPDATE SET
        setting_value = excluded.setting_value,
        updated_at = CURRENT_TIMESTAMP
    `);

    const transaction = db.transaction((entries) => {
      for (const [key, value] of entries) {
        if (value !== undefined && value !== null) {
          updateStmt.run(key, String(value));
        }
      }
    });

    transaction(Object.entries(settingsObj));
    return this.getAll();
  },
};

export default SettingsModel;
