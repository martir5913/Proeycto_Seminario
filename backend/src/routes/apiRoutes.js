import express from 'express';
import GroupController from '../controllers/groupController.js';
import PresentationController from '../controllers/presentationController.js';
import AdminController from '../controllers/adminController.js';
import uploadPresentation from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// --- Rutas de Grupos ---
router.get('/groups', GroupController.getAll);
router.get('/groups/:id', GroupController.getById);
router.post('/groups', uploadPresentation.single('file'), GroupController.create);
router.put('/groups/order', GroupController.updateOrder);
router.patch('/groups/:id/status', GroupController.updateStatus);
router.delete('/groups/:id', GroupController.delete);

// --- Rutas de Presentaciones / Archivos ---
router.get('/presentations/:id/file', PresentationController.getFileByGroupId);
router.get('/presentations/raw/:filename', PresentationController.getFileByName);

// --- Rutas de Control Administrativo y Moderación ---
router.get('/admin/backup', AdminController.downloadBackup);
router.get('/admin/report', AdminController.exportCsvReport);
router.post('/admin/reset-status', AdminController.resetAllStatuses);

export default router;
