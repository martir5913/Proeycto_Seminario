import express from 'express';
import GroupController from '../controllers/groupController.js';
import PresentationController from '../controllers/presentationController.js';
import AdminController from '../controllers/adminController.js';
import BannerController from '../controllers/bannerController.js';
import SettingsController from '../controllers/settingsController.js';
import { uploadPresentation, uploadBanner } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// --- Rutas de Grupos ---
router.get('/groups', GroupController.getAll);
router.get('/groups/:id', GroupController.getById);
router.post('/groups', uploadPresentation.single('file'), GroupController.create);
router.put('/groups/order', GroupController.updateOrder);
router.put('/groups/:id', uploadPresentation.single('file'), GroupController.update);
router.patch('/groups/:id/status', GroupController.updateStatus);
router.delete('/groups/:id', GroupController.delete);

// --- Rutas de Banners / Carrusel Multimedia ---
router.get('/banners', BannerController.getAll);
router.get('/banners/:id', BannerController.getById);
router.post('/banners', uploadBanner.single('image'), BannerController.create);
router.put('/banners/order', BannerController.updateOrder);
router.put('/banners/:id', BannerController.update);
router.patch('/banners/:id/toggle', BannerController.toggle);
router.delete('/banners/:id', BannerController.delete);

// --- Rutas de Configuración del Sitio ---
router.get('/settings', SettingsController.getSettings);
router.put('/settings', SettingsController.updateSettings);

// --- Rutas de Presentaciones / Archivos ---
router.get('/presentations/:id/slides', PresentationController.getSlidesByGroupId);
router.get('/presentations/:id/slide-image/:slideNum', PresentationController.getSlideImage);
router.get('/presentations/:id/file', PresentationController.getFileByGroupId);
router.get('/presentations/raw/:filename', PresentationController.getFileByName);

// --- Rutas de Control Administrativo y Moderación ---
router.get('/admin/backup', AdminController.downloadBackup);
router.get('/admin/report', AdminController.exportCsvReport);
router.post('/admin/reset-status', AdminController.resetAllStatuses);

export default router;
