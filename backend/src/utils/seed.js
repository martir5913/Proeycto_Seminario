import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import db, { initDatabaseSchema } from '../config/database.js';
import logger from './logger.js';

initDatabaseSchema();

const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 1. Generar PDF de demostración válido
const samplePdfFilename = 'sample-presentacion-umg.pdf';
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

// 2. Generar PPTX de demostración válido con múltiples diapositivas
const samplePptxFilename = 'sample-presentacion-umg.pptx';
const samplePptxPath = path.join(uploadsDir, samplePptxFilename);

async function ensureSamplePptx() {
  if (fs.existsSync(samplePptxPath)) return;

  const zip = new JSZip();

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide2.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide3.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
  <Override PartName="/ppt/slides/slide4.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
</Types>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`;

  function buildSlideXml(title, bullets) {
    const bulletsXml = bullets.map((b) => `<a:p><a:r><a:t>${b}</a:t></a:r></a:p>`).join('');
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:txBody>
          <a:p><a:r><a:t>${title}</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:txBody>
          ${bulletsXml}
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;
  }

  zip.file('[Content_Types].xml', contentTypes);
  zip.file('_rels/.rels', rels);
  zip.file('ppt/presentation.xml', '<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldIdLst><p:sldId id="256"/></p:sldIdLst></p:presentation>');
  zip.file('ppt/slides/slide1.xml', buildSlideXml('Ciberseguridad y Mitigación de Vulnerabilidades', [
    'Facultad de Ingeniería en Sistemas - UMG Campus Villa Nueva',
    'Expositores: María Fernanda Ruiz, Kevin Alexander Soto',
    'Seminario de Graduación 2026'
  ]));
  zip.file('ppt/slides/slide2.xml', buildSlideXml('Planteamiento del Problema', [
    'Aumento de incidentes de seguridad y ransomware en redes corporativas',
    'Vulnerabilidades por configuraciones por defecto y puertos desprotegidos',
    'Necesidad de análisis proactivo y auditoría continua'
  ]));
  zip.file('ppt/slides/slide3.xml', buildSlideXml('Arquitectura de Seguridad Propuesta', [
    'Segmentación de red Zero Trust con autenticación multifactor',
    'Escaneo automatizado de vulnerabilidades y hardening de servidores',
    'Monitoreo centralizado de logs y eventos de seguridad (SIEM)'
  ]));
  zip.file('ppt/slides/slide4.xml', buildSlideXml('Conclusiones y Resultados', [
    'Reducción del 85% de la superficie de ataque comprobada en pruebas de penetración',
    'Cumplimiento con estándares ISO 27001 y políticas universitarias de ciberdefensa',
    'Recomendaciones para implementación gradual en campus'
  ]));

  const buffer = await zip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync(samplePptxPath, buffer);
  logger.info(`Archivo PPTX de demostración generado en: ${samplePptxPath}`);
}

await ensureSamplePptx();

// 3. Poblar o actualizar datos de grupos
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
      presentation_type: 'file',
      file_path: samplePptxPath,
      file_name: samplePptxFilename,
      original_name: 'ciberseguridad_defensa_umg.pptx',
      mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      file_size: fs.statSync(samplePptxPath).size,
      external_url: null,
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

  logger.info('Datos semilla insertados exitosamente (3 grupos de demostración: PDF, PPTX y Canva).');
  console.log('✅ Base de datos inicializada con 3 grupos de muestra (PDF, PPTX y Canva).');
} else {
  // Asegurar que el Grupo 2 tenga el archivo PPTX configurado
  const updatePptxStmt = db.prepare(`
    UPDATE groups 
    SET presentation_type = 'file',
        file_path = ?,
        file_name = ?,
        original_name = ?,
        mime_type = ?,
        file_size = ?
    WHERE group_number = 2 AND presentation_type = 'link'
  `);
  updatePptxStmt.run(
    samplePptxPath,
    samplePptxFilename,
    'ciberseguridad_defensa_umg.pptx',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    fs.statSync(samplePptxPath).size
  );
  console.log(`ℹ️ La base de datos ya contiene grupos. Configuración PPTX verificada.`);
}

db.close();
process.exit(0);
