import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  IconButton,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  TextField,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  Divider,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import SettingsIcon from '@mui/icons-material/Settings';
import GroupsIcon from '@mui/icons-material/Groups';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SaveIcon from '@mui/icons-material/Save';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import TableViewIcon from '@mui/icons-material/TableView';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AddIcon from '@mui/icons-material/Add';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import axios from 'axios';

import RegistrationModal from '../components/RegistrationModal';
import EditGroupModal from '../components/EditGroupModal';

export const SiteManagement = ({ onBack, onSettingsChanged }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [alertInfo, setAlertInfo] = useState(null);

  // --- Estado de Banners ---
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerSubtitle, setNewBannerSubtitle] = useState('');
  const [newBannerFile, setNewBannerFile] = useState(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState(null);

  // --- Estado de Configuraciones ---
  const [settings, setSettings] = useState({
    site_title: '',
    site_subtitle: '',
    institution_name: '',
    institution_faculty: '',
    welcome_words: '',
    carousel_interval: '5000',
    carousel_transition: 'fade',
    stage_theme: 'dark',
  });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // --- Estado de Grupos ---
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [savingGroupOrder, setSavingGroupOrder] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState(null);

  useEffect(() => {
    fetchBanners();
    fetchSettings();
    fetchGroups();
  }, []);

  // --- Fetchers ---
  const fetchBanners = async () => {
    try {
      setLoadingBanners(true);
      const res = await axios.get('/api/banners');
      if (res.data.success) {
        setBanners(res.data.data);
      }
    } catch (err) {
      console.error('Error al cargar banners:', err);
    } finally {
      setLoadingBanners(false);
    }
  };

  const fetchSettings = async () => {
    try {
      setLoadingSettings(true);
      const res = await axios.get('/api/settings');
      if (res.data.success) {
        setSettings(res.data.data);
      }
    } catch (err) {
      console.error('Error al cargar configuraciones:', err);
    } finally {
      setLoadingSettings(false);
    }
  };

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      const res = await axios.get('/api/groups');
      if (res.data.success) {
        setGroups(res.data.data);
      }
    } catch (err) {
      console.error('Error al cargar grupos:', err);
    } finally {
      setLoadingGroups(false);
    }
  };

  // --- Handlers de Banners ---
  const handleBannerFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setAlertInfo({ type: 'error', message: 'La imagen excede el límite de 20MB.' });
        return;
      }
      setNewBannerFile(file);
      setBannerPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadBanner = async (e) => {
    e.preventDefault();
    if (!newBannerFile) {
      setAlertInfo({ type: 'error', message: 'Debe seleccionar una imagen para el banner.' });
      return;
    }
    if (!newBannerTitle.trim()) {
      setAlertInfo({ type: 'error', message: 'El título del banner es obligatorio.' });
      return;
    }

    const formData = new FormData();
    formData.append('image', newBannerFile);
    formData.append('title', newBannerTitle.trim());
    formData.append('subtitle', newBannerSubtitle.trim());

    try {
      setUploadingBanner(true);
      const res = await axios.post('/api/banners', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setAlertInfo({ type: 'success', message: '¡Banner agregado al carrusel exitosamente!' });
        setNewBannerTitle('');
        setNewBannerSubtitle('');
        setNewBannerFile(null);
        setBannerPreviewUrl(null);
        fetchBanners();
        if (onSettingsChanged) onSettingsChanged();
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: err.response?.data?.message || 'Error al subir banner.' });
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleToggleBanner = async (bannerId) => {
    try {
      const res = await axios.patch(`/api/banners/${bannerId}/toggle`);
      if (res.data.success) {
        setBanners((prev) =>
          prev.map((b) => (b.id === bannerId ? { ...b, is_active: res.data.data.is_active } : b))
        );
        if (onSettingsChanged) onSettingsChanged();
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'Error al cambiar estado del banner.' });
    }
  };

  const handleDeleteBanner = async (bannerId, bannerTitle) => {
    if (window.confirm(`¿Está seguro de eliminar el banner "${bannerTitle}"?`)) {
      try {
        const res = await axios.delete(`/api/banners/${bannerId}`);
        if (res.data.success) {
          setAlertInfo({ type: 'success', message: 'Banner eliminado correctamente.' });
          setBanners((prev) => prev.filter((b) => b.id !== bannerId));
          if (onSettingsChanged) onSettingsChanged();
        }
      } catch (err) {
        setAlertInfo({ type: 'error', message: 'Error al eliminar banner.' });
      }
    }
  };

  const moveBanner = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const newBanners = [...banners];
    const [moved] = newBanners.splice(index, 1);
    newBanners.splice(targetIndex, 0, moved);

    const updatedWithOrder = newBanners.map((b, idx) => ({
      ...b,
      display_order: idx + 1,
    }));
    setBanners(updatedWithOrder);

    try {
      const orders = updatedWithOrder.map((b) => ({ id: b.id, display_order: b.display_order }));
      await axios.put('/api/banners/order', { orders });
      if (onSettingsChanged) onSettingsChanged();
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'Error al actualizar orden de banners.' });
      fetchBanners();
    }
  };

  // --- Handlers de Configuración General ---
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const res = await axios.put('/api/settings', settings);
      if (res.data.success) {
        if (settings.stage_theme) {
          localStorage.setItem('umg_stage_theme', settings.stage_theme);
        }
        setAlertInfo({ type: 'success', message: '¡Configuraciones del sitio guardadas exitosamente!' });
        if (onSettingsChanged) onSettingsChanged();
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'Error al guardar configuraciones.' });
    } finally {
      setSavingSettings(false);
    }
  };

  // --- Handlers de Grupos ---
  const moveGroup = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= groups.length) return;

    const newGroups = [...groups];
    const [moved] = newGroups.splice(index, 1);
    newGroups.splice(targetIndex, 0, moved);

    const updatedWithOrder = newGroups.map((g, idx) => ({
      ...g,
      presentation_order: idx + 1,
    }));
    setGroups(updatedWithOrder);
  };

  const saveNewGroupOrder = async () => {
    try {
      setSavingGroupOrder(true);
      const orders = groups.map((g, idx) => ({
        id: g.id,
        presentation_order: idx + 1,
      }));
      await axios.put('/api/groups/order', { orders });
      setAlertInfo({ type: 'success', message: '¡Orden de exposiciones guardado correctamente!' });
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'Error al guardar nuevo orden.' });
    } finally {
      setSavingGroupOrder(false);
    }
  };

  const handleGroupStatusChange = async (groupId, newStatus) => {
    try {
      const res = await axios.patch(`/api/groups/${groupId}/status`, { status: newStatus });
      if (res.data.success) {
        setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, status: newStatus } : g)));
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'Error al actualizar estado del grupo.' });
    }
  };

  const handleDeleteGroup = async (groupId, groupName) => {
    if (window.confirm(`¿Está seguro de eliminar el grupo "${groupName}" y todos sus materiales?`)) {
      try {
        const res = await axios.delete(`/api/groups/${groupId}`);
        if (res.data.success) {
          setAlertInfo({ type: 'success', message: 'Grupo eliminado correctamente.' });
          setGroups((prev) => prev.filter((g) => g.id !== groupId));
        }
      } catch (err) {
        setAlertInfo({ type: 'error', message: 'Error al eliminar grupo.' });
      }
    }
  };

  const handleResetStatuses = async () => {
    if (window.confirm('¿Desea reiniciar el estado de todos los grupos a "Pendiente"? Esto iniciará una nueva jornada.')) {
      try {
        const res = await axios.post('/api/admin/reset-status');
        setAlertInfo({ type: 'success', message: res.data.message });
        fetchGroups();
      } catch (err) {
        setAlertInfo({ type: 'error', message: 'Error al reiniciar estados.' });
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F8FAFC', pb: 8 }}>
      {/* Barra Superior con Navegación y Título */}
      {/* Barra Superior de Gestión */}
      <Paper
        elevation={3}
        sx={{
          backgroundColor: '#002B49',
          color: '#fff',
          py: 2,
          px: { xs: 2, md: 4 },
          borderBottom: '3px solid #C5A059',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onBack}
            startIcon={<ArrowBackIcon />}
            sx={{
              borderColor: '#C5A059',
              color: '#C5A059',
              fontWeight: 700,
              borderRadius: 1.5,
              '&:hover': { borderColor: '#fff', color: '#fff' },
            }}
          >
            Volver a la Sala
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              component="img"
              src="/assets/umg-icon.svg"
              alt="Logo UMG"
              sx={{ width: 40, height: 40 }}
            />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '0.5px' }}>
                Módulo de Gestión Integral del Sitio
              </Typography>
              <Typography variant="caption" sx={{ color: '#C5A059', fontWeight: 700 }}>
                Control de Banners, Carrusel, Textos del Seminario, Grupos y Copias de Seguridad
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={import.meta.env.MODE === 'production' ? 'PRODUCCIÓN' : 'DESARROLLO'}
            size="small"
            sx={{
              backgroundColor: import.meta.env.MODE === 'production' ? '#2e7d32' : '#ed6c02',
              color: '#fff',
              fontWeight: 800,
            }}
          />
        </Box>
      </Paper>

      {/* Contenedor Principal */}
      <Container
        maxWidth={false}
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: '96%', lg: '95%', xl: '1800px' },
          px: { xs: 2, sm: 3, md: 4 },
          mt: 3,
          mb: 6,
        }}
      >
        {alertInfo && (
          <Alert
            severity={alertInfo.type}
            onClose={() => setAlertInfo(null)}
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {alertInfo.message}
          </Alert>
        )}

        {/* Pestañas de Navegación de Gestión */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            mb: 3,
            overflow: 'hidden',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid #E2E8F0',
              '& .MuiTab-root': {
                fontWeight: 700,
                fontSize: '0.95rem',
                minHeight: 56,
                textTransform: 'none',
              },
              '& .Mui-selected': {
                color: '#002B49 !important',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#C5A059',
                height: 4,
              },
            }}
          >
            <Tab icon={<ViewCarouselIcon />} iconPosition="start" label="1. Carrusel & Banners Multimedia" />
            <Tab icon={<SettingsIcon />} iconPosition="start" label="2. Textos & Configuración del Seminario" />
            <Tab icon={<GroupsIcon />} iconPosition="start" label="3. Grupos & Materiales de Exposición" />
            <Tab icon={<AssessmentIcon />} iconPosition="start" label="4. Auditoría, Reportes & Respaldos" />
          </Tabs>
        </Paper>

        {/* ======================================================== */}
        {/* PESTAÑA 1: GESTIÓN DE BANNERS Y CARRUSEL */}
        {/* ======================================================== */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {/* Formulario de Subida de Nuevo Banner */}
            <Grid item xs={12} lg={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: '#FFFFFF',
                  height: '100%',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#002B49', mb: 1 }}>
                  Subir Nuevo Banner
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                  Agregue imágenes profesionales en alta resolución (16:9 recomendado) para proyectar en el carrusel principal.
                </Typography>

                <form onSubmit={handleUploadBanner}>
                  <Box
                    sx={{
                      border: '2px dashed #CBD5E1',
                      borderRadius: 3,
                      p: 3,
                      textAlign: 'center',
                      mb: 2,
                      backgroundColor: '#F8FAFC',
                      cursor: 'pointer',
                      '&:hover': { borderColor: '#C5A059', backgroundColor: '#FEF9C3' },
                    }}
                    component="label"
                  >
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleBannerFileSelect}
                    />
                    {bannerPreviewUrl ? (
                      <Box sx={{ position: 'relative' }}>
                        <Box
                          component="img"
                          src={bannerPreviewUrl}
                          alt="Vista previa"
                          sx={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 2 }}
                        />
                        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#16A34A', fontWeight: 700 }}>
                          ✓ Imagen cargada: {newBannerFile?.name}
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ py: 2 }}>
                        <CloudUploadIcon sx={{ fontSize: 44, color: '#64748B', mb: 1 }} />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#002B49' }}>
                          Haga clic o arrastre una imagen aquí
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                          Formatos soportados: JPG, PNG, WEBP (Máx. 20MB)
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <TextField
                    label="Título del Banner *"
                    value={newBannerTitle}
                    onChange={(e) => setNewBannerTitle(e.target.value)}
                    placeholder="Ej. Cátedra de Ciberseguridad e Innovación"
                    fullWidth
                    required
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    label="Subtítulo o Descripción (Opcional)"
                    value={newBannerSubtitle}
                    onChange={(e) => setNewBannerSubtitle(e.target.value)}
                    placeholder="Ej. Auditorio Mayor Campus Villa Nueva • Jornada Vespertina"
                    fullWidth
                    multiline
                    rows={2}
                    sx={{ mb: 3 }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={uploadingBanner || !newBannerFile}
                    startIcon={uploadingBanner ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                    sx={{
                      backgroundColor: '#002B49',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      py: 1.4,
                      borderRadius: 2,
                      '&:hover': { backgroundColor: '#001A2C' },
                    }}
                  >
                    {uploadingBanner ? 'Subiendo Banner...' : 'Subir Banner al Carrusel'}
                  </Button>
                </form>
              </Paper>
            </Grid>

            {/* Listado y Reordenamiento de Banners */}
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 3, borderRadius: 3, backgroundColor: '#FFFFFF' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#002B49' }}>
                      Banners Registrados ({banners.length})
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>
                      Organice el orden secuencial de aparición o pause banners temporales.
                    </Typography>
                  </Box>
                  <Chip
                    label={`${banners.filter((b) => b.is_active === 1).length} Activos en Carrusel`}
                    color="success"
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                </Box>

                {loadingBanners ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress sx={{ color: '#002B49' }} />
                  </Box>
                ) : banners.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="body1" sx={{ color: '#94A3B8' }}>
                      No hay banners registrados aún. Suba uno en el formulario lateral.
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {banners.map((b, index) => (
                      <Grid item xs={12} sm={6} md={6} key={b.id}>
                        <Card
                          elevation={0}
                          sx={{
                            border: '1px solid #E2E8F0',
                            borderRadius: 3,
                            overflow: 'hidden',
                            transition: 'all 200ms ease',
                            opacity: b.is_active === 1 ? 1 : 0.6,
                            '&:hover': {
                              borderColor: '#C5A059',
                              boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                            },
                          }}
                        >
                          <Box sx={{ position: 'relative' }}>
                            <CardMedia
                              component="img"
                              height="160"
                              image={b.image_url}
                              alt={b.title}
                              sx={{ objectFit: 'cover' }}
                            />
                            <Chip
                              label={`Posición #${index + 1}`}
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 8,
                                left: 8,
                                backgroundColor: 'rgba(0, 25, 45, 0.85)',
                                color: '#FFFFFF',
                                fontWeight: 800,
                                fontSize: '0.75rem',
                              }}
                            />
                            <Chip
                              label={b.is_active === 1 ? 'Activo' : 'Oculto'}
                              size="small"
                              color={b.is_active === 1 ? 'success' : 'default'}
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                fontWeight: 700,
                                fontSize: '0.75rem',
                              }}
                            />
                          </Box>

                          <CardContent sx={{ pb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#002B49', lineHeight: 1.2, mb: 0.5 }}>
                              {b.title}
                            </Typography>
                            {b.subtitle && (
                              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.3 }}>
                                {b.subtitle}
                              </Typography>
                            )}
                          </CardContent>

                          <Divider />

                          <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={b.is_active === 1}
                                  onChange={() => handleToggleBanner(b.id)}
                                  size="small"
                                  color="success"
                                />
                              }
                              label={
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                  {b.is_active === 1 ? 'Visible' : 'Oculto'}
                                </Typography>
                              }
                            />

                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Tooltip title="Subir orden">
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={index === 0}
                                    onClick={() => moveBanner(index, 'up')}
                                  >
                                    <ArrowUpwardIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>

                              <Tooltip title="Bajar orden">
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={index === banners.length - 1}
                                    onClick={() => moveBanner(index, 'down')}
                                  >
                                    <ArrowDownwardIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>

                              <Tooltip title="Eliminar banner">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteBanner(b.id, b.title)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* ======================================================== */}
        {/* PESTAÑA 2: TEXTOS Y CONFIGURACIÓN DEL SEMINARIO */}
        {/* ======================================================== */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 4, borderRadius: 3, backgroundColor: '#FFFFFF' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#002B49', mb: 1 }}>
                  Textos Oficiales del Seminario en Tiempo Real
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                  Los cambios que guarde aquí se reflejarán instantáneamente en la pantalla del auditorio sin necesidad de reiniciar la aplicación.
                </Typography>

                <form onSubmit={handleSaveSettings}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Nombre de la Institución"
                        value={settings.institution_name || ''}
                        onChange={(e) => setSettings({ ...settings, institution_name: e.target.value })}
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Campus y Facultad"
                        value={settings.institution_faculty || ''}
                        onChange={(e) => setSettings({ ...settings, institution_faculty: e.target.value })}
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Título Principal del Seminario"
                        value={settings.site_title || ''}
                        onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                        fullWidth
                        required
                        helperText="Se muestra en grande en la cabecera del auditorio"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Subtítulo del Evento"
                        value={settings.site_subtitle || ''}
                        onChange={(e) => setSettings({ ...settings, site_subtitle: e.target.value })}
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Palabras Solemnes de Bienvenida / Discurso de Apertura"
                        value={settings.welcome_words || ''}
                        onChange={(e) => setSettings({ ...settings, welcome_words: e.target.value })}
                        fullWidth
                        multiline
                        rows={4}
                        required
                        helperText="Texto que acompaña al carrusel en la sala principal"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#002B49' }}>
                        Velocidad de Cambio del Carrusel: {(Number(settings.carousel_interval) / 1000) || 5} segundos por diapositiva
                      </Typography>
                      <Slider
                        value={Number(settings.carousel_interval) / 1000 || 5}
                        onChange={(e, val) => setSettings({ ...settings, carousel_interval: String(val * 1000) })}
                        step={1}
                        min={3}
                        max={15}
                        marks={[
                          { value: 3, label: '3s' },
                          { value: 5, label: '5s' },
                          { value: 8, label: '8s' },
                          { value: 12, label: '12s' },
                        ]}
                        sx={{ color: '#C5A059', mt: 1 }}
                      />
                    </Grid>

                    {/* Selector de Paleta Visual: Opción 1 Noche vs Opción 2 Clara */}
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#002B49', mb: 0.5 }}>
                        Paleta Visual del Auditorio (Esquema de Colores)
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 2 }}>
                        Seleccione el esquema de color predeterminado para la pantalla del auditorio. El moderador también puede alternarlo en vivo con el botón de la barra superior.
                      </Typography>

                      <Grid container spacing={2}>
                        {/* Opción 1: Noche Solemne */}
                        <Grid item xs={12} sm={6}>
                          <Paper
                            onClick={() => setSettings({ ...settings, stage_theme: 'dark' })}
                            sx={{
                              p: 2.2,
                              borderRadius: 2.5,
                              cursor: 'pointer',
                              border: settings.stage_theme !== 'light' ? '2.5px solid #C5A059' : '1px solid #CBD5E1',
                              backgroundColor: '#00192D',
                              color: '#FFFFFF',
                              boxShadow: settings.stage_theme !== 'light' ? '0 8px 24px rgba(0, 43, 73, 0.35)' : 'none',
                              position: 'relative',
                              transition: 'all 200ms ease',
                              '&:hover': { transform: 'translateY(-2px)' },
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <DarkModeIcon sx={{ color: '#C5A059', fontSize: 22 }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFFFFF' }}>
                                  Opción 1: Noche Solemne UMG
                                </Typography>
                              </Box>
                              {settings.stage_theme !== 'light' && (
                                <Chip label="ACTIVO" size="small" sx={{ backgroundColor: '#C5A059', color: '#00192D', fontWeight: 900, fontSize: '0.68rem', height: 22 }} />
                              )}
                            </Box>
                            <Typography variant="caption" sx={{ color: '#CBD5E1', display: 'block', mb: 1.5, fontSize: '0.78rem', lineHeight: 1.4 }}>
                              Fondo azul marino profundo (#00192D), acentos dorados (#C5A059) y tipografía blanca de alto contraste. Ideal para salones y auditorios en penumbra.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.8 }}>
                              <Box sx={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#00192D', border: '1px solid #FFFFFF' }} title="Azul Profundo" />
                              <Box sx={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#002B49' }} title="Azul Marino UMG" />
                              <Box sx={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#C5A059' }} title="Oro Institucional" />
                              <Box sx={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#FFFFFF' }} title="Blanco Puro" />
                            </Box>
                          </Paper>
                        </Grid>

                        {/* Opción 2: Clara Ejecutiva (Dorado, Blanco y Azulado) */}
                        <Grid item xs={12} sm={6}>
                          <Paper
                            onClick={() => setSettings({ ...settings, stage_theme: 'light' })}
                            sx={{
                              p: 2.2,
                              borderRadius: 2.5,
                              cursor: 'pointer',
                              border: settings.stage_theme === 'light' ? '2.5px solid #002B49' : '1px solid #CBD5E1',
                              backgroundColor: '#F8FAFC',
                              color: '#00192D',
                              boxShadow: settings.stage_theme === 'light' ? '0 8px 24px rgba(0, 43, 73, 0.18)' : 'none',
                              position: 'relative',
                              transition: 'all 200ms ease',
                              '&:hover': { transform: 'translateY(-2px)' },
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LightModeIcon sx={{ color: '#C5A059', fontSize: 22 }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#002B49' }}>
                                  Opción 2: Clara Ejecutiva
                                </Typography>
                              </Box>
                              {settings.stage_theme === 'light' && (
                                <Chip label="ACTIVO" size="small" sx={{ backgroundColor: '#002B49', color: '#FFFFFF', fontWeight: 900, fontSize: '0.68rem', height: 22 }} />
                              )}
                            </Box>
                            <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 1.5, fontSize: '0.78rem', lineHeight: 1.4 }}>
                              Fondo blanco lino con degradado azulado (#F8FAFC, #EEF6FF), vivos dorados (#C5A059) y tipografía azul marino. Ideal para ambientes luminosos.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.8 }}>
                              <Box sx={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1' }} title="Blanco Nieve" />
                              <Box sx={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#EEF6FF', border: '1px solid #CBD5E1' }} title="Azulado Glaciar" />
                              <Box sx={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#C5A059' }} title="Oro Institucional" />
                              <Box sx={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#002B49' }} title="Azul Marino" />
                            </Box>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={savingSettings}
                        startIcon={savingSettings ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        sx={{
                          backgroundColor: '#002B49',
                          color: '#FFFFFF',
                          fontWeight: 800,
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          '&:hover': { backgroundColor: '#001A2C' },
                        }}
                      >
                        {savingSettings ? 'Guardando...' : 'Guardar Configuración General'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Paper>
            </Grid>

            {/* Vista Previa de la Tarjeta del Discurso */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={4}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background:
                    settings.stage_theme === 'light'
                      ? 'linear-gradient(135deg, #FFFFFF 0%, #EEF6FF 100%)'
                      : 'linear-gradient(135deg, #00192D 0%, #002B49 100%)',
                  color: settings.stage_theme === 'light' ? '#00192D' : '#FFFFFF',
                  border: settings.stage_theme === 'light' ? '2px solid #C5A059' : '1px solid #C5A059',
                  boxShadow:
                    settings.stage_theme === 'light'
                      ? '0 12px 30px rgba(0, 43, 73, 0.12)'
                      : '0 12px 30px rgba(0, 0, 0, 0.4)',
                  transition: 'all 400ms ease',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label="VISTA PREVIA EN PANTALLA"
                    size="small"
                    sx={{ backgroundColor: '#C5A059', color: '#00192D', fontWeight: 800 }}
                  />
                  <Chip
                    size="small"
                    label={settings.stage_theme === 'light' ? '☀️ Paleta Clara' : '🌙 Paleta Noche'}
                    sx={{
                      backgroundColor: settings.stage_theme === 'light' ? '#002B49' : 'rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                    }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: settings.stage_theme === 'light' ? '#78350F' : '#C5A059',
                    fontWeight: 800,
                    letterSpacing: '0.3px',
                  }}
                >
                  {settings.institution_name || 'UNIVERSIDAD MARIANO GÁLVEZ'}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 900,
                    mt: 1,
                    mb: 0.5,
                    color: settings.stage_theme === 'light' ? '#00192D' : '#FFFFFF',
                  }}
                >
                  {settings.site_title || 'Seminario de Graduación 2026'}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: settings.stage_theme === 'light' ? '#0A3656' : '#CBD5E1',
                    mb: 2,
                    fontWeight: 700,
                  }}
                >
                  {settings.site_subtitle}
                </Typography>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    backgroundColor: settings.stage_theme === 'light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.08)',
                    borderRadius: 2,
                    border: settings.stage_theme === 'light' ? '1.5px solid rgba(197, 160, 89, 0.6)' : '1px solid rgba(197, 160, 89, 0.3)',
                    boxShadow: settings.stage_theme === 'light' ? '0 4px 12px rgba(0, 43, 73, 0.05)' : 'none',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: settings.stage_theme === 'light' ? '#1E293B' : '#E2E8F0',
                      fontStyle: 'italic',
                      lineHeight: 1.6,
                    }}
                  >
                    "{settings.welcome_words}"
                  </Typography>
                </Paper>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* ======================================================== */}
        {/* PESTAÑA 3: GESTIÓN DE GRUPOS Y MATERIALES */}
        {/* ======================================================== */}
        {activeTab === 2 && (
          <Paper sx={{ p: 3, borderRadius: 3, backgroundColor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#002B49' }}>
                  Grupos Registrados y Orden Secuencial
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                  Administre los archivos locales (.pptx, .pdf), enlaces en la nube y el turno de cada grupo expositor.
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  onClick={() => setIsRegisterOpen(true)}
                  startIcon={<AddIcon />}
                  sx={{ borderColor: '#002B49', color: '#002B49', fontWeight: 700 }}
                >
                  Registrar Grupo
                </Button>

                <Button
                  variant="contained"
                  onClick={saveNewGroupOrder}
                  disabled={savingGroupOrder || groups.length === 0}
                  startIcon={<SaveIcon />}
                  sx={{
                    backgroundColor: '#D32F2F',
                    color: '#fff',
                    fontWeight: 700,
                    '&:hover': { backgroundColor: '#9A0007' },
                  }}
                >
                  {savingGroupOrder ? 'Guardando...' : 'Guardar Nuevo Orden'}
                </Button>
              </Box>
            </Box>

            {loadingGroups ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress sx={{ color: '#002B49' }} />
              </Box>
            ) : groups.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="body1" sx={{ color: '#94A3B8' }}>
                  No hay grupos registrados todavía. Haga clic en "Registrar Grupo".
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, width: '70px' }}>Orden</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '90px' }}>Grupo</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Proyecto / Tema</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Integrantes</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Material</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '140px' }}>Estado</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, width: '180px' }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groups.map((group, index) => (
                      <TableRow key={group.id} hover>
                        <TableCell>
                          <Box
                            sx={{
                              backgroundColor: '#002B49',
                              color: '#fff',
                              width: 30,
                              height: 30,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.8rem',
                            }}
                          >
                            {index + 1}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#D32F2F' }}>
                          #{group.group_number}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#002B49' }}>
                            {group.group_name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                            {group.topic}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {group.members && group.members.map((m, mIdx) => (
                              <Chip key={mIdx} label={m} size="small" sx={{ fontSize: '0.75rem', backgroundColor: '#EEF2F6' }} />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {group.presentation_type === 'file' ? (
                            <Chip
                              icon={group.original_name?.endsWith('.pdf') ? <PictureAsPdfIcon fontSize="small" /> : <SlideshowIcon fontSize="small" />}
                              label={group.original_name || 'Archivo'}
                              size="small"
                              sx={{ backgroundColor: '#FEF3C7', color: '#92400E', fontWeight: 600, fontSize: '0.75rem' }}
                            />
                          ) : (
                            <Chip
                              icon={<LinkIcon fontSize="small" />}
                              label="Enlace Web"
                              size="small"
                              sx={{ backgroundColor: '#E0F2FE', color: '#0369A1', fontWeight: 600, fontSize: '0.75rem' }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={group.status === 'completed' ? 'Concluido' : group.status === 'presenting' ? 'En Curso' : 'Pendiente'}
                            size="small"
                            color={group.status === 'completed' ? 'success' : group.status === 'presenting' ? 'warning' : 'default'}
                            onClick={() => {
                              const nextStatus = group.status === 'pending' ? 'presenting' : group.status === 'presenting' ? 'completed' : 'pending';
                              handleGroupStatusChange(group.id, nextStatus);
                            }}
                            sx={{ cursor: 'pointer', fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Tooltip title="Subir orden">
                              <span>
                                <IconButton size="small" disabled={index === 0} onClick={() => moveGroup(index, 'up')}>
                                  <ArrowUpwardIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>

                            <Tooltip title="Bajar orden">
                              <span>
                                <IconButton size="small" disabled={index === groups.length - 1} onClick={() => moveGroup(index, 'down')}>
                                  <ArrowDownwardIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>

                            <Tooltip title="Editar información / archivo">
                              <IconButton size="small" color="primary" onClick={() => setGroupToEdit(group)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Eliminar grupo">
                              <IconButton size="small" color="error" onClick={() => handleDeleteGroup(group.id, group.group_name)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        )}

        {/* ======================================================== */}
        {/* PESTAÑA 4: AUDITORÍA, REPORTES Y CONTROL DEL SISTEMA */}
        {/* ======================================================== */}
        {activeTab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 4, borderRadius: 3, backgroundColor: '#FFFFFF', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#002B49', mb: 1 }}>
                  Respaldos y Exportación Académica
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                  Genere copias de seguridad de la base de datos SQLite y descargue las actas en formato compatible con Excel.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Paper
                    elevation={0}
                    sx={{ p: 2.5, border: '1px solid #E2E8F0', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#002B49' }}>
                        Copia de Seguridad en Caliente (SQLite WAL)
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Descarga el archivo binario íntegro de la base de datos con todos los grupos y configuraciones.
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<CloudDownloadIcon />}
                      href="/api/admin/backup"
                      sx={{ backgroundColor: '#002B49', fontWeight: 700 }}
                    >
                      Descargar .sqlite
                    </Button>
                  </Paper>

                  <Paper
                    elevation={0}
                    sx={{ p: 2.5, border: '1px solid #E2E8F0', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#002B49' }}>
                        Reporte de Asistencia y Defensa (CSV)
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Exporta orden, número de grupo, integrantes y estados para el comité examinador.
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<TableViewIcon />}
                      href="/api/admin/report"
                      sx={{ backgroundColor: '#2E7D32', fontWeight: 700, '&:hover': { backgroundColor: '#1B5E20' } }}
                    >
                      Exportar CSV
                    </Button>
                  </Paper>

                  <Paper
                    elevation={0}
                    sx={{ p: 2.5, border: '1px solid #FEE2E2', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#B91C1C' }}>
                        Reiniciar Estados de Exposición
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Regresa todos los grupos a estado 'Pendiente' para iniciar una nueva sesión de seminario.
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<RestartAltIcon />}
                      onClick={handleResetStatuses}
                      sx={{ fontWeight: 700 }}
                    >
                      Reiniciar Estados
                    </Button>
                  </Paper>
                </Box>
              </Paper>
            </Grid>

            {/* Diagnóstico del Servidor */}
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 4, borderRadius: 3, backgroundColor: '#FFFFFF' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#002B49', mb: 2 }}>
                  Diagnóstico y Parámetros del Entorno
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #F1F5F9' }}>
                    <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>Motor de Base de Datos:</Typography>
                    <Chip label="SQLite WAL (Concurrencia)" size="small" color="primary" sx={{ fontWeight: 700 }} />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #F1F5F9' }}>
                    <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>Contenedor Docker:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#002B49' }}>Debian Bookworm Slim</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #F1F5F9' }}>
                    <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>Banners Multimedia:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#002B49' }}>{banners.length} cargados</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #F1F5F9' }}>
                    <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>Grupos de Exposición:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#002B49' }}>{groups.length} registrados</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>Logs Rotativos:</Typography>
                    <Chip label="Winston Daily 14d" size="small" color="success" sx={{ fontWeight: 700 }} />
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>

      {/* Modal de Registro de Nuevo Grupo */}
      <RegistrationModal
        open={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onGroupCreated={(newGroup) => {
          fetchGroups();
          setAlertInfo({ type: 'success', message: `¡Grupo #${newGroup.group_number} registrado correctamente!` });
        }}
      />

      {/* Modal de Edición de Grupo */}
      {groupToEdit && (
        <EditGroupModal
          open={Boolean(groupToEdit)}
          group={groupToEdit}
          onClose={() => setGroupToEdit(null)}
          onGroupUpdated={(updatedGroup) => {
            fetchGroups();
            setAlertInfo({ type: 'success', message: `¡Grupo #${updatedGroup.group_number} actualizado exitosamente!` });
          }}
        />
      )}
    </Box>
  );
};

export default SiteManagement;
