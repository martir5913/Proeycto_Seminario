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
        return { label: 'En Exposición', color: '#ed6c02', bg: '#FFF7ED', border: '#FED7AA' };
      case 'completed':
        return { label: 'Concluido', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' };
      default:
        return { label: 'Pendiente', color: '#475569', bg: '#F8FAFC', border: '#E2E8F0' };
    }
  };

  const statusInfo = getStatusColor(group.status);

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 2,
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 16px 32px rgba(0, 43, 73, 0.12)',
          borderColor: '#C5A059',
        },
      }}
    >
      <CardContent sx={{ p: 2.8, pb: 1 }}>
        {/* Cabecera de la Tarjeta */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #002B49 0%, #1B4965 100%)',
                color: '#fff',
                px: 1.25,
                py: 0.4,
                borderRadius: 1.5,
                fontWeight: 800,
                fontSize: '0.8rem',
                letterSpacing: '0.5px',
              }}
            >
              GRUPO {group.group_number}
            </Box>
            <Typography variant="caption" sx={{ color: '#002B49', fontWeight: 700 }}>
              {group.duration_minutes || 15} min
            </Typography>
          </Box>

          <Chip
            label={statusInfo.label}
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: '0.75rem',
              color: statusInfo.color,
              backgroundColor: statusInfo.bg,
              border: `1px solid ${statusInfo.border}`,
            }}
          />
        </Box>

        {/* Nombre del Grupo */}
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 800,
            color: '#002B49',
            lineHeight: 1.3,
            mb: 0.8,
          }}
        >
          {group.group_name}
        </Typography>

        {/* Tema de Exposición */}
        <Typography
          variant="body2"
          sx={{
            color: '#78350F',
            backgroundColor: '#FEF3C7',
            border: '1px solid #FDE68A',
            display: 'inline-block',
            px: 1.25,
            py: 0.4,
            borderRadius: 1.5,
            fontWeight: 800,
            fontSize: '0.8rem',
            mb: 2,
          }}
        >
          {group.topic}
        </Typography>

        {/* Tipo de Material */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {isPdf && (
            <Chip
              icon={<PictureAsPdfIcon fontSize="small" sx={{ color: '#DC2626 !important' }} />}
              label="Documento PDF"
              size="small"
              sx={{ backgroundColor: '#FEF2F2', color: '#DC2626', fontWeight: 600, border: '1px solid #FECACA' }}
            />
          )}
          {isPptx && (
            <Chip
              icon={<SlideshowIcon fontSize="small" sx={{ color: '#EA580C !important' }} />}
              label="Diapositivas PowerPoint"
              size="small"
              sx={{ backgroundColor: '#FFF7ED', color: '#EA580C', fontWeight: 600, border: '1px solid #FFEDD5' }}
            />
          )}
          {isLink && (
            <Chip
              icon={<LinkIcon fontSize="small" sx={{ color: '#2563EB !important' }} />}
              label="Enlace Canva / Google Slides"
              size="small"
              sx={{ backgroundColor: '#EFF6FF', color: '#2563EB', fontWeight: 600, border: '1px solid #DBEAFE' }}
            />
          )}
        </Box>

        {/* Integrantes */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" sx={{ color: '#002B49', fontWeight: 800, display: 'block', mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.72rem' }}>
            Integrantes
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {group.members && group.members.length > 0 ? (
              group.members.map((member, idx) => (
                <Chip
                  key={idx}
                  icon={<PersonIcon fontSize="small" sx={{ color: '#002B49 !important' }} />}
                  label={member}
                  size="small"
                  sx={{ backgroundColor: '#F1F5F9', color: '#002B49', fontWeight: 600, fontSize: '0.74rem', border: '1px solid #CBD5E1' }}
                />
              ))
            ) : (
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 500 }}>
                Sin integrantes registrados
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>

      {/* Botones de Acción */}
      <CardActions sx={{ px: 2.8, pb: 2.8, pt: 1, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          size="medium"
          startIcon={<PlayCircleFilledIcon />}
          onClick={() => onProject(group)}
          sx={{
            background: 'linear-gradient(135deg, #002B49 0%, #00192D 100%)',
            color: '#FFFFFF',
            fontWeight: 800,
            borderRadius: 1.5,
            py: 0.9,
            flex: 1,
            mr: 1.5,
            boxShadow: '0 4px 12px rgba(0, 43, 73, 0.2)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1B4965 0%, #002B49 100%)',
              boxShadow: '0 6px 16px rgba(0, 43, 73, 0.3)',
            },
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
              color: group.status === 'completed' ? '#16A34A' : '#94A3B8',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              '&:hover': { backgroundColor: '#F1F5F9' },
            }}
          >
            <CheckCircleIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Eliminar Grupo">
          <IconButton
            size="small"
            onClick={() => onDelete(group.id)}
            sx={{
              color: '#EF4444',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              '&:hover': { backgroundColor: '#FEE2E2' },
            }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default GroupCard;
