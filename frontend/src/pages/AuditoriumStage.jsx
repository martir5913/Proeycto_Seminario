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
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import PaletteIcon from '@mui/icons-material/Palette';
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
  const [themePalette, setThemePalette] = useState(() => {
    return localStorage.getItem('umg_stage_theme') || 'dark';
  });
  const [settings, setSettings] = useState({
    site_title: 'Seminario de Graduación 2026',
    site_subtitle: 'Jornada de Presentación y Defensa de Proyectos de Grado',
    institution_name: 'UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA',
    institution_faculty: 'Campus Villa Nueva • Facultad de Ingeniería en Sistemas',
    welcome_words: 'Bienvenidos estimadas autoridades académicas, catedráticos examinadores, estudiantes y apreciable audiencia.',
    carousel_interval: '5000',
    stage_theme: 'dark',
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
        if (resSettings.data.data.stage_theme && !localStorage.getItem('umg_stage_theme')) {
          setThemePalette(resSettings.data.data.stage_theme);
        }
      }
    } catch (err) {
      console.warn('Error al cargar datos dinámicos del auditorio:', err.message);
    }
  };

  useEffect(() => {
    loadStageData();
  }, []);

  // Alternar entre Paleta 1 (Noche UMG) y Paleta 2 (Clara: Dorado, Blanco y Azulado)
  const handleToggleTheme = async () => {
    const nextTheme = themePalette === 'dark' ? 'light' : 'dark';
    setThemePalette(nextTheme);
    localStorage.setItem('umg_stage_theme', nextTheme);
    try {
      await axios.put('/api/settings', { stage_theme: nextTheme });
    } catch (e) {
      // guardado silencioso
    }
  };

  const isLight = themePalette === 'light';

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
        background: isLight
          ? 'linear-gradient(135deg, #F8FAFC 0%, #EEF6FF 45%, #E2E8F0 100%)'
          : 'linear-gradient(135deg, #00192D 0%, #002B49 50%, #0A3656 100%)',
        color: isLight ? '#00192D' : '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflowX: 'hidden',
        transition: 'background 500ms ease, color 500ms ease',
      }}
    >
      {/* Barra Superior Discreta de Navegación del Moderador */}
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: 1.8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: isLight ? '2px solid #C5A059' : '1px solid rgba(197, 160, 89, 0.25)',
          backgroundColor: isLight ? 'rgba(255, 255, 255, 0.94)' : 'rgba(0, 25, 45, 0.6)',
          backdropFilter: 'blur(12px)',
          boxShadow: isLight ? '0 4px 20px rgba(0, 43, 73, 0.06)' : 'none',
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
            <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: '1px', lineHeight: 1.1, color: isLight ? '#002B49' : '#FFFFFF' }}>
              {settings.institution_name || 'UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA'}
            </Typography>
            <Typography variant="caption" sx={{ color: isLight ? '#926F22' : '#C5A059', fontWeight: 700 }}>
              {settings.institution_faculty || 'Campus Villa Nueva • Facultad de Ingeniería en Sistemas'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
          <NetworkStatusBadge />

          {/* Selector de Paleta Visual: Opción 1 (Noche) vs Opción 2 (Clara: Dorado, Blanco y Azulado) */}
          <Tooltip title={isLight ? 'Cambiar a Paleta 1: Noche UMG (Azul Profundo y Dorado)' : 'Cambiar a Paleta 2: Clara (Dorado, Blanco y Azulado)'}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleToggleTheme}
              startIcon={isLight ? <DarkModeIcon sx={{ color: '#002B49' }} /> : <LightModeIcon sx={{ color: '#C5A059' }} />}
              sx={{
                borderColor: isLight ? 'rgba(0, 43, 73, 0.35)' : 'rgba(197, 160, 89, 0.6)',
                color: isLight ? '#002B49' : '#C5A059',
                fontWeight: 700,
                backgroundColor: isLight ? 'rgba(0, 43, 73, 0.04)' : 'rgba(0, 25, 45, 0.4)',
                '&:hover': {
                  borderColor: '#C5A059',
                  backgroundColor: isLight ? '#FEF9C3' : 'rgba(197, 160, 89, 0.2)',
                },
              }}
            >
              {isLight ? '☀️ Paleta Clara' : '🌙 Paleta Noche'}
            </Button>
          </Tooltip>

          <Button
            variant="outlined"
            size="small"
            onClick={onOpenCatalog}
            startIcon={<ViewModuleIcon />}
            sx={{
              borderColor: isLight ? 'rgba(0, 43, 73, 0.35)' : 'rgba(255, 255, 255, 0.4)',
              color: isLight ? '#002B49' : '#FFFFFF',
              fontWeight: 700,
              '&:hover': { borderColor: '#C5A059', color: '#C5A059' },
            }}
          >
            Catálogo
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
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 }, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: 2.5,
            alignItems: 'stretch',
            width: '100%',
          }}
        >
          {/* SECCIÓN PRINCIPAL: CARRUSEL AL 80% DE AMPLITUD */}
          <Box
            sx={{
              flex: { xs: '1 1 100%', lg: '0 0 78%' },
              maxWidth: { xs: '100%', lg: '78%' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Barra Superior de Títulos y Reloj en Vivo */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1.5,
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Box>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.1rem' },
                    lineHeight: 1.15,
                    background: isLight
                      ? 'linear-gradient(135deg, #002B49 0%, #0A3656 60%, #926F22 100%)'
                      : 'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 60%, #C5A059 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {settings.site_title || 'Seminario de Graduación 2026'}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color: isLight ? '#0369A1' : '#C5A059',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    display: 'block',
                    fontSize: '0.85rem',
                  }}
                >
                  {settings.site_subtitle || 'Jornada de Presentación y Defensa de Proyectos de Grado'}
                </Typography>
              </Box>

              {/* Fecha y Hora en Vivo */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Chip
                  icon={<AccessTimeIcon sx={{ color: '#00192D !important' }} />}
                  label={formatTimeString(currentTime)}
                  sx={{
                    backgroundColor: '#C5A059',
                    color: '#00192D',
                    fontWeight: 900,
                    fontSize: '0.9rem',
                    py: 1.6,
                    px: 0.5,
                  }}
                />
                <Typography variant="caption" sx={{ color: isLight ? '#475569' : '#CBD5E1', textTransform: 'capitalize', fontWeight: 600 }}>
                  {formatDateString(currentTime)}
                </Typography>
              </Box>
            </Box>

            {/* CARRUSEL PROFESIONAL EXPANSIVO (80% DEL ESPACIO) */}
            <Box
              sx={{
                flex: 1,
                mb: 1.5,
                minHeight: { xs: 260, sm: 360, md: 420, lg: 450 },
                borderRadius: 4,
                boxShadow: isLight ? '0 16px 40px rgba(0, 43, 73, 0.15)' : 'none',
              }}
            >
              <BannerCarousel
                banners={banners}
                interval={Number(settings.carousel_interval) || 5000}
                height={{ xs: 260, sm: 360, md: 420, lg: 450 }}
              />
            </Box>

            {/* Barra Inferior con Palabras de Apertura y Contadores */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.2,
                  px: 2,
                  backgroundColor: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: 2.5,
                  border: isLight ? '1.5px solid rgba(197, 160, 89, 0.6)' : '1px solid rgba(197, 160, 89, 0.25)',
                  boxShadow: isLight ? '0 4px 16px rgba(0, 43, 73, 0.05)' : 'none',
                  flex: 1,
                }}
              >
                <Typography variant="body2" sx={{ color: isLight ? '#1E293B' : '#E2E8F0', fontStyle: 'italic', lineHeight: 1.45, fontSize: '0.82rem' }}>
                  "{settings.welcome_words}"
                </Typography>
              </Paper>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: isLight ? '#475569' : '#94A3B8', whiteSpace: 'nowrap' }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Total: <strong style={{ color: isLight ? '#002B49' : '#FFFFFF' }}>{groups.length}</strong>
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Concluidos: <strong style={{ color: isLight ? '#002B49' : '#FFFFFF' }}>{groups.filter((g) => g.status === 'completed').length}</strong>
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Pendientes: <strong style={{ color: isLight ? '#002B49' : '#FFFFFF' }}>{groups.filter((g) => g.status !== 'completed').length}</strong>
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* PANEL LATERAL COMPACTO AL 20%: PRÓXIMO EN EL ESTRADO */}
          <Box
            sx={{
              flex: { xs: '1 1 100%', lg: '0 0 22%' },
              maxWidth: { xs: '100%', lg: '22%' },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Paper
              elevation={12}
              sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: 3.5,
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                color: '#00192D',
                border: '1.5px solid #C5A059',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
              }}
            >
              {/* Etiqueta de Estado de Turno y No. Grupo */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Chip
                  size="small"
                  label="PRÓXIMO EN ESTRADO"
                  sx={{
                    background: 'linear-gradient(135deg, #C5A059 0%, #9A7B38 100%)',
                    color: '#00192D',
                    fontWeight: 900,
                    fontSize: '0.7rem',
                    letterSpacing: '0.8px',
                    height: 24,
                  }}
                />

                {currentlySelectedGroup && (
                  <Chip
                    size="small"
                    label={`GRUPO #${currentlySelectedGroup.group_number}`}
                    sx={{
                      backgroundColor: '#D32F2F',
                      color: '#FFFFFF',
                      fontWeight: 900,
                      fontSize: '0.78rem',
                      height: 24,
                    }}
                  />
                )}
              </Box>

              {currentlySelectedGroup ? (
                <>
                  <Box sx={{ mb: 1.5 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        color: '#002B49',
                        mb: 0.5,
                        lineHeight: 1.25,
                        fontSize: { xs: '1.1rem', md: '1.25rem' },
                      }}
                    >
                      {currentlySelectedGroup.group_name}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: '#854D0E',
                        backgroundColor: '#FEF9C3',
                        display: 'inline-block',
                        px: 1,
                        py: 0.3,
                        borderRadius: 1.5,
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        mb: 1.5,
                      }}
                    >
                      {currentlySelectedGroup.topic}
                    </Typography>

                    {/* Integrantes en el Estrado */}
                    <Box sx={{ mb: 1.5 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#64748B',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          display: 'block',
                          mb: 0.5,
                          fontSize: '0.7rem',
                        }}
                      >
                        Integrantes que Exponen
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                        {currentlySelectedGroup.members && currentlySelectedGroup.members.length > 0 ? (
                          currentlySelectedGroup.members.map((m, idx) => (
                            <Chip
                              key={idx}
                              size="small"
                              icon={<PersonIcon sx={{ fontSize: '14px !important', color: '#002B49 !important' }} />}
                              label={m}
                              sx={{
                                backgroundColor: '#EEF2F6',
                                color: '#002B49',
                                fontWeight: 600,
                                fontSize: '0.76rem',
                                height: 24,
                              }}
                            />
                          ))
                        ) : (
                          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                            Sin integrantes listados
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Detalles de la Presentación */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                      <Chip
                        size="small"
                        icon={
                          currentlySelectedGroup.presentation_type === 'file' ? (
                            currentlySelectedGroup.original_name?.endsWith('.pdf') ? (
                              <PictureAsPdfIcon sx={{ fontSize: '15px !important' }} />
                            ) : (
                              <SlideshowIcon sx={{ fontSize: '15px !important' }} />
                            )
                          ) : (
                            <LinkIcon sx={{ fontSize: '15px !important' }} />
                          )
                        }
                        label={
                          currentlySelectedGroup.presentation_type === 'file'
                            ? (currentlySelectedGroup.original_name || 'Archivo')
                            : 'Presentación Web'
                        }
                        variant="outlined"
                        sx={{ fontWeight: 600, borderColor: '#CBD5E1', color: '#334155', height: 26, fontSize: '0.76rem' }}
                      />
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.76rem' }}>
                        Duración: {currentlySelectedGroup.duration_minutes || 15} minutos
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Controles para el Encargado de Sala / Catedrático Moderador */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                    <FormControl size="small" fullWidth>
                      <InputLabel id="select-group-label" sx={{ fontSize: '0.82rem' }}>Cambiar Grupo</InputLabel>
                      <Select
                        labelId="select-group-label"
                        value={selectedGroupId}
                        label="Cambiar Grupo"
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        sx={{ fontSize: '0.82rem' }}
                      >
                        {groups.map((g) => (
                          <MenuItem key={g.id} value={g.id} sx={{ fontSize: '0.82rem' }}>
                            #{g.group_number}: {g.group_name} {g.status === 'completed' ? '✓' : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* BOTÓN PRINCIPAL DE LANZAMIENTO */}
                    <Button
                      variant="contained"
                      fullWidth
                      size="medium"
                      startIcon={<PlayArrowIcon sx={{ fontSize: '22px !important' }} />}
                      onClick={() => onStartPresentation(currentlySelectedGroup)}
                      sx={{
                        background: 'linear-gradient(135deg, #D32F2F 0%, #9A0007 100%)',
                        color: '#FFFFFF',
                        fontWeight: 900,
                        fontSize: '0.92rem',
                        py: 1.1,
                        borderRadius: 2.5,
                        boxShadow: '0 4px 16px rgba(211, 47, 47, 0.35)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #EF5350 0%, #D32F2F 100%)',
                          boxShadow: '0 6px 20px rgba(211, 47, 47, 0.5)',
                        },
                      }}
                    >
                      INICIAR EXPOSICIÓN
                    </Button>
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                    No hay grupos registrados todavía.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </Container>

      {/* Pie de Página Solemne con Próximos Grupos en Agenda */}
      <Box
        sx={{
          py: 2,
          px: { xs: 2, md: 4 },
          backgroundColor: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 15, 30, 0.85)',
          borderTop: isLight ? '2px solid #C5A059' : '1px solid rgba(197, 160, 89, 0.25)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          transition: 'all 500ms ease',
        }}
      >
        <Typography variant="caption" sx={{ color: isLight ? '#475569' : '#94A3B8' }}>
          Universidad Mariano Gálvez de Guatemala • Sistema Centralizado de Proyección de Seminario de Graduación
        </Typography>

        {/* Mini lista de próximos grupos para que los estudiantes vean cuándo les toca */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflowX: 'auto', maxWidth: '100%' }}>
          <Typography variant="caption" sx={{ color: isLight ? '#926F22' : '#C5A059', fontWeight: 800, mr: 1, whiteSpace: 'nowrap' }}>
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
                    ? (isLight ? '#DCFCE7' : 'rgba(46, 125, 50, 0.3)')
                    : (isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.08)'),
                color:
                  g.id === currentlySelectedGroup?.id
                    ? '#00192D'
                    : g.status === 'completed'
                    ? (isLight ? '#166534' : '#86EFAC')
                    : (isLight ? '#002B49' : '#E2E8F0'),
                border: isLight ? '1px solid rgba(0, 43, 73, 0.15)' : 'none',
                fontWeight: g.id === currentlySelectedGroup?.id ? 800 : 600,
                fontSize: '0.75rem',
                transition: 'all 200ms ease',
                '&:hover': {
                  backgroundColor: '#C5A059',
                  color: '#00192D',
                },
              }}
            />
          ))}
          {groups.length > 5 && (
            <Typography variant="caption" sx={{ color: isLight ? '#64748B' : '#94A3B8', fontWeight: 600 }}>
              +{groups.length - 5} más
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AuditoriumStage;
