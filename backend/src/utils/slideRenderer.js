import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import logger from './logger.js';

const execPromise = util.promisify(exec);

/**
 * Renderiza diapositivas a imágenes PNG de alta resolución (1080p)
 * preservando 100% el diseño original, tipografía, fondos, vectores y colores del archivo PPTX o PDF.
 * 
 * @param {string} filePath - Ruta absoluta del archivo (.pptx, .ppt o .pdf)
 * @param {string} groupId - ID único del grupo
 * @returns {Promise<{ totalSlides: number, slides: Array<{ slideNumber: number, imageUrl: string }> }>}
 */
export async function renderSlidesFromPresentation(filePath, groupId) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Archivo de presentación no existe en: ${filePath}`);
    }

    const uploadsDir = path.dirname(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const slidesDir = path.join(uploadsDir, `slides_${groupId}`);

    // Si ya existe la carpeta y tiene imágenes generadas, devolverlas inmediatamente (Caché instantánea)
    if (fs.existsSync(slidesDir)) {
      const existingImages = fs
        .readdirSync(slidesDir)
        .filter((f) => f.startsWith('slide-') && f.endsWith('.png'));

      if (existingImages.length > 0) {
        existingImages.sort((a, b) => {
          const numA = parseInt(a.replace('slide-', '').replace('.png', ''), 10);
          const numB = parseInt(b.replace('slide-', '').replace('.png', ''), 10);
          return numA - numB;
        });

        return {
          totalSlides: existingImages.length,
          slides: existingImages.map((_, idx) => ({
            slideNumber: idx + 1,
            imageUrl: `/api/presentations/${groupId}/slide-image/${idx + 1}`,
          })),
        };
      }
    }

    // Asegurar directorio destino para las imágenes de diapositivas
    if (!fs.existsSync(slidesDir)) {
      fs.mkdirSync(slidesDir, { recursive: true });
    }

    let pdfPath = filePath;

    // 1. Si es archivo PowerPoint (.pptx o .ppt), convertirlo a PDF fiel mediante LibreOffice Impress Headless
    if (ext === '.pptx' || ext === '.ppt') {
      const fileNameWithoutExt = path.basename(filePath, ext);
      const targetPdfName = `${fileNameWithoutExt}.pdf`;
      const expectedPdfPath = path.join(uploadsDir, targetPdfName);

      if (!fs.existsSync(expectedPdfPath)) {
        logger.info(`Convirtiendo presentación PowerPoint a PDF fiel: ${path.basename(filePath)}`);
        try {
          await execPromise(
            `soffice --headless --invisible --nologo --nodefault --nofirststartwizard --nolockcheck "-env:UserInstallation=file:///tmp/LibreOffice_Conversion" --convert-to pdf "${filePath}" --outdir "${uploadsDir}"`,
            {
              timeout: 60000,
            }
          );
        } catch (sofficeErr) {
          logger.warn(`Advertencia/Error al ejecutar soffice para ${filePath}: ${sofficeErr.message}`);
        }
      }

      if (fs.existsSync(expectedPdfPath)) {
        pdfPath = expectedPdfPath;
      } else {
        throw new Error('No se pudo generar el archivo PDF base desde PowerPoint');
      }
    }

    // 2. Renderizar cada página del PDF en imágenes PNG de alta resolución mediante pdftoppm
    if (fs.existsSync(pdfPath)) {
      logger.info(`Generando diapositivas en alta resolución para grupo ${groupId}...`);
      const prefix = path.join(slidesDir, 'slide');
      await execPromise(`pdftoppm -png -r 150 "${pdfPath}" "${prefix}"`, {
        timeout: 30000,
      });

      const generatedFiles = fs
        .readdirSync(slidesDir)
        .filter((f) => f.startsWith('slide-') && f.endsWith('.png'));

      generatedFiles.sort((a, b) => {
        const numA = parseInt(a.replace(/[^0-9]/g, ''), 10);
        const numB = parseInt(b.replace(/[^0-9]/g, ''), 10);
        return numA - numB;
      });

      // Asegurar nombres canónicos slide-1.png, slide-2.png...
      generatedFiles.forEach((file, idx) => {
        const canonicalName = `slide-${idx + 1}.png`;
        if (file !== canonicalName) {
          try {
            fs.renameSync(path.join(slidesDir, file), path.join(slidesDir, canonicalName));
          } catch {
            // ignorar conflicto
          }
        }
      });

      if (generatedFiles.length > 0) {
        logger.info(`Renderizadas ${generatedFiles.length} diapositivas con éxito para grupo ${groupId}`);
        return {
          totalSlides: generatedFiles.length,
          slides: generatedFiles.map((_, idx) => ({
            slideNumber: idx + 1,
            imageUrl: `/api/presentations/${groupId}/slide-image/${idx + 1}`,
          })),
        };
      }
    }

    throw new Error('No se generaron imágenes de diapositivas');
  } catch (error) {
    logger.error(`Error en renderSlidesFromPresentation para ${groupId}: ${error.message}`);
    throw error;
  }
}

export default {
  renderSlidesFromPresentation,
};
