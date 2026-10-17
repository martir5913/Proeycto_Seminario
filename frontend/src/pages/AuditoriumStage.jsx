import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  IconButton,
  Divider,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import LinkIcon from '@mui/icons-material/Link';
import NetworkStatusBadge from '../components/NetworkStatusBadge';
import BannerCarousel from '../components/BannerCarousel';
import axios from 'axios';

export const AuditoriumStage = ({
  groups,
  onStartPresentation,
  onOpenCatalog,
  onOpenAdmin,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [banners, setBanners] = useState([]);
  const [settings, setSettings] = useState({
    site_title: 'Seminario de Graduación 2026',
    site_subtitle: 'Jornada de Presentación y Defensa de Proyectos de Grado',
    institution_name: 'UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA',
    institution_faculty: 'Campus Villa Nueva • Facultad de Ingeniería en Sistemas',
    welcome_words: 'Bienvenidos estimadas autoridades académicas, catedráticos examinadores, estudiantes y apreciable audiencia.',
    carousel_interval: '5000',
  });

  // Cargar banners y configuraciones en vivo
  const loadStageData = async () => {
    try {
      const [resBanners, resSettings] = await Promise.all([
        axios.get('/api/banners?active=true'),
        axios.get('/api/settings'),
      ]);
      if (resBanners.data.success) {
        setBanners(resBanners.data.data);
      }
      if (resSettings.data.success) {
        setSettings(resSettings.data.data);
      }
    } catch (err) {
      console.warn('Error al cargar datos dinámicos del auditorio:', err.message);
    }
  };

  useEffect(() => {
    loadStageData();
  }, []);

  // Actualizar reloj cada segundo
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Determinar el grupo en turno: el primer grupo con estado 'presenting' o 'pending'
  const activeOrNextGroup =
    groups.find((g) => g.status === 'presenting') ||
    groups.find((g) => g.status === 'pending') ||
    groups[0];

  // Sincronizar el grupo seleccionado en el selector del moderador
  useEffect(() => {
    if (activeOrNextGroup && !selectedGroupId) {
      setSelectedGroupId(activeOrNextGroup.id);
    }
  }, [activeOrNextGroup, selectedGroupId]);

  const currentlySelectedGroup =
    groups.find((g) => g.id === selectedGroupId) || activeOrNextGroup;

  const formatTimeString = (date) => {
    return date.toLocaleTimeString('es-GT', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDateString = (date) => {
    return date.toLocaleDateString('es-GT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #00192D 0%, #002B49 50%, #0A3656 100%)',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Barra Superior Discreta de Navegación del Moderador */}
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(197, 160, 89, 0.25)',
          backgroundColor: 'rgba(0, 25, 45, 0.6)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            component="img"
            src="/assets/umg-icon.svg"
            alt="Escudo UMG"
            sx={{ width: 44, height: 44 }}
          />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: '1px', lineHeight: 1.1 }}>
              {settings.institution_name || 'UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#C5A059', fontWeight: 600 }}>
              {settings.institution_faculty || 'Campus Villa Nueva • Facultad de Ingeniería en Sistemas'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NetworkStatusBadge />

          <Button
            variant="outlined"
            size="small"
            onClick={onOpenCatalog}
            startIcon={<ViewModuleIcon />}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.4)',
              color: '#FFFFFF',
              fontWeight: 600,
              '&:hover': { borderColor: '#C5A059', color: '#C5A059' },
            }}
          >
            Catálogo de Grupos
          </Button>

          <Button
            variant="contained"
            size="small"
            onClick={onOpenAdmin}
            startIcon={<AdminPanelSettingsIcon />}
            sx={{
              backgroundColor: '#C5A059',
              color: '#00192D',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(197, 160, 89, 0.35)',
              '&:hover': { backgroundColor: '#DEB869', color: '#00192D' },
            }}
          >
            Gestión del Sitio
          </Button>
        </Box>
      </Box>

      {/* Contenido Central para la Audiencia del Auditorio */}
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 }, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Grid container spacing={4} alignItems="center">
          {/* Columna Izquierda: Carrusel Profesional, Títulos y Palabras del Seminario */}
          <Grid item xs={12} lg={6}>
            <Box sx={{ pr: { lg: 2 } }}>
              {/* Fecha y Hora en Vivo */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Chip
                  icon={<AccessTimeIcon sx={{ color: '#00192D !important' }} />}
                  label={formatTimeString(currentTime)}
                  sx={{
                    backgroundColor: '#C5A059',
                    color: '#00192D',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    py: 1.8,
                    px: 1,
                  }}
                />
                <Typography variant="body2" sx={{ color: '#CBD5E1', textTransform: 'capitalize', fontWeight: 500 }}>
                  {formatDateString(currentTime)}
                </Typography>
              </Box>

              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '1.8rem', md: '2.5rem' },
                  lineHeight: 1.15,
                  mb: 0.5,
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 60%, #C5A059 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {settings.site_title || 'Seminario de Graduación 2026'}
              </Typography>

              <Typography
                variant="subtitle1"
                sx={{
                  color: '#C5A059',
                  fontWeight: 600,
                  mb: 2.5,
                  letterSpacing: '0.5px',
                }}
              >
                {settings.site_subtitle || 'Jornada de Presentación y Defensa de Proyectos de Grado'}
              </Typography>

              {/* CARRUSEL PROFESIONAL CON SUAVIZADO DE IMÁGENES */}
              <Box sx={{ mb: 2.5 }}>
                <BannerCarousel
                  banners={banners}
                  interval={Number(settings.carousel_interval) || 5000}
                  height={{ xs: 220, sm: 280, md: 320 }}
                />
              </Box>

              {/* Palabras Solemnes de Apertura */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: 3,
                  border: '1px solid rgba(197, 160, 89, 0.25)',
                  mb: 2,
                }}
              >
                <Typography variant="body2" sx={{ color: '#E2E8F0', fontStyle: 'italic', lineHeight: 1.6 }}>
                  "{settings.welcome_words}"
                </Typography>
              </Paper>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, color: '#94A3B8' }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Total de Grupos: <strong>{groups.length}</strong>
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Concluidos: <strong>{groups.filter((g) => g.status === 'completed').length}</strong>
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Pendientes: <strong>{groups.filter((g) => g.status !== 'completed').length}</strong>
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Columna Derecha: Tarjeta del Grupo en Turno y Lanzador Directo */}
          <Grid item xs={12} lg={6}>
            <Paper
              elevation={16}
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                color: '#00192D',
                border: '2px solid #C5A059',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
                position: 'relative',
              }}
            >
              {/* Etiqueta de Estado de Turno */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Chip
                  label="PROXIMO EN EL ESTRADO"
                  sx={{
                    background: 'linear-gradient(135deg, #C5A059 0%, #9A7B38 100%)',
                    color: '#00192D',
                    fontWeight: 900,
                    fontSize: '0.8rem',
                    letterSpacing: '1px',
                  }}
                />

                {currentlySelectedGroup && (
                  <Box
                    sx={{
                      backgroundColor: '#D32F2F',
                      color: '#FFFFFF',
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      fontWeight: 900,
                      fontSize: '1rem',
                    }}
                  >
                    GRUPO #{currentlySelectedGroup.group_number}
                  </Box>
                )}
              </Box>

              {currentlySelectedGroup ? (
                <>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#002B49', mb: 1, lineHeight: 1.2 }}>
                    {currentlySelectedGroup.group_name}
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      color: '#854D0E',
                      backgroundColor: '#FEF9C3',
                      display: 'inline-block',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1.5,
                      fontWeight: 700,
                      fontSize: '1rem',
                      mb: 3,
                    }}
                  >
                    {currentlySelectedGroup.topic}
                  </Typography>

                  {/* Integrantes en el Estrado */}
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#64748B',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        display: 'block',
                        mb: 1,
                      }}
                    >
                      Integrantes que Exponen
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {currentlySelectedGroup.members && currentlySelectedGroup.members.length > 0 ? (
                        currentlySelectedGroup.members.map((m, idx) => (
                          <Chip
                            key={idx}
                            icon={<PersonIcon fontSize="small" sx={{ color: '#002B49 !important' }} />}
                            label={m}
                            sx={{
                              backgroundColor: '#EEF2F6',
                              color: '#002B49',
                              fontWeight: 600,
                              fontSize: '0.9rem',
                              py: 2,
                            }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                          Sin integrantes listados
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Detalles de la Presentación */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Chip
                      icon={
                        currentlySelectedGroup.presentation_type === 'file' ? (
                          currentlySelectedGroup.original_name?.endsWith('.pdf') ? (
                            <PictureAsPdfIcon fontSize="small" />
                          ) : (
                            <SlideshowIcon fontSize="small" />
                          )
                        ) : (
                          <LinkIcon fontSize="small" />
                        )
                      }
                      label={
                        currentlySelectedGroup.presentation_type === 'file'
                          ? `Archivo: ${currentlySelectedGroup.original_name || 'Presentación'}`
                          : 'Presentación en Nube (Canva/Google Slides)'
                      }
                      variant="outlined"
                      sx={{ fontWeight: 600, borderColor: '#CBD5E1', color: '#334155' }}
                    />
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                      Tiempo: {currentlySelectedGroup.duration_minutes || 15} minutos
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  {/* Controles para el Encargado de Sala / Catedrático Moderador */}
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 200, flex: 1 }}>
                      <InputLabel id="select-group-label">Cambiar Grupo a Proyectar</InputLabel>
                      <Select
                        labelId="select-group-label"
                        value={selectedGroupId}
                        label="Cambiar Grupo a Proyectar"
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                      >
                        {groups.map((g) => (
                          <MenuItem key={g.id} value={g.id}>
                            Grupo #{g.group_number}: {g.group_name} {g.status === 'completed' ? '✓' : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* BOTÓN PRINCIPAL DE LANZAMIENTO */}
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PlayArrowIcon sx={{ fontSize: '28px !important' }} />}
                      onClick={() => onStartPresentation(currentlySelectedGroup)}
                      sx={{
                        background: 'linear-gradient(135deg, #D32F2F 0%, #9A0007 100%)',
                        color: '#FFFFFF',
                        fontWeight: 900,
                        fontSize: '1.1rem',
                        px: 4,
                        py: 1.4,
                        borderRadius: 3,
                        boxShadow: '0 8px 24px rgba(211, 47, 47, 0.4)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #EF5350 0%, #D32F2F 100%)',
                          boxShadow: '0 10px 28px rgba(211, 47, 47, 0.6)',
                        },
                      }}
                    >
                      INICIAR EXPOSICIÓN
                    </Button>
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" sx={{ color: '#64748B' }}>
                    No hay grupos registrados todavía.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Pie de Página Solemne con Próximos Grupos en Agenda */}
      <Box
        sx={{
          py: 2,
          px: { xs: 2, md: 4 },
          backgroundColor: 'rgba(0, 15, 30, 0.85)',
          borderTop: '1px solid rgba(197, 160, 89, 0.25)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
          Universidad Mariano Gálvez de Guatemala • Sistema Centralizado de Proyección de Seminario de Graduación
        </Typography>

        {/* Mini lista de próximos grupos para que los estudiantes vean cuándo les toca */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflowX: 'auto', maxWidth: '100%' }}>
          <Typography variant="caption" sx={{ color: '#C5A059', fontWeight: 700, mr: 1, whiteSpace: 'nowrap' }}>
            ORDEN DE EXPOSICIÓN:
          </Typography>
          {groups.slice(0, 5).map((g, idx) => (
            <Chip
              key={g.id}
              label={`#${g.group_number} ${g.group_name}`}
              size="small"
              onClick={() => setSelectedGroupId(g.id)}
              clickable
              sx={{
                backgroundColor:
                  g.id === currentlySelectedGroup?.id
                    ? '#C5A059'
                    : g.status === 'completed'
                    ? 'rgba(46, 125, 50, 0.3)'
                    : 'rgba(255, 255, 255, 0.08)',
                color: g.id === currentlySelectedGroup?.id ? '#00192D' : '#E2E8F0',
                fontWeight: g.id === currentlySelectedGroup?.id ? 800 : 500,
                fontSize: '0.75rem',
              }}
            />
          ))}
          {groups.length > 5 && (
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              +{groups.length - 5} más
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AuditoriumStage;
