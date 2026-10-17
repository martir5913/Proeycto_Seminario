import React, { useState, useEffect } from 'react';
import { Chip, Tooltip } from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';

export const NetworkStatusBadge = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Tooltip
      title={
        isOnline
          ? 'Conexión a Internet activa: enlaces externos (Canva, Slides) y visor web disponibles.'
          : 'Modo Offline: Priorice el uso de presentaciones locales (PDF) ya que la red externa no está disponible.'
      }
      arrow
    >
      <Chip
        icon={isOnline ? <WifiIcon /> : <WifiOffIcon />}
        label={isOnline ? 'En Línea' : 'Modo Offline'}
        size="small"
        sx={{
          fontWeight: 600,
          backgroundColor: isOnline ? '#2e7d32' : '#ed6c02',
          color: '#ffffff',
          '& .MuiChip-icon': {
            color: '#ffffff',
          },
        }}
      />
    </Tooltip>
  );
};

export default NetworkStatusBadge;
