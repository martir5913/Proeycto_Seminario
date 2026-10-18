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

  // Helper para verificar si un grupo tiene material disponible para proyectar
  const hasGroupMaterial = (grp) => {
    if (!grp) return false;
    if (grp.presentation_type === 'file') {
      return Boolean(grp.file_path || grp.original_name);
    }
    if (grp.presentation_type === 'link') {
      return Boolean(grp.external_url && grp.external_url.trim().length > 0);
    }
    return false;
  };

  // Lista ordenada de los grupos registrados en el sistema
  const sortedGroups = [...groups].sort((a, b) => {
    if (a.presentation_order !== b.presentation_order) {
      return (Number(a.presentation_order) || 0) - (Number(b.presentation_order) || 0);
    }
    return (Number(a.group_number) || 0) - (Number(b.group_number) || 0);
  });

  // Determinar grupo por defecto: primer grupo con material disponible o el primer grupo registrado
  const defaultGroup =
    sortedGroups.find((g) => g.status === 'presenting' && hasGroupMaterial(g)) ||
    sortedGroups.find((g) => hasGroupMaterial(g)) ||
    sortedGroups[0];

  // Sincronizar el grupo seleccionado en el selector del moderador
  useEffect(() => {
    if (defaultGroup && (!selectedGroupId || !groups.some((g) => g.id === selectedGroupId))) {
      setSelectedGroupId(defaultGroup.id);
    }
  }, [defaultGroup, selectedGroupId, groups]);

  const currentlySelectedGroup =
    groups.find((g) => g.id === selectedGroupId) || defaultGroup;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        height: { xs: 'auto', md: '100vh' },
        maxHeight: { xs: 'none', md: '100vh' },
        background: isLight
          ? 'linear-gradient(135deg, #E2E8F0 0%, #D8E2ED 50%, #CAD6E2 100%)'
          : 'linear-gradient(135deg, #00192D 0%, #002B49 50%, #0A3656 100%)',
        color: isLight ? '#00192D' : '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflowX: 'hidden',
        overflowY: { xs: 'auto', md: 'hidden' },
        '@media (max-height: 560px)': {
          height: 'auto !important',
          maxHeight: 'none !important',
          overflowY: 'auto !important',
        },
        transition: 'background 500ms ease, color 500ms ease',
      }}
    >
      {/* Barra Superior Discreta de Navegación del Moderador */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 0.8,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: isLight ? '2px solid #C5A059' : '1px solid rgba(197, 160, 89, 0.25)',
          backgroundColor: isLight ? 'rgba(230, 238, 246, 0.95)' : 'rgba(0, 25, 45, 0.6)',
          backdropFilter: 'blur(12px)',
          boxShadow: isLight ? '0 4px 20px rgba(0, 43, 73, 0.08)' : 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src="/assets/logo.umg.webp"
            alt="Logo UMG"
            sx={{
              width: { xs: 40, md: 46 },
              height: { xs: 40, md: 46 },
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))',
            }}
          />
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 900,
                letterSpacing: '0.6px',
                lineHeight: 1.15,
                fontSize: { xs: '0.92rem', md: '1.05rem' },
                color: isLight ? '#00192D' : '#FFFFFF',
              }}
            >
              {settings.institution_name || 'UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: isLight ? '#78350F' : '#C5A059',
                fontWeight: 800,
                letterSpacing: '0.3px',
                fontSize: { xs: '0.74rem', md: '0.82rem' },
              }}
            >
              {settings.institution_faculty || 'Campus Villa Nueva • Facultad de Ingeniería en Sistemas'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          {/* Selector de Paleta Visual: Opción 1 (Noche) vs Opción 2 (Clara: Dorado, Blanco y Azulado) */}
          <Tooltip title={isLight ? 'Cambiar a Paleta 1: Noche UMG (Azul Profundo y Dorado)' : 'Cambiar a Paleta 2: Clara Armónica (Dorado, Titanio y Azulado)'}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleToggleTheme}
              startIcon={isLight ? <DarkModeIcon sx={{ color: '#002B49' }} /> : <LightModeIcon sx={{ color: '#C5A059' }} />}
              sx={{
                borderColor: isLight ? 'rgba(0, 43, 73, 0.55)' : 'rgba(197, 160, 89, 0.6)',
                color: isLight ? '#002B49' : '#C5A059',
                fontWeight: 800,
                backgroundColor: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 25, 45, 0.4)',
                boxShadow: isLight ? '0 2px 6px rgba(0, 43, 73, 0.08)' : 'none',
                fontSize: '0.82rem',
                py: 0.4,
                px: 1.2,
                '&:hover': {
                  borderColor: '#C5A059',
                  backgroundColor: isLight ? '#FEF9C3' : 'rgba(197, 160, 89, 0.2)',
                },
              }}
            >
              {isLight ? 'Paleta Clara' : 'Paleta Noche'}
            </Button>
          </Tooltip>

          <Button
            variant="outlined"
            size="small"
            onClick={onOpenCatalog}
            startIcon={<ViewModuleIcon />}
            sx={{
              borderColor: isLight ? 'rgba(0, 43, 73, 0.55)' : 'rgba(255, 255, 255, 0.4)',
              color: isLight ? '#002B49' : '#FFFFFF',
              fontWeight: 800,
              backgroundColor: isLight ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
              fontSize: '0.82rem',
              py: 0.4,
              px: 1.2,
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
              fontSize: '0.82rem',
              py: 0.4,
              px: 1.2,
              boxShadow: '0 4px 14px rgba(197, 160, 89, 0.35)',
              '&:hover': { backgroundColor: '#DEB869', color: '#00192D' },
            }}
          >
            Gestión del Sitio
          </Button>
        </Box>
      </Box>

      {/* Contenido Central para la Audiencia del Auditorio */}
      <Container
        maxWidth={false}
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: '99%', xl: '1920px' },
          px: { xs: 1.5, sm: 2, md: 2.5 },
          py: { xs: 0.6, md: 0.8 },
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 1.8,
            alignItems: 'stretch',
            width: '100%',
            flex: { xs: 'none', md: 1 },
            minHeight: 0,
            height: { xs: 'auto', md: '100%' },
          }}
        >
          {/* SECCIÓN PRINCIPAL: CARRUSEL EXPANSIVO (Ancho flexible predominante) */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              height: { xs: 'auto', md: '100%' },
            }}
          >
            {/* Barra Superior de Títulos (optimizada para cañonera/proyector con espaciado limpio y separación visual) */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pt: { xs: 1.2, md: 1.6 },
                pb: { xs: 0.8, md: 1.0 },
                mb: { xs: 0.8, md: 1.0 },
                borderBottom: isLight ? '1px solid rgba(0, 43, 73, 0.08)' : '1px solid rgba(197, 160, 89, 0.2)',
                flexShrink: 0,
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Box
                  sx={{
                    backgroundColor: isLight ? '#002B49' : '#C5A059',
                    color: isLight ? '#FFFFFF' : '#00192D',
                    px: 1.2,
                    py: 0.35,
                    borderRadius: '6px',
                    fontWeight: 900,
                    fontSize: '0.78rem',
                    letterSpacing: '0.5px',
                    display: 'inline-block',
                    boxShadow: isLight ? 'none' : '0 2px 8px rgba(197, 160, 89, 0.3)',
                  }}
                >
                  SEMINARIO 2026
                </Box>

                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: '1.25rem', sm: '1.45rem', md: '1.65rem' },
                    lineHeight: 1.15,
                    color: isLight ? '#002B49' : 'transparent',
                    background: isLight
                      ? 'none'
                      : 'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 60%, #C5A059 100%)',
                    WebkitBackgroundClip: isLight ? 'unset' : 'text',
                    WebkitTextFillColor: isLight ? 'unset' : 'transparent',
                  }}
                >
                  {settings.site_title || 'Seminario de Graduación 2026'}
                </Typography>

                <Typography
                  variant="subtitle2"
                  sx={{
                    color: isLight ? '#78350F' : '#C5A059',
                    fontWeight: 800,
                    letterSpacing: '0.3px',
                    fontSize: { xs: '0.8rem', md: '0.9rem' },
                    display: { xs: 'none', lg: 'inline-block' },
                  }}
                >
                  • {settings.site_subtitle || 'Jornada de Presentación y Defensa de Proyectos de Grado'}
                </Typography>
              </Box>

              <Chip
                label={`${groups.filter((g) => g.status === 'completed').length} de ${groups.length} ${groups.length === 1 ? 'Grupo Concluido' : 'Grupos Concluidos'}`}
                sx={{
                  backgroundColor: isLight ? '#FEF3C7' : 'rgba(197, 160, 89, 0.2)',
                  color: isLight ? '#78350F' : '#C5A059',
                  fontWeight: 900,
                  fontSize: '0.8rem',
                  height: 26,
                  px: 0.5,
                  borderRadius: '6px',
                  border: isLight ? '2px solid #FDE68A' : '1px solid rgba(197, 160, 89, 0.4)',
                  boxShadow: isLight ? '0 2px 8px rgba(120, 53, 15, 0.12)' : 'none',
                }}
              />
            </Box>

            {/* CARRUSEL PROFESIONAL EXPANSIVO (con caja de texto integrada en degradado tipo vidrio) */}
            <Box
              sx={{
                flex: 1,
                minHeight: { xs: 300, md: 0 },
                height: { xs: 300, md: '100%' },
                borderRadius: 2.2,
                overflow: 'hidden',
                boxShadow: isLight ? '0 16px 40px rgba(0, 43, 73, 0.12)' : 'none',
              }}
            >
              <BannerCarousel
                banners={banners}
                interval={Number(settings.carousel_interval) || 5000}
                welcomeWords={settings.welcome_words}
                height="100%"
                isLight={isLight}
              />
            </Box>
          </Box>

          {/* PANEL LATERAL COMPACTO Y PROTEGIDO: PRÓXIMO EN EL ESTRADO (Ancho estable anti-aplastamiento) */}
          <Box
            sx={{
              width: { xs: '100%', md: 305, lg: 335, xl: 370 },
              minWidth: { md: 285, lg: 320, xl: 350 },
              maxWidth: { md: 325, lg: 370, xl: 400 },
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              height: { xs: 'auto', md: '100%' },
            }}
          >
            <Paper
              elevation={12}
              sx={{
                p: { xs: 1.2, md: 1.4 },
                borderRadius: 2,
                backgroundColor: isLight ? 'rgba(244, 248, 252, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                color: '#00192D',
                border: isLight ? '2px solid #002B49' : '1px solid #C5A059',
                boxShadow: isLight
                  ? '0 12px 32px rgba(0, 43, 73, 0.14)'
                  : '0 16px 40px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                minHeight: 0,
                overflowY: 'auto',
                overflowX: 'hidden',
                '&::-webkit-scrollbar': {
                  width: '5px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#CBD5E1',
                  borderRadius: '3px',
                },
              }}
            >
              {/* Etiqueta de Estado de Turno y No. Grupo */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6, flexShrink: 0 }}>
                <Chip
                  size="small"
                  label="PRÓXIMO EN ESTRADO"
                  sx={{
                    background: 'linear-gradient(135deg, #C5A059 0%, #9A7B38 100%)',
                    color: '#00192D',
                    fontWeight: 900,
                    fontSize: '0.74rem',
                    letterSpacing: '0.6px',
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
                      fontSize: '0.82rem',
                      height: 24,
                    }}
                  />
                )}
              </Box>

              {currentlySelectedGroup ? (
                <>
                  <Box sx={{ mb: 0.6, flexShrink: 0 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 900,
                        color: '#002B49',
                        mb: 0.3,
                        lineHeight: 1.2,
                        fontSize: { xs: '1.1rem', md: '1.2rem' },
                        wordBreak: 'break-word',
                      }}
                    >
                      {currentlySelectedGroup.group_name}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: '#78350F',
                        backgroundColor: '#FEF3C7',
                        border: '1px solid #FDE68A',
                        display: 'inline-block',
                        px: 1,
                        py: 0.3,
                        borderRadius: 1.5,
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        mb: 0.8,
                      }}
                    >
                      {currentlySelectedGroup.topic}
                    </Typography>

                    {/* Integrantes en el Estrado */}
                    <Box sx={{ mb: 0.8 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#002B49',
                          fontWeight: 900,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          display: 'block',
                          mb: 0.3,
                          fontSize: '0.74rem',
                        }}
                      >
                        Integrantes que Exponen
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4, maxHeight: 66, overflowY: 'auto' }}>
                        {currentlySelectedGroup.members && currentlySelectedGroup.members.length > 0 ? (
                          currentlySelectedGroup.members.map((m, idx) => (
                            <Chip
                              key={idx}
                              size="small"
                              icon={<PersonIcon sx={{ fontSize: '12px !important', color: '#002B49 !important' }} />}
                              label={m}
                              sx={{
                                backgroundColor: '#EEF2F6',
                                color: '#002B49',
                                fontWeight: 800,
                                fontSize: '0.74rem',
                                height: 22,
                                border: '1px solid #CBD5E1',
                                '& .MuiChip-label': {
                                  px: 0.8,
                                },
                              }}
                            />
                          ))
                        ) : (
                          <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                            Sin integrantes listados
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Detalles de la Presentación: Chip con Elipsis y Duración Segura sin deformar */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                        width: '100%',
                        minWidth: 0,
                      }}
                    >
                      <Tooltip
                        title={
                          currentlySelectedGroup.presentation_type === 'file'
                            ? (currentlySelectedGroup.original_name || 'Archivo')
                            : 'Presentación Web'
                        }
                      >
                        <Chip
                          size="small"
                          icon={
                            currentlySelectedGroup.presentation_type === 'file' ? (
                              currentlySelectedGroup.original_name?.endsWith('.pdf') ? (
                                <PictureAsPdfIcon sx={{ fontSize: '14px !important', color: '#002B49 !important' }} />
                              ) : (
                                <SlideshowIcon sx={{ fontSize: '14px !important', color: '#002B49 !important' }} />
                              )
                            ) : (
                              <LinkIcon sx={{ fontSize: '14px !important', color: '#002B49 !important' }} />
                            )
                          }
                          label={
                            currentlySelectedGroup.presentation_type === 'file'
                              ? (currentlySelectedGroup.original_name || 'Archivo')
                              : 'Presentación Web'
                          }
                          variant="outlined"
                          sx={{
                            fontWeight: 800,
                            borderColor: '#CBD5E1',
                            color: '#002B49',
                            height: 24,
                            fontSize: '0.76rem',
                            maxWidth: 'calc(100% - 65px)',
                            minWidth: 0,
                            '& .MuiChip-label': {
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block',
                            },
                          }}
                        />
                      </Tooltip>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#002B49',
                          fontWeight: 900,
                          fontSize: '0.82rem',
                          flexShrink: 0,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {currentlySelectedGroup.duration_minutes || 15} min
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 0.8, flexShrink: 0 }} />

                  {/* Selector Dinámico de Grupos a Ancho Completo */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%', flex: 1, minHeight: 0 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#002B49',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontSize: '0.72rem',
                        flexShrink: 0,
                      }}
                    >
                      Seleccionar Grupo a Exponer ({groups.length} {groups.length === 1 ? 'Grupo' : 'Grupos'}):
                    </Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        width: '100%',
                        flex: 1,
                        justifyContent: 'flex-start',
                        minHeight: 0,
                        overflowY: 'auto',
                        pr: 0.3,
                        '&::-webkit-scrollbar': { width: '4px' },
                        '&::-webkit-scrollbar-thumb': { backgroundColor: '#CBD5E1', borderRadius: '2px' },
                      }}
                    >
                      {sortedGroups.map((grp, idx) => {
                        const hasMaterial = hasGroupMaterial(grp);
                        const isSelected = grp.id === currentlySelectedGroup?.id;
                        const isCompleted = grp.status === 'completed';
                        const displayNum = grp.group_number || (idx + 1);

                        return (
                          <Button
                            key={grp.id}
                            fullWidth
                            disabled={!hasMaterial}
                            variant={isSelected ? 'contained' : 'outlined'}
                            onClick={() => setSelectedGroupId(grp.id)}
                            sx={{
                              py: 0.5,
                              px: 1,
                              minHeight: 34,
                              width: '100%',
                              borderRadius: 1.5,
                              textTransform: 'none',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              backgroundColor: !hasMaterial
                                ? (isLight ? '#E2E8F0' : 'rgba(255, 255, 255, 0.04)')
                                : isSelected
                                ? '#C5A059'
                                : (isLight ? '#FFFFFF' : 'rgba(0, 43, 73, 0.3)'),
                              borderColor: !hasMaterial
                                ? (isLight ? '#CBD5E1' : 'rgba(255, 255, 255, 0.12)')
                                : isSelected
                                ? '#C5A059'
                                : (isLight ? '#002B49' : 'rgba(197, 160, 89, 0.4)'),
                              boxShadow: isSelected
                                ? '0 4px 12px rgba(197, 160, 89, 0.4)'
                                : (isLight && hasMaterial ? '0 2px 4px rgba(0, 43, 73, 0.05)' : 'none'),
                              transition: 'all 200ms ease',
                              cursor: hasMaterial ? 'pointer' : 'not-allowed',
                              '&.Mui-disabled': {
                                backgroundColor: isLight ? '#E2E8F0' : 'rgba(255, 255, 255, 0.04)',
                                borderColor: isLight ? '#CBD5E1' : 'rgba(255, 255, 255, 0.1)',
                                opacity: 0.7,
                              },
                              '&:hover': {
                                backgroundColor: hasMaterial
                                  ? (isSelected ? '#B38F48' : (isLight ? '#FEF9C3' : 'rgba(197, 160, 89, 0.25)'))
                                  : undefined,
                                borderColor: hasMaterial ? '#C5A059' : undefined,
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 0 }}>
                              <Typography
                                sx={{
                                  fontWeight: 900,
                                  fontSize: '0.88rem',
                                  whiteSpace: 'nowrap',
                                  color: !hasMaterial
                                    ? (isLight ? '#64748B !important' : '#94A3B8 !important')
                                    : isSelected
                                    ? '#00192D'
                                    : (isLight ? '#002B49' : '#FFFFFF'),
                                }}
                              >
                                Grupo #{displayNum}
                              </Typography>
                              <Typography
                                variant="caption"
                                noWrap
                                sx={{
                                  maxWidth: { xs: 80, sm: 110, md: 90, lg: 120 },
                                  fontWeight: 700,
                                  fontSize: '0.74rem',
                                  color: isSelected ? 'rgba(0, 25, 45, 0.85)' : (isLight ? '#475569' : '#94A3B8'),
                                }}
                              >
                                • {grp.group_name}
                              </Typography>
                            </Box>

                            {!hasMaterial ? (
                              <Chip
                                label="Sin material"
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.7rem',
                                  fontWeight: 800,
                                  backgroundColor: isLight ? '#CBD5E1' : 'rgba(255, 255, 255, 0.08)',
                                  color: isLight ? '#1E293B !important' : '#94A3B8 !important',
                                  border: isLight ? '1px solid #94A3B8' : '1px solid rgba(255, 255, 255, 0.15)',
                                }}
                              />
                            ) : isCompleted ? (
                              <Chip
                                label="Concluido ✓"
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.72rem',
                                  fontWeight: 900,
                                  backgroundColor: isSelected ? 'rgba(0, 25, 45, 0.15)' : '#DCFCE7',
                                  color: isSelected ? '#00192D' : '#166534',
                                  border: '1.5px solid #86EFAC',
                                }}
                              />
                            ) : isSelected ? (
                              <Chip
                                label="En Turno"
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.72rem',
                                  fontWeight: 900,
                                  backgroundColor: '#00192D',
                                  color: '#FFFFFF',
                                }}
                              />
                            ) : (
                              <Chip
                                label="Listo"
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.72rem',
                                  fontWeight: 900,
                                  backgroundColor: isLight ? '#DCFCE7' : 'rgba(197, 160, 89, 0.15)',
                                  color: isLight ? '#166534' : '#C5A059',
                                  border: isLight ? '1.5px solid #86EFAC' : '1px solid rgba(197, 160, 89, 0.3)',
                                }}
                              />
                            )}
                          </Button>
                        );
                      })}
                      {sortedGroups.length === 0 && (
                        <Typography variant="caption" sx={{ color: '#64748B', py: 1.5, textAlign: 'center' }}>
                          No hay grupos registrados todavía.
                        </Typography>
                      )}
                    </Box>

                    {/* BOTÓN PRINCIPAL DE LANZAMIENTO */}
                    <Button
                      variant="contained"
                      fullWidth
                      disabled={!currentlySelectedGroup || !hasGroupMaterial(currentlySelectedGroup)}
                      size="medium"
                      startIcon={<PlayArrowIcon sx={{ fontSize: '22px !important' }} />}
                      onClick={() => onStartPresentation(currentlySelectedGroup)}
                      sx={{
                        background: currentlySelectedGroup && hasGroupMaterial(currentlySelectedGroup)
                          ? 'linear-gradient(135deg, #D32F2F 0%, #9A0007 100%)'
                          : '#94A3B8',
                        color: '#FFFFFF',
                        fontWeight: 900,
                        fontSize: '0.96rem',
                        py: 0.9,
                        mt: 0.5,
                        flexShrink: 0,
                        borderRadius: 1.5,
                        letterSpacing: '0.5px',
                        boxShadow: currentlySelectedGroup && hasGroupMaterial(currentlySelectedGroup)
                          ? '0 4px 16px rgba(211, 47, 47, 0.35)'
                          : 'none',
                        '&:hover': {
                          background: currentlySelectedGroup && hasGroupMaterial(currentlySelectedGroup)
                            ? 'linear-gradient(135deg, #EF5350 0%, #D32F2F 100%)'
                            : '#94A3B8',
                          boxShadow: '0 6px 20px rgba(211, 47, 47, 0.5)',
                        },
                      }}
                    >
                      {currentlySelectedGroup && hasGroupMaterial(currentlySelectedGroup)
                        ? 'INICIAR EXPOSICIÓN'
                        : 'MATERIAL PENDIENTE'}
                    </Button>
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body1" sx={{ color: '#002B49', fontWeight: 800 }}>
                    No hay grupos registrados todavía.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </Container>

      {/* Pie de Página Solemne */}
      <Box
        sx={{
          py: 0.8,
          px: { xs: 2, md: 3 },
          flexShrink: 0,
          backgroundColor: isLight ? 'rgba(230, 238, 246, 0.95)' : 'rgba(0, 15, 30, 0.85)',
          borderTop: isLight ? '2px solid #C5A059' : '1px solid rgba(197, 160, 89, 0.25)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1,
          transition: 'all 500ms ease',
        }}
      >
        <Typography variant="caption" sx={{ color: isLight ? '#00192D' : '#94A3B8', fontWeight: 700, fontSize: '0.78rem' }}>
          Universidad Mariano Gálvez de Guatemala • Sistema Centralizado de Proyección de Seminario de Graduación
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="caption" sx={{ color: isLight ? '#78350F' : '#C5A059', fontWeight: 900, fontSize: '0.82rem' }}>
            {settings.institution_faculty || 'Campus Villa Nueva • Facultad de Ingeniería en Sistemas'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AuditoriumStage;
