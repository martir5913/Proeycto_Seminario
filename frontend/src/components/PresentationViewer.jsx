import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  AppBar,
  Toolbar,
  Paper,
  Alert,
  Tooltip,
  CircularProgress,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeIcon from '@mui/icons-material/Home';
import axios from 'axios';

export const PresentationViewer = ({
  group,
  onClose,
  onNextGroup,
  onPrevGroup,
  hasNext,
  hasPrev,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [slideData, setSlideData] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [loadingSlides, setLoadingSlides] = useState(false);
  const [slideError, setSlideError] = useState(null);
  const [finishing, setFinishing] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const containerRef = useRef(null);

  const fileUrl = `/api/presentations/${group?.id}/file`;
  const ext = group?.original_name ? group.original_name.split('.').pop().toLowerCase() : '';
  const isSlideCapable = group?.presentation_type === 'file' && ['pptx', 'ppt', 'pdf'].includes(ext);
  const isLink = group?.presentation_type === 'link';

  // Cargar diapositivas de alta resolución desde el backend
  useEffect(() => {
    let isMounted = true;

    if (group?.presentation_type === 'file' && isSlideCapable) {
      setLoadingSlides(true);
      setSlideError(null);
      setCurrentSlideIndex(0);

      const cacheBuster = group?.updated_at ? new Date(group.updated_at).getTime() : Date.now();
      axios
        .get(`/api/presentations/${group.id}/slides?_t=${cacheBuster}`)
        .then((res) => {
          if (isMounted && res.data.success && res.data.slides && res.data.slides.length > 0) {
            setSlideData(res.data);
          } else if (isMounted) {
            setSlideData(null);
          }
        })
        .catch((err) => {
          console.warn('Error al cargar diapositivas optimizadas:', err);
          if (isMounted) {
            setSlideError('No se pudo procesar la presentación en modo diapositivas.');
            setSlideData(null);
          }
        })
        .finally(() => {
          if (isMounted) setLoadingSlides(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [group?.id, group?.file_name, group?.updated_at, isSlideCapable]);

  // Precargar diapositivas adyacentes para navegación instantánea sin parpadeo
  useEffect(() => {
    if (!slideData?.slides || slideData.slides.length === 0) return;

    const nextIndex = currentSlideIndex + 1;
    if (nextIndex < slideData.slides.length && slideData.slides[nextIndex]?.imageUrl) {
      const nextImg = new Image();
      nextImg.src = slideData.slides[nextIndex].imageUrl;
    }

    const prevIndex = currentSlideIndex - 1;
    if (prevIndex >= 0 && slideData.slides[prevIndex]?.imageUrl) {
      const prevImg = new Image();
      prevImg.src = slideData.slides[prevIndex].imageUrl;
    }
  }, [slideData, currentSlideIndex]);

  // Manejo de estado de pantalla completa
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      } else if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Manejador de finalización de exposición
  const handleFinishPresentation = async () => {
    try {
      await axios.patch(`/api/groups/${group.id}/status`, { status: 'completed' });
    } catch (e) {
      console.warn('Error al marcar grupo como completado:', e);
    }
    setFinishing(true);
    setCountdown(3);
  };

  // Cuenta regresiva para retorno automático
  useEffect(() => {
    if (!finishing) return;
    if (countdown <= 0) {
      onClose();
      return;
    }
    const timer = setTimeout(() => {
      setCountdown((c) => c - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [finishing, countdown, onClose]);

  // Navegación siguiente y anterior
  const goToNextSlide = useCallback(() => {
    if (slideData?.slides && currentSlideIndex < slideData.slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    } else if (slideData?.slides && currentSlideIndex === slideData.slides.length - 1) {
      handleFinishPresentation();
    }
  }, [slideData, currentSlideIndex]);

  const goToPrevSlide = useCallback(() => {
    if (slideData?.slides && currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  }, [slideData, currentSlideIndex]);

  // Manejo de teclado (Flechas, Espacio, RePag/AvPag, F para pantalla completa, ESC para salir)
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (!document.fullscreenElement) {
          onClose();
        }
      } else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter' || e.key === 'PageDown' || e.key === 'ArrowDown') {
        e.preventDefault();
        goToNextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'PageUp' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrevSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, goToNextSlide, goToPrevSlide]);

  if (!group) return null;

  // Formateador automático de enlaces externos para modo embebido
  const formatEmbedUrl = (rawUrl) => {
    if (!rawUrl) return '';
    let url = rawUrl.trim();

    // Canva: Soporte para links directos, compartidos o con ?utm
    if (url.includes('canva.com')) {
      if (url.includes('/edit')) {
        url = url.replace(/\/edit(\?.*)?$/, '/view?embed');
      } else if (!url.includes('embed')) {
        if (url.includes('?')) {
          url = url.replace('?', '?embed&');
        } else {
          url = `${url}?embed`;
        }
      }
    } else if (url.includes('docs.google.com/presentation') && url.includes('/edit')) {
      url = url.replace(/\/edit.*$/, '/embed?start=false&loop=false&delayms=3000');
    }

    return url;
  };

  const formattedUrl = isLink ? formatEmbedUrl(group.external_url) : '';
  const currentSlide = slideData?.slides ? slideData.slides[currentSlideIndex] : null;
  const isHighResMode = Boolean(currentSlide?.imageUrl);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        backgroundColor: '#000000',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* HEADER SLIM (Adelgazado a 42px para maximizar área de proyección) */}
      <AppBar
        position="static"
        sx={{
          backgroundColor: '#001E36',
          borderBottom: '2px solid #C5A059',
          px: { xs: 1, sm: 2 },
          height: 44,
          minHeight: '44px !important',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          justifyContent: 'center',
        }}
      >
        <Toolbar
          variant="dense"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 44,
            minHeight: '44px !important',
            px: '0 !important',
          }}
        >
          {/* Info compacta del Grupo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
            <Box
              sx={{
                backgroundColor: '#D32F2F',
                color: '#fff',
                px: 1,
                py: 0.2,
                borderRadius: '4px',
                fontWeight: 900,
                fontSize: '0.78rem',
                letterSpacing: '0.4px',
                whiteSpace: 'nowrap',
              }}
            >
              GRUPO #{group.group_number}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                noWrap
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: { xs: '0.85rem', sm: '0.95rem' },
                  letterSpacing: '0.2px',
                }}
              >
                {group.group_name}
              </Typography>
              <Typography
                variant="caption"
                noWrap
                sx={{
                  color: '#C5A059',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  display: { xs: 'none', md: 'inline-block' },
                }}
              >
                • {group.topic}
              </Typography>
            </Box>
          </Box>

          {/* Acciones del Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Botón Finalizar Exposición (Compacto y visible) */}
            <Button
              variant="contained"
              size="small"
              startIcon={<CheckCircleIcon sx={{ fontSize: '1rem !important' }} />}
              onClick={handleFinishPresentation}
              sx={{
                backgroundColor: '#2E7D32',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.78rem',
                px: 1.5,
                py: 0.3,
                borderRadius: '6px',
                textTransform: 'none',
                boxShadow: '0 2px 6px rgba(46, 125, 50, 0.4)',
                '&:hover': { backgroundColor: '#1B5E20' },
              }}
            >
              Finalizar
            </Button>

            {/* Navegación entre grupos */}
            {hasPrev && (
              <Tooltip title="Grupo Anterior">
                <IconButton onClick={onPrevGroup} size="small" sx={{ color: '#fff', p: 0.5 }}>
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {hasNext && (
              <Tooltip title="Siguiente Grupo">
                <IconButton onClick={onNextGroup} size="small" sx={{ color: '#fff', p: 0.5 }}>
                  <ArrowForwardIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* Descargar original */}
            {group.presentation_type === 'file' && (
              <Tooltip title="Descargar archivo original">
                <IconButton
                  size="small"
                  href={`${fileUrl}?download=true`}
                  sx={{ color: '#C5A059', p: 0.5 }}
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {isLink && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<OpenInNewIcon sx={{ fontSize: '0.85rem !important' }} />}
                href={group.external_url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: '#C5A059',
                  borderColor: 'rgba(197, 160, 89, 0.6)',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  px: 1.2,
                  py: 0.2,
                  borderRadius: '5px',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#C5A059',
                    backgroundColor: 'rgba(197, 160, 89, 0.12)',
                  },
                }}
              >
                {group.external_url?.includes('canva.com') ? 'Abrir en Canva' : 'Abrir Enlace'}
              </Button>
            )}

            {/* Botón Pantalla Completa para Proyección */}
            <Tooltip title={isFullscreen ? 'Salir de Pantalla Completa (F)' : 'Pantalla Completa para Cañonera (F)'}>
              <IconButton onClick={toggleFullscreen} size="small" sx={{ color: '#C5A059', p: 0.5 }}>
                {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
              </IconButton>
            </Tooltip>

            {/* Botón Salir */}
            <Tooltip title="Cerrar Visor (ESC)">
              <IconButton onClick={onClose} size="small" sx={{ color: '#EF5350', p: 0.5 }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ÁREA CENTRAL MAXIMIZADA (Lienzo de Diapositiva a Pantalla Completa) */}
      <Box
        sx={{
          flex: 1,
          width: '100%',
          height: 'calc(100vh - 84px)',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* ESTADO 1: Cargando diapositivas en alta resolución */}
        {loadingSlides && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              gap: 2,
            }}
          >
            <CircularProgress size={48} sx={{ color: '#C5A059' }} />
            <Typography variant="h6" sx={{ color: '#E2E8F0', fontWeight: 600 }}>
              Cargando diapositivas en alta definición...
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              Renderizando fondos, colores y diseño original de PowerPoint
            </Typography>
          </Box>
        )}

        {/* ESTADO 2: Diapositiva en ALTA FIDELIDAD NATIVA (Imagen nítida de PowerPoint 1080p con 100% de diseño) */}
        {!loadingSlides && slideData?.slides && slideData.slides.length > 0 && isHighResMode && (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              backgroundColor: '#000000',
              overflow: 'hidden',
            }}
            onClick={(e) => {
              // Click en mitad derecha: siguiente diapositiva; click en mitad izquierda: anterior
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              if (clickX > rect.width * 0.25) {
                goToNextSlide();
              } else {
                goToPrevSlide();
              }
            }}
          >
            {/* Imagen de la Diapositiva: Ocupa el 100% del espacio disponible sin deformarse */}
            <Box
              component="img"
              key={currentSlide.imageUrl}
              src={currentSlide.imageUrl}
              alt={`Diapositiva ${currentSlideIndex + 1} de ${slideData.totalSlides}`}
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                display: 'block',
                boxShadow: '0 0 50px rgba(0, 0, 0, 0.9)',
                animation: 'fadeInSlide 0.15s ease-out',
                '@keyframes fadeInSlide': {
                  from: { opacity: 0.85 },
                  to: { opacity: 1 },
                },
              }}
            />

            {/* Controles flotantes laterales translúcidos al pasar el ratón */}
            {currentSlideIndex > 0 && (
              <IconButton
                size="large"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevSlide();
                }}
                sx={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(0, 20, 38, 0.5)',
                  color: '#FFFFFF',
                  opacity: 0.2,
                  transition: 'opacity 0.2s, background-color 0.2s',
                  '&:hover': {
                    opacity: 1,
                    backgroundColor: 'rgba(0, 20, 38, 0.9)',
                    color: '#C5A059',
                  },
                }}
              >
                <NavigateBeforeIcon fontSize="large" />
              </IconButton>
            )}

            <IconButton
              size="large"
              onClick={(e) => {
                e.stopPropagation();
                goToNextSlide();
              }}
              sx={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0, 20, 38, 0.5)',
                color: '#FFFFFF',
                opacity: 0.2,
                transition: 'opacity 0.2s, background-color 0.2s',
                '&:hover': {
                  opacity: 1,
                  backgroundColor: 'rgba(0, 20, 38, 0.9)',
                  color: '#C5A059',
                },
              }}
            >
              <NavigateNextIcon fontSize="large" />
            </IconButton>
          </Box>
        )}

        {/* ESTADO 3: Fallback Diapositivas de Texto (si no hay modo gráfico disponible) */}
        {!loadingSlides && slideData?.slides && slideData.slides.length > 0 && !isHighResMode && (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
            }}
          >
            <Paper
              elevation={12}
              sx={{
                width: '100%',
                maxWidth: '1400px',
                height: 'calc(100vh - 100px)',
                backgroundColor: '#FFFFFF',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                p: { xs: 3, md: 5 },
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: '#002B49',
                  mb: 2,
                  borderBottom: '3px solid #C5A059',
                  pb: 1,
                }}
              >
                {currentSlide?.title || `Diapositiva ${currentSlideIndex + 1}`}
              </Typography>

              <Box sx={{ flex: 1, overflowY: 'auto', pr: 2 }}>
                {currentSlide?.content && currentSlide.content.length > 0 ? (
                  <Box component="ul" sx={{ pl: 3, m: 0 }}>
                    {currentSlide.content.map((point, pIdx) => (
                      <Typography
                        component="li"
                        key={pIdx}
                        variant="h6"
                        sx={{
                          color: '#1E293B',
                          fontSize: { xs: '1.1rem', md: '1.35rem' },
                          lineHeight: 1.6,
                          mb: 1.5,
                        }}
                      >
                        {point}
                      </Typography>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body1" sx={{ color: '#64748B', fontStyle: 'italic' }}>
                    (Contenido de diapositiva)
                  </Typography>
                )}
              </Box>
            </Paper>
          </Box>
        )}

        {/* ESTADO 4: Archivo PDF Directo (Fallback cuando no hay diapositivas parseadas) */}
        {!loadingSlides && !slideData && isSlideCapable && ext === 'pdf' && (
          <iframe
            src={`${fileUrl}#view=FitH&toolbar=1&navpanes=0`}
            title={`Presentación - ${group.group_name}`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: '#525659',
            }}
          />
        )}

        {/* ESTADO 5: Enlace Web Externo (Canva, Google Slides, Prezi) */}
        {!loadingSlides && isLink && (
          <>
            {!isOnline && (
              <Alert
                severity="warning"
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 10,
                  boxShadow: 4,
                }}
              >
                Atención: Modo Offline activo. Las presentaciones en enlaces externos requieren conexión a Internet.
              </Alert>
            )}
            <iframe
              src={formattedUrl}
              title={`Presentación Externa - ${group.group_name}`}
              allow="fullscreen; autoplay; clipboard-write; encrypted-media"
              allowFullScreen
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: '#000',
              }}
            />
          </>
        )}

        {/* ESTADO 6: Error o Archivo No Compatible */}
        {!loadingSlides && !slideData && !isLink && ext !== 'pdf' && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#fff',
              p: 4,
              textAlign: 'center',
            }}
          >
            <Alert severity="info" sx={{ maxWidth: 650, mb: 3 }}>
              {slideError || 'No se pudieron extraer automáticamente las diapositivas de la presentación.'}
            </Alert>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              href={`${fileUrl}?download=true`}
              sx={{ backgroundColor: '#D32F2F', fontWeight: 700 }}
            >
              Descargar Archivo Original ({ext.toUpperCase()})
            </Button>
          </Box>
        )}
      </Box>

      {/* FOOTER SLIM (Adelgazado a 40px para optimizar espacio vertical) */}
      {slideData?.slides && slideData.slides.length > 0 && (
        <Box
          sx={{
            height: 40,
            minHeight: 40,
            backgroundColor: '#001426',
            borderTop: '1px solid rgba(197, 160, 89, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 1.5, sm: 2 },
          }}
        >
          {/* Botón Anterior */}
          <Button
            size="small"
            variant="contained"
            startIcon={<NavigateBeforeIcon sx={{ fontSize: '1.1rem !important' }} />}
            disabled={currentSlideIndex === 0}
            onClick={goToPrevSlide}
            sx={{
              backgroundColor: '#002B49',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.78rem',
              px: 1.5,
              py: 0.2,
              borderRadius: '4px',
              textTransform: 'none',
              '&:hover': { backgroundColor: '#1B4965' },
              '&.Mui-disabled': { backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' },
            }}
          >
            Anterior
          </Button>

          {/* Contador Central */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              label={`Diapositiva ${currentSlideIndex + 1} de ${slideData.totalSlides}`}
              size="small"
              sx={{
                backgroundColor: '#C5A059',
                color: '#001426',
                fontWeight: 900,
                fontSize: '0.8rem',
                height: 24,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: '#94A3B8',
                fontSize: '0.75rem',
                display: { xs: 'none', sm: 'inline-block' },
              }}
            >
              (Flechas ← → o Espacio | <strong>F</strong>: Pantalla Completa)
            </Typography>
          </Box>

          {/* Botón Siguiente / Finalizar */}
          <Button
            size="small"
            variant="contained"
            endIcon={
              currentSlideIndex === slideData.totalSlides - 1 ? (
                <CheckCircleIcon sx={{ fontSize: '1.1rem !important' }} />
              ) : (
                <NavigateNextIcon sx={{ fontSize: '1.1rem !important' }} />
              )
            }
            onClick={goToNextSlide}
            sx={{
              backgroundColor: currentSlideIndex === slideData.totalSlides - 1 ? '#2E7D32' : '#002B49',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.78rem',
              px: 1.5,
              py: 0.2,
              borderRadius: '4px',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: currentSlideIndex === slideData.totalSlides - 1 ? '#1B5E20' : '#1B4965',
              },
            }}
          >
            {currentSlideIndex === slideData.totalSlides - 1 ? 'Finalizar Exposición' : 'Siguiente'}
          </Button>
        </Box>
      )}

      {/* Pantalla de Finalización con Retorno Automático y Manual */}
      {finishing && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 10000,
            backgroundColor: 'rgba(0, 20, 38, 0.96)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            textAlign: 'center',
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 72, color: '#4CAF50', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', mb: 1, letterSpacing: '0.5px' }}>
            ¡Exposición Finalizada!
          </Typography>
          <Typography variant="h6" sx={{ color: '#C5A059', fontWeight: 800, mb: 1 }}>
            Grupo #{group.group_number}: {group.group_name}
          </Typography>
          <Typography variant="body1" sx={{ color: '#E2E8F0', mb: 3, maxWidth: 500 }}>
            El estado del grupo se actualizó a concluido. Retornando al auditorio automáticamente en <strong>{countdown}</strong> segundos...
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<HomeIcon />}
            onClick={onClose}
            sx={{
              backgroundColor: '#C5A059',
              color: '#00192D',
              fontWeight: 900,
              px: 4,
              py: 1.2,
              borderRadius: 2,
              fontSize: '0.95rem',
              boxShadow: '0 4px 20px rgba(197, 160, 89, 0.5)',
              '&:hover': { backgroundColor: '#DEB869' },
            }}
          >
            Volver al Auditorio Ahora
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PresentationViewer;

