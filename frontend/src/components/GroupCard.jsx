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
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export const GroupCard = ({ group, onProject, onStatusChange, onDelete }) => {
  const isPdf =
    group.presentation_type === 'file' &&
    (group.original_name?.toLowerCase().endsWith('.pdf') || group.mime_type === 'application/pdf');
  const isPptx =
    group.presentation_type === 'file' &&
    (group.original_name?.toLowerCase().endsWith('.pptx') || group.original_name?.toLowerCase().endsWith('.ppt'));
  const isLink = group.presentation_type === 'link';
  const isCanva =
    isLink &&
    (group.external_url?.toLowerCase().includes('canva.com') ||
      group.external_url?.toLowerCase().includes('canva.link'));

  const hasMaterial =
    (group.presentation_type === 'file' && group.file_path) ||
    (group.presentation_type === 'link' && group.external_url);

  const getStatusColor = (status) => {
    switch (status) {
      case 'presenting':
        return { label: 'En Exposición', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' };
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
        borderRadius: '12px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 16px rgba(0, 43, 73, 0.05)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 16px 32px rgba(0, 43, 73, 0.12)',
          borderColor: '#C5A059',
        },
      }}
    >
      <CardContent sx={{ p: 2.8, pb: 1 }}>
        {/* Cabecera de la Tarjeta */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #002B49 0%, #00192D 100%)',
                color: '#C5A059',
                px: 1.25,
                py: 0.4,
                borderRadius: '6px',
                fontWeight: 900,
                fontSize: '0.8rem',
                letterSpacing: '0.5px',
                border: '1px solid rgba(197, 160, 89, 0.35)',
              }}
            >
              GRUPO {group.group_number}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: '#64748B' }}>
              <AccessTimeIcon sx={{ fontSize: '0.85rem' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.78rem' }}>
                {group.duration_minutes || 10} min
              </Typography>
            </Box>
          </Box>

          <Chip
            label={statusInfo.label}
            size="small"
            sx={{
              fontWeight: 900,
              fontSize: '0.74rem',
              color: statusInfo.color,
              backgroundColor: statusInfo.bg,
              border: `1px solid ${statusInfo.border}`,
              borderRadius: '6px',
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
            fontSize: '1.05rem',
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
            borderRadius: '6px',
            fontWeight: 800,
            fontSize: '0.8rem',
            mb: 2,
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {group.topic}
        </Typography>

        {/* Tipo de Material de Presentación */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {isCanva && (
            <Chip
              icon={<AutoAwesomeIcon fontSize="small" sx={{ color: '#00C4CC !important' }} />}
              label="Presentación Canva"
              size="small"
              sx={{
                background: 'linear-gradient(135deg, rgba(125, 42, 232, 0.12) 0%, rgba(0, 196, 204, 0.15) 100%)',
                color: '#6B21A8',
                fontWeight: 900,
                fontSize: '0.75rem',
                border: '1px solid rgba(125, 42, 232, 0.35)',
                borderRadius: '6px',
              }}
            />
          )}

          {isLink && !isCanva && (
            <Chip
              icon={<LinkIcon fontSize="small" sx={{ color: '#2563EB !important' }} />}
              label="Enlace Web / Diapositivas"
              size="small"
              sx={{
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                fontWeight: 800,
                fontSize: '0.75rem',
                border: '1px solid #DBEAFE',
                borderRadius: '6px',
              }}
            />
          )}

          {isPdf && (
            <Chip
              icon={<PictureAsPdfIcon fontSize="small" sx={{ color: '#DC2626 !important' }} />}
              label="Documento PDF"
              size="small"
              sx={{
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                fontWeight: 800,
                fontSize: '0.75rem',
                border: '1px solid #FECACA',
                borderRadius: '6px',
              }}
            />
          )}

          {isPptx && (
            <Chip
              icon={<SlideshowIcon fontSize="small" sx={{ color: '#EA580C !important' }} />}
              label="PowerPoint (PPTX)"
              size="small"
              sx={{
                backgroundColor: '#FFF7ED',
                color: '#EA580C',
                fontWeight: 800,
                fontSize: '0.75rem',
                border: '1px solid #FFEDD5',
                borderRadius: '6px',
              }}
            />
          )}

          {!hasMaterial && (
            <Chip
              label="Material Pendiente"
              size="small"
              sx={{
                backgroundColor: '#F1F5F9',
                color: '#64748B',
                fontWeight: 800,
                fontSize: '0.74rem',
                border: '1px dashed #CBD5E1',
                borderRadius: '6px',
              }}
            />
          )}
        </Box>

        {/* Integrantes */}
        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant="caption"
            sx={{
              color: '#002B49',
              fontWeight: 800,
              display: 'block',
              mb: 0.75,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.72rem',
            }}
          >
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
                  sx={{
                    backgroundColor: '#F8FAFC',
                    color: '#002B49',
                    fontWeight: 700,
                    fontSize: '0.74rem',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                  }}
                />
              ))
            ) : (
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                Sin integrantes registrados
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>

      {/* Botones de Acción */}
      <CardActions sx={{ px: 2.8, pb: 2.8, pt: 1, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
        <Button
          variant="contained"
          size="medium"
          startIcon={<PlayCircleFilledIcon />}
          onClick={() => onProject(group)}
          disabled={!hasMaterial}
          sx={{
            background: hasMaterial
              ? 'linear-gradient(135deg, #002B49 0%, #00192D 100%)'
              : '#E2E8F0',
            color: hasMaterial ? '#C5A059' : '#94A3B8',
            fontWeight: 800,
            borderRadius: '8px',
            py: 0.9,
            flex: 1,
            boxShadow: hasMaterial ? '0 4px 12px rgba(0, 43, 73, 0.2)' : 'none',
            border: hasMaterial ? '1px solid rgba(197, 160, 89, 0.3)' : 'none',
            '&:hover': {
              background: 'linear-gradient(135deg, #003865 0%, #002B49 100%)',
              color: '#FFFFFF',
              boxShadow: '0 6px 16px rgba(0, 43, 73, 0.3)',
            },
            '&.Mui-disabled': {
              backgroundColor: '#F1F5F9',
              color: '#94A3B8',
            },
          }}
        >
          {hasMaterial ? 'Proyectar' : 'Sin Material'}
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
              borderRadius: '8px',
              p: 0.9,
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
              borderRadius: '8px',
              p: 0.9,
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
