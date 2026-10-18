import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  Fade,
} from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export const BannerCarousel = ({
  banners = [],
  interval = 5000,
  height = { xs: 260, sm: 340, md: 400 },
  welcomeWords = '',
  onManageClick,
  isLight = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);

  // Filtrar banners activos
  const activeBanners = banners.filter((b) => b.is_active === 1 || b.is_active === true);

  const goToSlide = (nextIndex) => {
    if (nextIndex === currentIndex || activeBanners.length === 0) return;
    setPrevIndex(currentIndex);
    setCurrentIndex(nextIndex);
    setProgress(0);
  };

  // Control de reproducción automática y barra de progreso suave
  useEffect(() => {
    if (activeBanners.length <= 1 || !isPlaying || isHovered) {
      setProgress(0);
      return;
    }

    const stepMs = 50;
    const progressIncrement = (stepMs / interval) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goToSlide((currentIndex + 1) % activeBanners.length);
          return 0;
        }
        return prev + progressIncrement;
      });
    }, stepMs);

    return () => clearInterval(timer);
  }, [activeBanners.length, isPlaying, isHovered, interval, currentIndex]);

  const handleNext = () => {
    if (activeBanners.length <= 1) return;
    goToSlide((currentIndex + 1) % activeBanners.length);
  };

  const handlePrev = () => {
    if (activeBanners.length <= 1) return;
    goToSlide((currentIndex - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleSelectSlide = (idx) => {
    goToSlide(idx);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(err => console.error(err));
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(err => console.error(err));
    }
  };

  // Escuchar cambios de fullscreen del navegador (ej. tecla ESC)
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  if (!activeBanners || activeBanners.length === 0) {
    return (
      <Box
        sx={{
          height,
          borderRadius: 4,
          backgroundColor: isLight ? 'rgba(230, 238, 246, 0.9)' : 'rgba(0, 25, 45, 0.7)',
          border: '1px solid rgba(197, 160, 89, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          textAlign: 'center',
        }}
      >
        <AutoAwesomeIcon sx={{ fontSize: 48, color: '#C5A059', mb: 1, opacity: 0.8 }} />
        <Typography variant="h6" sx={{ color: isLight ? '#002B49' : '#FFFFFF', fontWeight: 800 }}>
          Seminario de Graduación 2026
        </Typography>
        <Typography variant="body2" sx={{ color: isLight ? '#475569' : '#94A3B8', mt: 0.5, fontWeight: 600 }}>
          No hay banners activos actualmente. Agrega imágenes desde el Módulo de Gestión.
        </Typography>
      </Box>
    );
  }

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];

  return (
    <Box
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        position: 'relative',
        width: '100%',
        height: isFullscreen ? '100vh' : height,
        borderRadius: isFullscreen ? 0 : 2.2,
        overflow: 'hidden',
        boxShadow: isFullscreen
          ? 'none'
          : (isLight
            ? '0 20px 40px rgba(0, 35, 65, 0.14), 0 0 0 1px rgba(197, 160, 89, 0.35)'
            : '0 20px 40px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(197, 160, 89, 0.3)'),
        backgroundColor: '#001424',
        userSelect: 'none',
      }}
    >
      {/* Capas de imágenes con Desvanecimiento Cruzado Fluido (Cross-fade A/B sin cortes negros) */}
      {activeBanners.map((banner, index) => {
        const isCurrent = index === currentIndex;
        const isPrev = index === prevIndex;
        const zIndex = isCurrent ? 3 : isPrev ? 2 : 1;

        return (
          <Box
            key={banner.id || index}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: isCurrent ? 1 : 0,
              pointerEvents: isCurrent ? 'auto' : 'none',
              transition: 'opacity 1200ms cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'opacity',
              zIndex,
            }}
          >
            <Box
              component="img"
              src={banner.image_url}
              alt={banner.title}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
                backfaceVisibility: 'hidden',
                transform: isCurrent ? 'scale(1.025)' : 'scale(1)',
                transition: 'transform 8000ms ease-out',
              }}
            />
          </Box>
        );
      })}

      {/* Degradado Cinematográfico Superior e Inferior para Legibilidad */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 3,
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(0, 15, 30, 0.45) 0%, rgba(0, 15, 30, 0.05) 30%, rgba(0, 20, 38, 0.75) 70%, rgba(0, 15, 30, 0.95) 100%)',
        }}
      />

      {/* CAJA DE TEXTO EN EL CARRUSEL: DEGRADADO TIPO VIDRIO ESMERILADO (GLASSMORPHISM) COMPACTO Y RESPONSIVO */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 8, sm: 12, md: 16 },
          left: { xs: 8, sm: 12, md: 20 },
          right: { xs: 8, sm: 12, md: 20 },
          zIndex: 4,
          background: isLight
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(240, 246, 252, 0.85) 50%, rgba(225, 235, 245, 0.78) 100%)'
            : 'linear-gradient(135deg, rgba(0, 25, 48, 0.86) 0%, rgba(0, 18, 36, 0.78) 50%, rgba(5, 14, 25, 0.92) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: isLight
            ? '1.5px solid rgba(255, 255, 255, 0.85)'
            : '1.5px solid rgba(197, 160, 89, 0.65)',
          borderTop: isLight
            ? '2px solid rgba(255, 255, 255, 0.95)'
            : '2px solid rgba(255, 255, 255, 0.35)',
          borderRadius: 2.2,
          p: { xs: 1.2, sm: 1.5, md: 1.8 },
          boxShadow: isLight
            ? '0 12px 30px rgba(0, 35, 65, 0.16), inset 0 1px 2px rgba(255, 255, 255, 0.95)'
            : '0 16px 36px rgba(0, 0, 0, 0.65), inset 0 1px 2px rgba(255, 255, 255, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          transition: 'all 400ms ease',
        }}
      >
        <Fade in={true} key={currentIndex} timeout={900}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {/* Cabecera de la caja con Título del Banner Actual */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesomeIcon sx={{ fontSize: { xs: 18, md: 22 }, color: '#C5A059' }} />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 900,
                    color: isLight ? '#002B49' : '#F5D77F',
                    letterSpacing: '0.3px',
                    fontSize: { xs: '1rem', sm: '1.18rem', md: '1.35rem' },
                    lineHeight: 1.2,
                    textShadow: isLight ? 'none' : '0 2px 8px rgba(0,0,0,0.6)',
                  }}
                >
                  {currentBanner.title}
                </Typography>
              </Box>
              {currentBanner.subtitle && (
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: isLight ? '#1B4965' : '#E2E8F0',
                    fontWeight: 700,
                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '0.95rem' },
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  {currentBanner.subtitle}
                </Typography>
              )}
            </Box>

            {/* Palabras Solemnes de Bienvenida / Discurso de Apertura */}
            {welcomeWords && (
              <Typography
                variant="body1"
                sx={{
                  color: isLight ? '#00192D' : '#FFFFFF',
                  fontStyle: 'italic',
                  fontWeight: 600,
                  lineHeight: 1.4,
                  fontSize: { xs: '0.85rem', sm: '0.92rem', md: '1rem' },
                  textShadow: isLight ? 'none' : '0 1px 3px rgba(0,0,0,0.85)',
                  borderLeft: '3.5px solid #C5A059',
                  pl: 1.4,
                  mt: 0.2,
                  display: '-webkit-box',
                  WebkitLineClamp: { xs: 2, md: 2, lg: 3 },
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                "{welcomeWords}"
              </Typography>
            )}
          </Box>
        </Fade>
      </Box>

      {/* Barra de Estado Superior del Carrusel */}
      <Box
        sx={{
          position: 'absolute',
          top: 14,
          left: 16,
          right: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 4,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            size="small"
            icon={<AutoAwesomeIcon sx={{ fontSize: '14px !important', color: '#002B49 !important' }} />}
            label="GALERÍA DEL AUDITORIO"
            sx={{
              backgroundColor: '#C5A059',
              color: '#002B49',
              fontWeight: 800,
              fontSize: '0.7rem',
              letterSpacing: '0.5px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          />

          {isHovered && isPlaying && activeBanners.length > 1 && (
            <Fade in={isHovered}>
              <Chip
                size="small"
                label="Pausado al enfocar"
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  color: '#CBD5E1',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  backdropFilter: 'blur(6px)',
                }}
              />
            </Fade>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          {/* Contador de Diapositiva */}
          <Chip
            size="small"
            label={`${currentIndex + 1} / ${activeBanners.length}`}
            sx={{
              backgroundColor: 'rgba(0, 25, 45, 0.75)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.75rem',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          />

          {/* Botón Pausa / Reproducir */}
          {activeBanners.length > 1 && (
            <Tooltip title={isPlaying ? 'Pausar transición' : 'Reanudar transición'}>
              <IconButton
                size="small"
                onClick={() => setIsPlaying(!isPlaying)}
                sx={{
                  backgroundColor: 'rgba(0, 25, 45, 0.75)',
                  color: '#FFFFFF',
                  backdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  '&:hover': { backgroundColor: 'rgba(197, 160, 89, 0.8)', color: '#00192D' },
                }}
              >
                {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}

          {/* Botón Pantalla Completa */}
          <Tooltip title={isFullscreen ? 'Salir de pantalla completa' : 'Ver carrusel en pantalla completa'}>
            <IconButton
              size="small"
              onClick={toggleFullscreen}
              sx={{
                backgroundColor: 'rgba(0, 25, 45, 0.75)',
                color: '#FFFFFF',
                backdropFilter: 'blur(6px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                '&:hover': { backgroundColor: 'rgba(197, 160, 89, 0.8)', color: '#00192D' },
              }}
            >
              {isFullscreen ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Flechas de Navegación Suave (aparecen con animación en hover o si pantalla grande) */}
      {activeBanners.length > 1 && (
        <>
          <IconButton
            onClick={handlePrev}
            sx={{
              position: 'absolute',
              top: '50%',
              left: 16,
              transform: 'translateY(-50%)',
              zIndex: 4,
              backgroundColor: 'rgba(0, 25, 45, 0.65)',
              color: '#FFFFFF',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              opacity: { xs: 0.7, md: isHovered ? 1 : 0 },
              transition: 'all 250ms ease',
              '&:hover': {
                backgroundColor: '#C5A059',
                color: '#00192D',
                transform: 'translateY(-50%) scale(1.1)',
              },
            }}
          >
            <NavigateBeforeIcon />
          </IconButton>

          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              top: '50%',
              right: 16,
              transform: 'translateY(-50%)',
              zIndex: 4,
              backgroundColor: 'rgba(0, 25, 45, 0.65)',
              color: '#FFFFFF',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              opacity: { xs: 0.7, md: isHovered ? 1 : 0 },
              transition: 'all 250ms ease',
              '&:hover': {
                backgroundColor: '#C5A059',
                color: '#00192D',
                transform: 'translateY(-50%) scale(1.1)',
              },
            }}
          >
            <NavigateNextIcon />
          </IconButton>
        </>
      )}

      {/* Línea de Progreso Activa e Indicadores Interactivos al Fondo */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 8,
          zIndex: 4,
          display: 'flex',
          gap: '4px',
          px: 2,
          pb: 1,
        }}
      >
        {activeBanners.map((banner, idx) => {
          const isSelected = idx === currentIndex;
          return (
            <Box
              key={banner.id || idx}
              onClick={() => handleSelectSlide(idx)}
              sx={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.15)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                '&:hover': {
                  height: 6,
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                },
              }}
            >
              {isSelected && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${progress}%`,
                    backgroundColor: '#C5A059',
                    boxShadow: '0 0 8px #C5A059',
                    transition: isPlaying && !isHovered ? 'width 50ms linear' : 'none',
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default BannerCarousel;
