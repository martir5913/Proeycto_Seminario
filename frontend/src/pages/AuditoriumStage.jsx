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
          {/* SECCIÓN PRINCIPAL: CARRUSEL EXPANSIVO */}
          <Box
            sx={{
              flex: { xs: '1 1 100%', lg: '0 0 76%' },
              maxWidth: { xs: '100%', lg: '76%' },
              display: 'flex',
              flexDirection: 'column',
              height: { xs: 'auto', lg: 540 },
            }}
          >
            {/* Barra Superior de Títulos (sin caja de hora) */}
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
                    fontSize: { xs: '1.4rem', sm: '1.75rem', md: '2rem' },
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

              <Chip
                label={`${groups.filter((g) => g.status === 'completed').length} de ${groups.length} Grupos Concluidos`}
                sx={{
                  backgroundColor: isLight ? '#E0F2FE' : 'rgba(197, 160, 89, 0.2)',
                  color: isLight ? '#0369A1' : '#C5A059',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  border: isLight ? '1px solid #BAE6FD' : '1px solid rgba(197, 160, 89, 0.4)',
                }}
              />
            </Box>

            {/* CARRUSEL PROFESIONAL EXPANSIVO (con caja de texto integrada de alta legibilidad) */}
            <Box
              sx={{
                flex: 1,
                borderRadius: 4,
                boxShadow: isLight ? '0 16px 40px rgba(0, 43, 73, 0.15)' : 'none',
                height: { xs: 360, sm: 420, lg: 'calc(100% - 56px)' },
              }}
            >
              <BannerCarousel
                banners={banners}
                interval={Number(settings.carousel_interval) || 5000}
                welcomeWords={settings.welcome_words}
                height="100%"
              />
            </Box>
          </Box>

          {/* PANEL LATERAL: PRÓXIMO EN EL ESTRADO AJUSTADO AL MISMO TAMAÑO DEL CARRUSEL */}
          <Box
            sx={{
              flex: { xs: '1 1 100%', lg: '0 0 24%' },
              maxWidth: { xs: '100%', lg: '24%' },
              display: 'flex',
              flexDirection: 'column',
              height: { xs: 'auto', lg: 540 },
            }}
          >
            <Paper
              elevation={12}
              sx={{
                p: { xs: 2, md: 2.2 },
                borderRadius: 3.5,
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                color: '#00192D',
                border: '1.5px solid #C5A059',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                overflowY: 'auto',
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
                  <Box sx={{ mb: 1.2 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        color: '#002B49',
                        mb: 0.5,
                        lineHeight: 1.25,
                        fontSize: { xs: '1.05rem', md: '1.18rem' },
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
                        fontSize: '0.78rem',
                        mb: 1.2,
                      }}
                    >
                      {currentlySelectedGroup.topic}
                    </Typography>

                    {/* Integrantes en el Estrado */}
                    <Box sx={{ mb: 1.2 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#64748B',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          display: 'block',
                          mb: 0.5,
                          fontSize: '0.68rem',
                        }}
                      >
                        Integrantes que Exponen
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {currentlySelectedGroup.members && currentlySelectedGroup.members.length > 0 ? (
                          currentlySelectedGroup.members.map((m, idx) => (
                            <Chip
                              key={idx}
                              size="small"
                              icon={<PersonIcon sx={{ fontSize: '13px !important', color: '#002B49 !important' }} />}
                              label={m}
                              sx={{
                                backgroundColor: '#EEF2F6',
                                color: '#002B49',
                                fontWeight: 600,
                                fontSize: '0.72rem',
                                height: 22,
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        size="small"
                        icon={
                          currentlySelectedGroup.presentation_type === 'file' ? (
                            currentlySelectedGroup.original_name?.endsWith('.pdf') ? (
                              <PictureAsPdfIcon sx={{ fontSize: '14px !important' }} />
                            ) : (
                              <SlideshowIcon sx={{ fontSize: '14px !important' }} />
                            )
                          ) : (
                            <LinkIcon sx={{ fontSize: '14px !important' }} />
                          )
                        }
                        label={
                          currentlySelectedGroup.presentation_type === 'file'
                            ? (currentlySelectedGroup.original_name || 'Archivo')
                            : 'Presentación Web'
                        }
                        variant="outlined"
                        sx={{ fontWeight: 600, borderColor: '#CBD5E1', color: '#334155', height: 24, fontSize: '0.72rem' }}
                      />
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.74rem' }}>
                        {currentlySelectedGroup.duration_minutes || 15} min
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1.2 }} />

                  {/* Selector Dinámico de Grupos a Ancho Completo */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#64748B',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontSize: '0.72rem',
                      }}
                    >
                      Seleccionar Grupo a Exponer ({groups.length}):
                    </Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.8,
                        width: '100%',
                      }}
                    >
                      {groups.map((g) => {
                        const isSelected = g.id === currentlySelectedGroup?.id;
                        const isCompleted = g.status === 'completed';
                        return (
                          <Button
                            key={g.id}
                            fullWidth
                            variant={isSelected ? 'contained' : 'outlined'}
                            onClick={() => setSelectedGroupId(g.id)}
                            sx={{
                              py: 1,
                              px: 2,
                              width: '100%',
                              borderRadius: 2.5,
                              fontWeight: 800,
                              fontSize: '0.9rem',
                              textTransform: 'none',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              backgroundColor: isSelected ? '#C5A059' : '#F8FAFC',
                              color: isSelected ? '#00192D' : '#002B49',
                              borderColor: isSelected ? '#C5A059' : '#CBD5E1',
                              boxShadow: isSelected ? '0 4px 12px rgba(197, 160, 89, 0.4)' : 'none',
                              transition: 'all 200ms ease',
                              '&:hover': {
                                backgroundColor: isSelected ? '#B38F48' : '#FEF9C3',
                                borderColor: '#C5A059',
                              },
                            }}
                          >
                            <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>
                              Grupo #{g.group_number}
                            </Typography>
                            {isCompleted ? (
                              <Chip
                                label="Concluido ✓"
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  backgroundColor: isSelected ? 'rgba(0, 25, 45, 0.15)' : '#DCFCE7',
                                  color: isSelected ? '#00192D' : '#166534',
                                }}
                              />
                            ) : isSelected ? (
                              <Chip
                                label="En Turno"
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  backgroundColor: '#00192D',
                                  color: '#FFFFFF',
                                }}
                              />
                            ) : null}
                          </Button>
                        );
                      })}
                    </Box>

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
                        mt: 0.5,
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

      {/* Pie de Página Solemne (sin texto de 'ORDEN DE EXPOSICIÓN:') */}
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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="caption" sx={{ color: isLight ? '#0369A1' : '#C5A059', fontWeight: 700 }}>
            {settings.institution_faculty || 'Campus Villa Nueva • Facultad de Ingeniería en Sistemas'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AuditoriumStage;
