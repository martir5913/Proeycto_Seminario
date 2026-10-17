import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import db, { initDatabaseSchema } from '../config/database.js';
import logger from './logger.js';

initDatabaseSchema();

const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Generar PDF de demostración válido
const samplePdfFilename = `sample-presentacion-umg.pdf`;
const samplePdfPath = path.join(uploadsDir, samplePdfFilename);

const minimalPdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 72 >> stream
BT
/F1 22 Tf
50 720 Td
(UMG Campus Villa Nueva - Seminario de Graduacion) Tj
/F1 16 Tf
0 -40 Td
(Grupo 1: Arquitectura de Microservicios en la Nube) Tj
ET
endstream endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000367 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
443
%%EOF`;

if (!fs.existsSync(samplePdfPath)) {
  fs.writeFileSync(samplePdfPath, minimalPdf);
  logger.info(`Archivo PDF de demostración generado en: ${samplePdfPath}`);
}

const countStmt = db.prepare('SELECT COUNT(*) as count FROM groups');
const count = countStmt.get().count;

if (count === 0) {
  const insertStmt = db.prepare(`
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

  const initialGroups = [
    {
      id: uuidv4(),
      group_number: 1,
      group_name: 'Los Innovadores',
      topic: 'Arquitectura de Microservicios y Contenedores',
      career: 'Ingeniería en Sistemas',
      members: JSON.stringify(['Carlos Mendoza', 'Ana Lucía Morales', 'David Gómez']),
      presentation_type: 'file',
      file_path: samplePdfPath,
      file_name: samplePdfFilename,
      original_name: 'presentacion_microservicios_umg.pdf',
      mime_type: 'application/pdf',
      file_size: Buffer.byteLength(minimalPdf),
      external_url: null,
      presentation_order: 1,
      duration_minutes: 15,
      status: 'pending',
    },
    {
      id: uuidv4(),
      group_number: 2,
      group_name: 'CyberShield UMG',
      topic: 'Ciberseguridad y Mitigación de Vulnerabilidades',
      career: 'Ingeniería en Sistemas',
      members: JSON.stringify(['María Fernanda Ruiz', 'Kevin Alexander Soto']),
      presentation_type: 'link',
      file_path: null,
      file_name: null,
      original_name: null,
      mime_type: null,
      file_size: null,
      external_url: 'https://docs.google.com/presentation/d/1_sample/embed',
      presentation_order: 2,
      duration_minutes: 15,
      status: 'pending',
    },
    {
      id: uuidv4(),
      group_number: 3,
      group_name: 'DataCore Analytics',
      topic: 'Modelos Predictivos con Inteligencia Artificial',
      career: 'Ingeniería en Sistemas',
      members: JSON.stringify(['Rodrigo Castillo', 'Paola Estrada', 'Jorge Pineda']),
      presentation_type: 'link',
      file_path: null,
      file_name: null,
      original_name: null,
      mime_type: null,
      file_size: null,
      external_url: 'https://www.canva.com/design/sample?embed',
      presentation_order: 3,
      duration_minutes: 20,
      status: 'pending',
    },
  ];

  for (const grp of initialGroups) {
    insertStmt.run(grp);
  }

  logger.info('Datos semilla insertados exitosamente (3 grupos de demostración).');
  console.log('✅ Base de datos inicializada con 3 grupos de muestra.');
} else {
  console.log(`ℹ️ La base de datos ya contiene ${count} grupos. No se insertaron datos semilla duplicados.`);
}

db.close();
process.exit(0);
