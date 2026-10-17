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
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);

  // Filtrar banners activos
  const activeBanners = banners.filter((b) => b.is_active === 1 || b.is_active === true);

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
          setCurrentIndex((idx) => (idx + 1) % activeBanners.length);
          return 0;
        }
        return prev + progressIncrement;
      });
    }, stepMs);

    return () => clearInterval(timer);
  }, [activeBanners.length, isPlaying, isHovered, interval, currentIndex]);

  const handleNext = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const handlePrev = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleSelectSlide = (idx) => {
    setProgress(0);
    setCurrentIndex(idx);
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
          backgroundColor: 'rgba(0, 25, 45, 0.7)',
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
        <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
          Seminario de Graduación 2026
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
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
        borderRadius: isFullscreen ? 0 : 4,
        overflow: 'hidden',
        boxShadow: isFullscreen
          ? 'none'
          : '0 20px 40px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(197, 160, 89, 0.3)',
        backgroundColor: '#001424',
        userSelect: 'none',
      }}
    >
      {/* Capas de imágenes con Efecto Desvanecimiento Puro (Fade sin vibración ni escalado) */}
      {activeBanners.map((banner, index) => {
        const isCurrent = index === currentIndex;
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
              transition: 'opacity 1000ms cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'opacity',
              zIndex: isCurrent ? 1 : 0,
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
          zIndex: 2,
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(0, 15, 30, 0.45) 0%, rgba(0, 15, 30, 0.05) 35%, rgba(0, 20, 38, 0.75) 75%, rgba(0, 15, 30, 0.95) 100%)',
        }}
      />

      {/* CAJA DE TEXTO EN EL CARRUSEL: DISEÑADA PARA MÁXIMA LEGIBILIDAD */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 24,
          left: { xs: 16, md: 24 },
          right: { xs: 16, md: 24 },
          zIndex: 4,
          backgroundColor: 'rgba(0, 20, 38, 0.88)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(197, 160, 89, 0.75)',
          borderRadius: 3,
          p: { xs: 1.5, sm: 2, md: 2.2 },
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.6,
          transition: 'all 300ms ease',
        }}
      >
        {/* Cabecera de la caja con Título del Banner Actual */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon sx={{ fontSize: 18, color: '#C5A059' }} />
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 900,
                color: '#C5A059',
                letterSpacing: '0.4px',
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                lineHeight: 1.2,
              }}
            >
              {currentBanner.title}
            </Typography>
          </Box>
          {currentBanner.subtitle && (
            <Typography
              variant="caption"
              sx={{
                color: '#CBD5E1',
                fontWeight: 600,
                fontSize: '0.78rem',
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
            variant="body2"
            sx={{
              color: '#FFFFFF',
              fontStyle: 'italic',
              lineHeight: 1.5,
              fontSize: { xs: '0.82rem', sm: '0.88rem', md: '0.92rem' },
              textShadow: '0 1px 3px rgba(0,0,0,0.85)',
              borderLeft: '3px solid #C5A059',
              pl: 1.5,
              mt: 0.2,
            }}
          >
            "{welcomeWords}"
          </Typography>
        )}
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
