import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger.js';

const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'database.sqlite');

// Asegurar que el directorio de la base de datos exista
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db;

try {
  db = new Database(dbPath, { verbose: process.env.NODE_ENV === 'development' ? (sql) => logger.debug(`[SQL] ${sql}`) : null });

  // Configuración de Pragmas para concurrencia y fiabilidad en producción
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 5000');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');

  logger.info(`Base de datos SQLite conectada exitosamente en: ${dbPath} (Modo WAL activo)`);
} catch (error) {
  logger.error('Error al inicializar la base de datos SQLite', { error: error.message });
  process.exit(1);
}

// Inicialización del esquema de tablas
export function initDatabaseSchema() {
  const createTablesSql = `
    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      group_number INTEGER NOT NULL,
      group_name TEXT NOT NULL,
      topic TEXT NOT NULL,
      career TEXT DEFAULT 'Ingeniería en Sistemas',
      members TEXT NOT NULL, -- Almacenado como JSON array string
      presentation_type TEXT NOT NULL CHECK(presentation_type IN ('file', 'link')),
      file_path TEXT,
      file_name TEXT,
      original_name TEXT,
      mime_type TEXT,
      file_size INTEGER,
      external_url TEXT,
      presentation_order INTEGER NOT NULL DEFAULT 0,
      duration_minutes INTEGER NOT NULL DEFAULT 15,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'presenting', 'completed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_groups_order ON groups(presentation_order);
    CREATE INDEX IF NOT EXISTS idx_groups_number ON groups(group_number);

    CREATE TABLE IF NOT EXISTS banners (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      image_url TEXT NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 1,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_banners_order ON banners(display_order);

    CREATE TABLE IF NOT EXISTS site_settings (
      setting_key TEXT PRIMARY KEY,
      setting_value TEXT NOT NULL,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  db.exec(createTablesSql);

  // Inicializar configuraciones por defecto si no existen
  const defaultSettings = [
    { key: 'site_title', value: 'Seminario de Graduación 2026', desc: 'Título principal del evento' },
    { key: 'site_subtitle', value: 'Jornada de Presentación y Defensa de Proyectos de Grado', desc: 'Subtítulo del evento' },
    { key: 'institution_name', value: 'UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA', desc: 'Nombre institucional' },
    { key: 'institution_faculty', value: 'Campus Villa Nueva • Facultad de Ingeniería en Sistemas', desc: 'Campus y Facultad' },
    { key: 'welcome_words', value: 'Bienvenidos estimadas autoridades académicas, catedráticos examinadores, estudiantes y apreciable audiencia. Presenciaremos la exposición de proyectos de investigación aplicada y desarrollo tecnológico orientados a resolver necesidades de impacto en el sector profesional.', desc: 'Discurso o palabras solemnes de apertura' },
    { key: 'carousel_interval', value: '5000', desc: 'Milisegundos entre cada diapositiva del carrusel' },
    { key: 'carousel_transition', value: 'fade', desc: 'Tipo de animación del carrusel (fade o slide)' },
  ];

  const checkSettingStmt = db.prepare('SELECT COUNT(*) as count FROM site_settings WHERE setting_key = ?');
  const insertSettingStmt = db.prepare('INSERT INTO site_settings (setting_key, setting_value, description) VALUES (?, ?, ?)');

  for (const s of defaultSettings) {
    const res = checkSettingStmt.get(s.key);
    if (res.count === 0) {
      insertSettingStmt.run(s.key, s.value, s.desc);
    }
  }

  // Inicializar banners por defecto si la tabla está vacía
  const checkBannersStmt = db.prepare('SELECT COUNT(*) as count FROM banners');
  const bannerCount = checkBannersStmt.get().count;

  if (bannerCount === 0) {
    const defaultBanners = [
      {
        id: 'banner-default-1',
        title: 'Seminario de Graduación e Investigación 2026',
        subtitle: 'Auditorio Mayor Campus Villa Nueva • Innovación y Excelencia Tecnológica',
        file_name: 'banner_auditorium.jpg',
        file_path: 'uploads/banners/banner_auditorium.jpg',
        image_url: '/uploads/banners/banner_auditorium.jpg',
        display_order: 1,
        is_active: 1,
      },
      {
        id: 'banner-default-2',
        title: 'Ingeniería en Sistemas, Ciberseguridad e IA',
        subtitle: 'Defensa de Proyectos Tecnológicos y Soluciones Empresariales de Alto Impacto',
        file_name: 'banner_tech.jpg',
        file_path: 'uploads/banners/banner_tech.jpg',
        image_url: '/uploads/banners/banner_tech.jpg',
        display_order: 2,
        is_active: 1,
      },
      {
        id: 'banner-default-3',
        title: 'Defensa y Evaluación Académica en el Estrado',
        subtitle: 'Comité Examinador, Cátedra de Seminario y Clausura Solemne',
        file_name: 'banner_students.jpg',
        file_path: 'uploads/banners/banner_students.jpg',
        image_url: '/uploads/banners/banner_students.jpg',
        display_order: 3,
        is_active: 1,
      },
    ];

    const insertBannerStmt = db.prepare(`
      INSERT INTO banners (id, title, subtitle, file_name, file_path, image_url, display_order, is_active)
      VALUES (@id, @title, @subtitle, @file_name, @file_path, @image_url, @display_order, @is_active)
    `);

    for (const b of defaultBanners) {
      insertBannerStmt.run(b);
    }
    logger.info('3 Banners institucionales por defecto creados e inicializados.');
  }

  logger.info('Esquema de base de datos verificado/inicializado correctamente.');
}

export { db };
export default db;
