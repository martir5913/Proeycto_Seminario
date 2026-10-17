import React, { useState, useEffect, useCallback } from 'react';
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
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
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

  const fileUrl = `/api/presentations/${group?.id}/file`;
  const ext = group?.original_name ? group.original_name.split('.').pop().toLowerCase() : '';
  const isPptxFile = group?.presentation_type === 'file' && (ext === 'pptx' || ext === 'ppt');
  const isPdfFile = group?.presentation_type === 'file' && (ext === 'pdf' || group?.mime_type === 'application/pdf');
  const isLink = group?.presentation_type === 'link';

  // Cargar diapositivas parseadas si es un archivo PPTX
  useEffect(() => {
    let isMounted = true;

    if (group?.presentation_type === 'file' && isPptxFile) {
      setLoadingSlides(true);
      setSlideError(null);
      setCurrentSlideIndex(0);

      axios
        .get(`/api/presentations/${group.id}/slides`)
        .then((res) => {
          if (isMounted && res.data.success && res.data.slides) {
            setSlideData(res.data);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setSlideError('No se pudieron extraer automáticamente las diapositivas interactivas del archivo PowerPoint.');
          }
        })
        .finally(() => {
          if (isMounted) setLoadingSlides(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [group?.id, isPptxFile]);

  // Manejador de finalización de exposición y retorno automático/manual
  const handleFinishPresentation = async () => {
    try {
      await axios.patch(`/api/groups/${group.id}/status`, { status: 'completed' });
    } catch (e) {
      console.warn('Error al marcar grupo como completado:', e);
    }
    setFinishing(true);
    setCountdown(3);
  };

  // Cuenta regresiva para retorno automático a la pantalla principal
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

  // Manejo de eventos de teclado (Navegación entre diapositivas y salida con ESC)
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        if (slideData?.slides && currentSlideIndex < slideData.slides.length - 1) {
          setCurrentSlideIndex((prev) => prev + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        if (slideData?.slides && currentSlideIndex > 0) {
          setCurrentSlideIndex((prev) => prev - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, slideData, currentSlideIndex]);

  if (!group) return null;

  // Formateador automático de enlaces externos para modo embebido
  const formatEmbedUrl = (rawUrl) => {
    if (!rawUrl) return '';
    let url = rawUrl.trim();

    if (url.includes('canva.com') && !url.includes('embed')) {
      if (url.includes('?')) {
        url = url.replace('?', '?embed&');
      } else {
        url = `${url}?embed`;
      }
    } else if (url.includes('docs.google.com/presentation') && url.includes('/edit')) {
      url = url.replace(/\/edit.*$/, '/embed?start=false&loop=false&delayms=3000');
    }

    return url;
  };

  const formattedUrl = isLink ? formatEmbedUrl(group.external_url) : '';
  const currentSlide = slideData?.slides ? slideData.slides[currentSlideIndex] : null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        backgroundColor: '#050D1A',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Barra Superior de Control de Proyección */}
      <AppBar
        position="static"
        sx={{
          backgroundColor: '#002B49',
          borderBottom: '3px solid #C5A059',
          px: 2,
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: 64, px: '0 !important' }}>
          {/* Info del Grupo Proyectado */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                backgroundColor: '#D32F2F',
                color: '#fff',
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                fontWeight: 900,
                fontSize: '0.9rem',
                letterSpacing: '0.5px',
              }}
            >
              GRUPO #{group.group_number}
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
                {group.group_name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#C5A059', fontWeight: 600 }}>
                {group.topic} • {group.career || 'Seminario de Graduación'}
              </Typography>
            </Box>
          </Box>

          {/* Botón de Finalización y Retorno */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<CheckCircleIcon />}
              onClick={handleFinishPresentation}
              sx={{
                backgroundColor: '#2E7D32',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.85rem',
                px: 2,
                py: 0.8,
                borderRadius: 2,
                boxShadow: '0 2px 10px rgba(46, 125, 50, 0.4)',
                '&:hover': { backgroundColor: '#1B5E20' },
              }}
            >
              Finalizar Exposición
            </Button>
          </Box>

          {/* Botones de Navegación y Cierre */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {hasPrev && (
              <Tooltip title="Grupo Anterior">
                <IconButton onClick={onPrevGroup} sx={{ color: '#fff' }}>
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
            )}

            {hasNext && (
              <Tooltip title="Siguiente Grupo">
                <IconButton onClick={onNextGroup} sx={{ color: '#fff' }}>
                  <ArrowForwardIcon />
                </IconButton>
              </Tooltip>
            )}

            {/* Descarga secundaria opcional */}
            {group.presentation_type === 'file' && (
              <Tooltip title="Descargar archivo original">
                <IconButton
                  size="small"
                  href={`${fileUrl}?download=true`}
                  sx={{ color: '#C5A059', backgroundColor: 'rgba(197, 160, 89, 0.15)' }}
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {isLink && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<OpenInNewIcon />}
                href={group.external_url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: '#C5A059',
                  borderColor: '#C5A059',
                  '&:hover': { borderColor: '#fff', color: '#fff' },
                }}
              >
                Abrir en Pestaña
              </Button>
            )}

            <Tooltip title="Salir de Pantalla Completa (ESC)">
              <IconButton onClick={onClose} sx={{ color: '#EF5350', ml: 1 }}>
                <FullscreenExitIcon fontSize="large" />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Área Central de Visualización */}
      <Box sx={{ flex: 1, width: '100%', height: 'calc(100vh - 64px)', position: 'relative', overflow: 'hidden' }}>
        {/* CASO 1: Archivo PPTX - VISOR NATIVO EN EL NAVEGADOR */}
        {isPptxFile && (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#030811',
            }}
          >
            {loadingSlides ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#fff' }}>
                <CircularProgress sx={{ color: '#C5A059', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#E2E8F0', fontWeight: 600 }}>
                  Cargando y procesando diapositivas en el navegador...
                </Typography>
              </Box>
            ) : slideData?.slides && slideData.slides.length > 0 ? (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Lienzo Principal de la Diapositiva (Estilo 16:9 Cinema) */}
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: { xs: 2, md: 4 },
                  }}
                >
                  <Paper
                    elevation={12}
                    sx={{
                      width: '100%',
                      maxWidth: '1280px',
                      aspectRatio: '16/9',
                      maxHeight: 'calc(100vh - 160px)',
                      backgroundColor: '#FFFFFF',
                      borderRadius: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      p: { xs: 3, md: 6 },
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
                    }}
                  >
                    {/* Marca de agua institucional sutil */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        right: 24,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        opacity: 0.35,
                      }}
                    >
                      <Box component="img" src="/assets/umg-icon.svg" sx={{ width: 24, height: 24 }} />
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#002B49' }}>
                        UMG VILLA NUEVA
                      </Typography>
                    </Box>

                    {/* Título de la Diapositiva */}
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        color: '#002B49',
                        mb: 3,
                        borderBottom: '3px solid #C5A059',
                        pb: 1.5,
                      }}
                    >
                      {currentSlide?.title || `Diapositiva ${currentSlideIndex + 1}`}
                    </Typography>

                    {/* Contenido: Texto e Imágenes de la Diapositiva */}
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: { xs: 'column', md: currentSlide?.images?.length ? 'row' : 'column' },
                        gap: 4,
                        overflowY: 'auto',
                      }}
                    >
                      {/* Puntos y Párrafos de Texto */}
                      <Box sx={{ flex: 1 }}>
                        {currentSlide?.content && currentSlide.content.length > 0 ? (
                          <Box component="ul" sx={{ pl: 3, m: 0 }}>
                            {currentSlide.content.map((point, pIdx) => (
                              <Typography
                                component="li"
                                key={pIdx}
                                variant="h6"
                                sx={{
                                  color: '#1E293B',
                                  fontSize: { xs: '1rem', md: '1.25rem' },
                                  lineHeight: 1.6,
                                  mb: 1.5,
                                  fontWeight: 400,
                                }}
                              >
                                {point}
                              </Typography>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body1" sx={{ color: '#64748B', fontStyle: 'italic' }}>
                            (Diapositiva con contenido gráfico)
                          </Typography>
                        )}
                      </Box>

                      {/* Imágenes Embebidas de la Diapositiva */}
                      {currentSlide?.images && currentSlide.images.length > 0 && (
                        <Box
                          sx={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            maxHeight: '100%',
                          }}
                        >
                          <Box
                            component="img"
                            src={currentSlide.images[0]}
                            alt={`Imagen Diapositiva ${currentSlideIndex + 1}`}
                            sx={{
                              maxWidth: '100%',
                              maxHeight: '360px',
                              objectFit: 'contain',
                              borderRadius: 2,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Box>

                {/* Barra Inferior de Navegación de Diapositivas */}
                <Box
                  sx={{
                    height: 60,
                    backgroundColor: 'rgba(0, 43, 73, 0.95)',
                    borderTop: '1px solid rgba(197, 160, 89, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 3,
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<NavigateBeforeIcon />}
                    disabled={currentSlideIndex === 0}
                    onClick={() => setCurrentSlideIndex((prev) => prev - 1)}
                    sx={{ backgroundColor: '#00192D', color: '#fff', '&:hover': { backgroundColor: '#1B4965' } }}
                  >
                    Anterior
                  </Button>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Chip
                      label={`Diapositiva ${currentSlideIndex + 1} de ${slideData.totalSlides}`}
                      sx={{
                        backgroundColor: '#C5A059',
                        color: '#00192D',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                      (Navega con flechas de teclado ← → o Espacio)
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    endIcon={currentSlideIndex === slideData.totalSlides - 1 ? <CheckCircleIcon /> : <NavigateNextIcon />}
                    onClick={() => {
                      if (currentSlideIndex === slideData.totalSlides - 1) {
                        handleFinishPresentation();
                      } else {
                        setCurrentSlideIndex((prev) => prev + 1);
                      }
                    }}
                    sx={{
                      backgroundColor: currentSlideIndex === slideData.totalSlides - 1 ? '#2E7D32' : '#00192D',
                      color: '#fff',
                      fontWeight: 800,
                      '&:hover': {
                        backgroundColor: currentSlideIndex === slideData.totalSlides - 1 ? '#1B5E20' : '#1B4965',
                      },
                    }}
                  >
                    {currentSlideIndex === slideData.totalSlides - 1 ? 'Finalizar Exposición' : 'Siguiente'}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#fff', p: 4 }}>
                <Alert severity="info" sx={{ maxWidth: 600, mb: 3 }}>
                  No se pudo procesar la presentación en modo interactivo HTML5. Puede visualizarla utilizando el visor web online o descargándola.
                </Alert>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  href={`${fileUrl}?download=true`}
                  sx={{ backgroundColor: '#D32F2F', fontWeight: 700 }}
                >
                  Descargar Archivo PPTX
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* CASO 2: Archivo PDF Local */}
        {isPdfFile && (
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

        {/* CASO 3: Enlace Web (Canva, Google Slides, Prezi) */}
        {isLink && (
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
              allow="fullscreen"
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
      </Box>

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
          <CheckCircleIcon sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#FFFFFF', mb: 1, letterSpacing: '0.5px' }}>
            ¡Exposición Finalizada!
          </Typography>
          <Typography variant="h6" sx={{ color: '#C5A059', fontWeight: 800, mb: 1 }}>
            Grupo #{group.group_number}: {group.group_name}
          </Typography>
          <Typography variant="body1" sx={{ color: '#E2E8F0', mb: 4, maxWidth: 500 }}>
            El estado del grupo se actualizó a concluido. Retornando al auditorio principal automáticamente en <strong>{countdown}</strong> segundos...
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
              py: 1.5,
              borderRadius: 2.5,
              fontSize: '1rem',
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
