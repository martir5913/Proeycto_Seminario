import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  Button,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export const TimerControl = ({ initialMinutes = 15, onTimeEnd }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    setSecondsLeft(initialMinutes * 60);
    setIsActive(false);
  }, [initialMinutes]);

  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
      if (onTimeEnd) onTimeEnd();
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, onTimeEnd]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(initialMinutes * 60);
  };

  const addMinute = () => setSecondsLeft((prev) => prev + 60);
  const removeMinute = () => setSecondsLeft((prev) => Math.max(0, prev - 60));

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determinar color de alerta:
  // Verde: > 3 minutos
  // Naranja: <= 3 minutos
  // Rojo: 0 minutos
  const getTimerColor = () => {
    if (secondsLeft === 0) return '#d32f2f';
    if (secondsLeft <= 180) return '#ed6c02';
    return '#2e7d32';
  };

  return (
    <Paper
      elevation={2}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 0.75,
        borderRadius: 3,
        border: `2px solid ${getTimerColor()}`,
        backgroundColor: '#ffffff',
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          variant="h6"
          component="span"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 800,
            fontSize: '1.4rem',
            color: getTimerColor(),
            letterSpacing: '1px',
          }}
        >
          {formatTime(secondsLeft)}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title={isActive ? 'Pausar' : 'Iniciar'}>
          <IconButton
            size="small"
            onClick={toggleTimer}
            color={isActive ? 'warning' : 'primary'}
            sx={{ backgroundColor: '#f0f4f8' }}
          >
            {isActive ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Reiniciar">
          <IconButton size="small" onClick={resetTimer} sx={{ backgroundColor: '#f0f4f8' }}>
            <ReplayIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="+1 Minuto">
          <IconButton size="small" onClick={addMinute} sx={{ backgroundColor: '#f0f4f8' }}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="-1 Minuto">
          <IconButton size="small" onClick={removeMinute} sx={{ backgroundColor: '#f0f4f8' }}>
            <RemoveIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default TimerControl;
