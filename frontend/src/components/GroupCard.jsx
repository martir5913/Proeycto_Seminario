import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import LinkIcon from '@mui/icons-material/Link';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

export const GroupCard = ({ group, onProject, onStatusChange, onDelete }) => {
  const isPdf =
    group.presentation_type === 'file' &&
    (group.original_name?.toLowerCase().endsWith('.pdf') || group.mime_type === 'application/pdf');
  const isPptx =
    group.presentation_type === 'file' &&
    (group.original_name?.toLowerCase().endsWith('.pptx') || group.original_name?.toLowerCase().endsWith('.ppt'));
  const isLink = group.presentation_type === 'link';

  const getStatusColor = (status) => {
    switch (status) {
      case 'presenting':
        return { label: 'En Exposición', color: '#ed6c02', bg: '#fff4e5' };
      case 'completed':
        return { label: 'Concluido', color: '#2e7d32', bg: '#edf7ed' };
      default:
        return { label: 'Pendiente', color: '#002B49', bg: '#e6edf2' };
    }
  };

  const statusInfo = getStatusColor(group.status);

  return (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderLeft: `6px solid ${group.status === 'presenting' ? '#D32F2F' : '#002B49'}`,
        transition: 'all 0.2s ease',
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        {/* Cabecera de la Tarjeta */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                backgroundColor: '#002B49',
                color: '#fff',
                px: 1.2,
                py: 0.3,
                borderRadius: 1.5,
                fontWeight: 800,
                fontSize: '0.85rem',
              }}
            >
              #{group.group_number}
            </Box>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 700, color: '#002B49' }}>
              {group.group_name}
            </Typography>
          </Box>

          <Chip
            label={statusInfo.label}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              color: statusInfo.color,
              backgroundColor: statusInfo.bg,
            }}
          />
        </Box>

        {/* Tema de Exposición */}
        <Typography variant="body2" sx={{ color: '#C5A059', fontWeight: 600, mb: 1.5 }}>
          {group.topic}
        </Typography>

        {/* Tipo de Material */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {isPdf && (
            <Chip
              icon={<PictureAsPdfIcon fontSize="small" sx={{ color: '#D32F2F !important' }} />}
              label="Documento PDF Local"
              size="small"
              variant="outlined"
              sx={{ borderColor: '#D32F2F', color: '#D32F2F', fontWeight: 500 }}
            />
          )}
          {isPptx && (
            <Chip
              icon={<SlideshowIcon fontSize="small" sx={{ color: '#D24726 !important' }} />}
              label="Presentación PowerPoint"
              size="small"
              variant="outlined"
              sx={{ borderColor: '#D24726', color: '#D24726', fontWeight: 500 }}
            />
          )}
          {isLink && (
            <Chip
              icon={<LinkIcon fontSize="small" sx={{ color: '#1B4965 !important' }} />}
              label="Enlace Externo (Canva/Slides)"
              size="small"
              variant="outlined"
              sx={{ borderColor: '#1B4965', color: '#1B4965', fontWeight: 500 }}
            />
          )}
        </Box>

        {/* Integrantes */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', mb: 0.5 }}>
            Integrantes:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {group.members && group.members.length > 0 ? (
              group.members.map((member, idx) => (
                <Chip
                  key={idx}
                  icon={<PersonIcon fontSize="small" />}
                  label={member}
                  size="small"
                  sx={{ backgroundColor: '#f1f5f9', color: '#334155', fontSize: '0.75rem' }}
                />
              ))
            ) : (
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Sin integrantes registrados
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>

      {/* Botones de Acción */}
      <CardActions sx={{ px: 2, pb: 2, pt: 0, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          size="medium"
          startIcon={<PlayCircleFilledIcon />}
          onClick={() => onProject(group)}
          sx={{
            backgroundColor: '#002B49',
            fontWeight: 700,
            flex: 1,
            mr: 1,
            '&:hover': { backgroundColor: '#1B4965' },
          }}
        >
          Proyectar
        </Button>

        <Tooltip title={group.status === 'completed' ? 'Marcar como Pendiente' : 'Marcar como Concluido'}>
          <IconButton
            size="small"
            onClick={() =>
              onStatusChange(group.id, group.status === 'completed' ? 'pending' : 'completed')
            }
            sx={{
              color: group.status === 'completed' ? '#2e7d32' : '#94a3b8',
              backgroundColor: '#f8fafc',
            }}
          >
            <CheckCircleIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Eliminar Grupo">
          <IconButton
            size="small"
            onClick={() => onDelete(group.id)}
            sx={{ color: '#ef5350', backgroundColor: '#f8fafc' }}
          >
            <DeleteOutlineIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default GroupCard;
