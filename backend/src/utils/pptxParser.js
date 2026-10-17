import fs from 'fs';
import JSZip from 'jszip';
import xml2js from 'xml2js';
import logger from './logger.js';

const xmlParser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: false });

/**
 * Parsea un archivo PPTX y extrae diapositivas con sus títulos, textos, párrafos e imágenes embebidas.
 * @param {string} filePath Ruta física del archivo .pptx
 * @returns {Promise<{ totalSlides: number, slides: Array }>}
 */
export async function parsePptx(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Archivo PPTX no encontrado en: ${filePath}`);
    }

    const fileBuffer = fs.readFileSync(filePath);
    const zip = await JSZip.loadAsync(fileBuffer);

    // 1. Extraer imágenes multimedia de ppt/media/
    const mediaFiles = {};
    const mediaFolder = zip.folder('ppt/media');
    if (mediaFolder) {
      for (const [relativePath, zipEntry] of Object.entries(mediaFolder.files)) {
        if (!zipEntry.dir) {
          const extension = relativePath.split('.').pop().toLowerCase();
          let mimeType = 'image/png';
          if (extension === 'jpg' || extension === 'jpeg') mimeType = 'image/jpeg';
          else if (extension === 'svg') mimeType = 'image/svg+xml';
          else if (extension === 'gif') mimeType = 'image/gif';

          const base64Data = await zipEntry.async('base64');
          const cleanName = relativePath.replace('ppt/media/', '');
          mediaFiles[cleanName] = `data:${mimeType};base64,${base64Data}`;
        }
      }
    }

    // 2. Localizar archivos de diapositivas ordenados: ppt/slides/slide1.xml, slide2.xml...
    const slideEntries = [];
    zip.forEach((relativePath) => {
      const match = relativePath.match(/^ppt\/slides\/slide(\d+)\.xml$/);
      if (match) {
        slideEntries.push({
          path: relativePath,
          number: parseInt(match[1], 10),
        });
      }
    });

    slideEntries.sort((a, b) => a.number - b.number);

    const slides = [];

    for (let i = 0; i < slideEntries.length; i++) {
      const entry = slideEntries[i];
      const slideXmlContent = await zip.file(entry.path).async('string');
      const parsedXml = await xmlParser.parseStringPromise(slideXmlContent);

      const slideTexts = [];
      let slideTitle = '';

      // Función recursiva para extraer cadenas de texto de etiquetas <a:t>
      function extractTextNodes(node) {
        if (!node) return;
        if (typeof node === 'string') return;

        // Buscar texto en elementos <a:t>
        if (node['a:t']) {
          const text = typeof node['a:t'] === 'string' ? node['a:t'] : node['a:t']._ || '';
          if (text && text.trim()) {
            slideTexts.push(text.trim());
          }
        }

        // Si hay hijos, recorrerlos
        for (const key of Object.keys(node)) {
          if (typeof node[key] === 'object') {
            extractTextNodes(node[key]);
          }
        }
      }

      extractTextNodes(parsedXml);

      // Si hay textos, el primero suele ser el título de la diapositiva
      if (slideTexts.length > 0) {
        slideTitle = slideTexts[0];
      } else {
        slideTitle = `Diapositiva ${i + 1}`;
      }

      // 3. Revisar relaciones para ver qué imágenes están en esta diapositiva
      const relsPath = `ppt/slides/_rels/slide${entry.number}.xml.rels`;
      const slideImages = [];
      const relsFile = zip.file(relsPath);

      if (relsFile) {
        const relsXml = await relsFile.async('string');
        const parsedRels = await xmlParser.parseStringPromise(relsXml);
        const relationships = parsedRels?.Relationships?.Relationship;

        if (relationships) {
          const relArray = Array.isArray(relationships) ? relationships : [relationships];
          for (const rel of relArray) {
            const target = rel?.$?.Target || '';
            if (target.includes('media/')) {
              const imgName = target.split('media/').pop();
              if (mediaFiles[imgName]) {
                slideImages.push(mediaFiles[imgName]);
              }
            }
          }
        }
      }

      // Si no encontramos imágenes por relaciones específicas pero hay imágenes globales
      // y la diapositiva tiene pocos textos, asociamos imágenes si corresponde
      if (slideImages.length === 0 && Object.keys(mediaFiles).length > 0 && i < Object.keys(mediaFiles).length) {
        const allMedia = Object.values(mediaFiles);
        slideImages.push(allMedia[i]);
      }

      slides.push({
        slideNumber: i + 1,
        title: slideTitle,
        content: slideTexts.slice(slideTitle === slideTexts[0] ? 1 : 0),
        images: slideImages,
      });
    }

    return {
      totalSlides: slides.length,
      slides,
    };
  } catch (error) {
    logger.error(`Error al parsear archivo PPTX: ${error.message}`);
    throw error;
  }
}

export default parsePptx;
