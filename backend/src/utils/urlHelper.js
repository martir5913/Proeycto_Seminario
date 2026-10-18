import logger from './logger.js';

/**
 * Normaliza y resuelve enlaces externos de presentaciones (Canva, Google Slides, Prezi)
 * para garantizar compatibilidad con el modo de inserción (embed) sin bloqueos de iframe.
 * 
 * @param {string} rawUrl - URL ingresada por el usuario
 * @returns {Promise<string>} - URL normalizada para inserción
 */
export async function normalizePresentationUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;
  let url = rawUrl.trim();

  // 1. Si es un enlace corto de Canva (canva.link/...), resolver la redirección HTTP 301
  if (url.includes('canva.link/')) {
    try {
      logger.info(`Resolviendo enlace corto de Canva: ${url}`);
      const res = await fetch(url, { redirect: 'follow' });
      if (res && res.url && res.url !== url) {
        url = res.url;
        logger.info(`Enlace de Canva resuelto a: ${url}`);
      }
    } catch (err) {
      logger.warn(`No se pudo resolver redirección de canva.link: ${err.message}`);
    }
  }

  // 2. Si es un enlace de diseño de Canva (canva.com/design/...), convertir a formato de inserción limpio /view?embed
  if (url.includes('canva.com/design/')) {
    try {
      // Extraer identificador del diseño y slug: /design/DAHK-xWcO2o/GPffUSS53vw8C5wTl3a5rg/view?...
      const match = url.match(/canva\.com\/design\/([A-Za-z0-9_-]+)\/([A-Za-z0-9_-]+)/);
      if (match) {
        const designId = match[1];
        const hash = match[2];
        return `https://www.canva.com/design/${designId}/${hash}/view?embed`;
      }

      // Segmento único: /design/DAHK-xWcO2o/...
      const singleMatch = url.match(/canva\.com\/design\/([A-Za-z0-9_-]+)/);
      if (singleMatch) {
        const designId = singleMatch[1];
        return `https://www.canva.com/design/${designId}/view?embed`;
      }
    } catch (err) {
      logger.warn(`Error al normalizar enlace de Canva: ${err.message}`);
    }

    // Asegurar parámetro ?embed
    if (!url.includes('?embed') && !url.includes('&embed')) {
      const cleanBase = url.split('?')[0];
      return `${cleanBase}?embed`;
    }
  }

  // 3. Si es Google Slides, convertir /edit a /embed
  if (url.includes('docs.google.com/presentation') && url.includes('/edit')) {
    url = url.replace(/\/edit.*$/, '/embed?start=false&loop=false&delayms=3000');
  }

  return url;
}

export default {
  normalizePresentationUrl,
};
