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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TimerControl from './TimerControl';

export const PresentationViewer = ({
  group,
  onClose,
  onNextGroup,
  onPrevGroup,
  hasNext,
  hasPrev,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Escuchar tecla ESC para salir
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!group) return null;

  const fileUrl = `/api/presentations/${group.id}/file`;
  const ext = group.original_name ? group.original_name.split('.').pop().toLowerCase() : '';
  const isPdf = group.presentation_type === 'file' && (ext === 'pdf' || group.mime_type === 'application/pdf');
  const isPptx = group.presentation_type === 'file' && !isPdf;
  const isLink = group.presentation_type === 'link';

  // Formateador automático de enlaces externos para modo embebido
  const formatEmbedUrl = (rawUrl) => {
    if (!rawUrl) return '';
    let url = rawUrl.trim();

    // Canva
    if (url.includes('canva.com') && !url.includes('embed')) {
      if (url.includes('?')) {
        url = url.replace('?', '?embed&');
      } else {
        url = `${url}?embed`;
      }
    }
    // Google Slides
    else if (url.includes('docs.google.com/presentation') && url.includes('/edit')) {
      url = url.replace(/\/edit.*$/, '/embed?start=false&loop=false&delayms=3000');
    }

    return url;
  };

  const formattedUrl = isLink ? formatEmbedUrl(group.external_url) : '';

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        backgroundColor: '#00192D',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Barra Superior de Control de Proyección */}
      <AppBar
        position="static"
        sx={{
          backgroundColor: 'rgba(0, 43, 73, 0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '2px solid #C5A059',
          px: 1,
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', minHeight: 64 }}>
          {/* Info del Grupo Proyectado */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                backgroundColor: '#D32F2F',
                color: '#fff',
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                fontWeight: 800,
                fontSize: '0.9rem',
              }}
            >
              GRUPO {group.group_number}
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
                {group.group_name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#C5A059', fontWeight: 500 }}>
                {group.topic} • {group.career || 'Seminario de Graduación'}
              </Typography>
            </Box>
          </Box>

          {/* Temporizador Central */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TimerControl initialMinutes={group.duration_minutes || 15} />
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

            {/* Acciones de descarga para archivos */}
            {group.presentation_type === 'file' && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                href={`${fileUrl}?download=true`}
                sx={{
                  color: '#C5A059',
                  borderColor: '#C5A059',
                  '&:hover': { borderColor: '#fff', color: '#fff' },
                }}
              >
                Descargar
              </Button>
            )}

            {/* Enlace original si es externo */}
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
      <Box sx={{ flex: 1, width: '100%', height: 'calc(100vh - 64px)', position: 'relative' }}>
        {/* CASO 1: Archivo PDF Local */}
        {isPdf && (
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

        {/* CASO 2: Archivo PPTX (PowerPoint) */}
        {isPptx && (
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
            <Paper
              elevation={6}
              sx={{
                p: 5,
                maxWidth: 600,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: 4,
                border: '1px solid rgba(197, 160, 89, 0.3)',
              }}
            >
              <Typography variant="h5" sx={{ color: '#C5A059', fontWeight: 700, mb: 2 }}>
                Presentación PowerPoint ({group.original_name})
              </Typography>
              <Typography variant="body1" sx={{ color: '#E2E8F0', mb: 4 }}>
                Para una proyección sin latencia y con soporte de animaciones completas en la sala,
                haga clic en el botón a continuación para abrir la presentación con Microsoft PowerPoint local.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<DownloadIcon />}
                href={`${fileUrl}?download=true`}
                sx={{
                  backgroundColor: '#D32F2F',
                  color: '#fff',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  '&:hover': { backgroundColor: '#9A0007' },
                }}
              >
                Abrir / Descargar PowerPoint
              </Button>
            </Paper>
          </Box>
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
                Atención: No hay conexión a Internet en este momento. Los enlaces externos podrían no cargar hasta restablecer la red.
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
    </Box>
  );
};

export default PresentationViewer;
