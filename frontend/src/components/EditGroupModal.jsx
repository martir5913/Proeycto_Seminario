import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import LinkIcon from '@mui/icons-material/Link';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';

export const EditGroupModal = ({ open, group, onClose, onGroupUpdated }) => {
  const [groupNumber, setGroupNumber] = useState('');
  const [groupName, setGroupName] = useState('');
  const [topic, setTopic] = useState('');
  const [career, setCareer] = useState('Ingeniería en Sistemas');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [members, setMembers] = useState([]);
  const [currentMember, setCurrentMember] = useState('');
  const [presentationType, setPresentationType] = useState('file');
  const [selectedFile, setSelectedFile] = useState(null);
  const [externalUrl, setExternalUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (group) {
      setGroupNumber(group.group_number || '');
      setGroupName(group.group_name || '');
      setTopic(group.topic || '');
      setCareer(group.career || 'Ingeniería en Sistemas');
      setDurationMinutes(group.duration_minutes || 10);
      setMembers(Array.isArray(group.members) ? group.members : []);
      setPresentationType(group.presentation_type || 'file');
      setExternalUrl(group.external_url || '');
      setSelectedFile(null);
      setErrorMsg('');
    }
  }, [group]);

  const handleAddMember = () => {
    if (currentMember.trim()) {
      if (!members.includes(currentMember.trim())) {
        setMembers([...members, currentMember.trim()]);
      }
      setCurrentMember('');
    }
  };

  const handleRemoveMember = (idxToRemove) => {
    setMembers(members.filter((_, idx) => idx !== idxToRemove));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setErrorMsg('El archivo seleccionado supera el límite máximo de 50MB.');
        return;
      }
      setSelectedFile(file);
      setErrorMsg('');
    }
  };

  const isCanvaLink = externalUrl.toLowerCase().includes('canva.');
  const isGoogleSlidesLink = externalUrl.toLowerCase().includes('docs.google.com/presentation');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!group) return;

    if (!groupNumber || !groupName.trim() || !topic.trim()) {
      setErrorMsg('Número, Nombre de Grupo y Tema son obligatorios.');
      return;
    }

    if (presentationType === 'link' && !externalUrl.trim()) {
      setErrorMsg('Debe ingresar un enlace válido a la presentación.');
      return;
    }

    const formData = new FormData();
    formData.append('group_number', groupNumber);
    formData.append('group_name', groupName.trim());
    formData.append('topic', topic.trim());
    formData.append('career', career.trim());
    formData.append('duration_minutes', durationMinutes);
    formData.append('members', JSON.stringify(members));
    formData.append('presentation_type', presentationType);

    if (presentationType === 'file' && selectedFile) {
      formData.append('file', selectedFile);
    } else if (presentationType === 'link') {
      formData.append('external_url', externalUrl.trim());
    }

    try {
      setLoading(true);
      const res = await axios.put(`/api/groups/${group.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        onGroupUpdated(res.data.data);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error al actualizar grupo.');
    } finally {
      setLoading(false);
    }
  };

  if (!group) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
        sx: {
          borderRadius: 3,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0, 43, 73, 0.25)',
        },
      }}
    >
      <DialogTitle
        sx={{
          flexShrink: 0,
          backgroundColor: '#002B49',
          color: '#fff',
          py: 2,
          px: 3,
          borderBottom: '3px solid #C5A059',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              backgroundColor: '#D32F2F',
              color: '#FFFFFF',
              px: 1.2,
              py: 0.3,
              borderRadius: 1.5,
              fontWeight: 900,
              fontSize: '0.8rem',
              letterSpacing: '0.5px',
            }}
          >
            EDITAR GRUPO #{group.group_number}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Editar Grupo & Material de Exposición
            </Typography>
            <Typography variant="caption" sx={{ color: '#E2E8F0', fontSize: '0.78rem' }}>
              Actualice los datos o reemplace el archivo o enlace de la presentación
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={onClose} size="small" sx={{ color: '#fff', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ flex: '1 1 auto', overflowY: 'auto', p: { xs: 2.5, md: 3.5 }, backgroundColor: '#F8FAFC' }}>
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {errorMsg}
            </Alert>
          )}

          {/* SECCIÓN 1: DATOS BÁSICOS */}
          <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: 2.5, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#002B49' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#002B49', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                1. Datos del Grupo y Proyecto
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
              <Box sx={{ width: { xs: '100%', sm: '140px' } }}>
                <TextField
                  label="No. de Grupo *"
                  type="number"
                  value={groupNumber}
                  onChange={(e) => setGroupNumber(e.target.value)}
                  fullWidth
                  required
                  inputProps={{ min: 1 }}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <TextField
                  label="Nombre del Grupo *"
                  fullWidth
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                />
              </Box>
            </Box>

            <TextField
              label="Tema o Título del Proyecto de Graduación *"
              fullWidth
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              sx={{ mb: 2 }}
              required
            />

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
              <TextField
                label="Facultad / Carrera"
                fullWidth
                value={career}
                onChange={(e) => setCareer(e.target.value)}
              />

              <Box sx={{ minWidth: 200, width: { xs: '100%', sm: 'auto' } }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#002B49', display: 'block', mb: 0.5 }}>
                  Tiempo de Exposición:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {[10, 15, 20].map((mins) => (
                    <Chip
                      key={mins}
                      label={`${mins} min`}
                      onClick={() => setDurationMinutes(mins)}
                      variant={durationMinutes === mins ? 'filled' : 'outlined'}
                      sx={{
                        fontWeight: 800,
                        backgroundColor: durationMinutes === mins ? '#002B49' : 'transparent',
                        color: durationMinutes === mins ? '#FFFFFF' : '#002B49',
                        borderColor: '#002B49',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* SECCIÓN 2: INTEGRANTES */}
          <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: 2.5, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#002B49' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#002B49', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  2. Integrantes que Exponen ({members.length})
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Nombre del estudiante"
                value={currentMember}
                onChange={(e) => setCurrentMember(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMember();
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleAddMember}
                startIcon={<AddIcon />}
                disabled={!currentMember.trim()}
                sx={{
                  backgroundColor: '#002B49',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  minWidth: '110px',
                  '&:hover': { backgroundColor: '#1B4965' },
                }}
              >
                Añadir
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, minHeight: 32, p: 1, backgroundColor: '#F8FAFC', borderRadius: 2, border: '1px dashed #CBD5E1' }}>
              {members.length > 0 ? (
                members.map((m, idx) => (
                  <Chip
                    key={idx}
                    icon={<PersonIcon fontSize="small" sx={{ color: '#002B49 !important' }} />}
                    label={m}
                    onDelete={() => handleRemoveMember(idx)}
                    size="small"
                    sx={{
                      backgroundColor: '#FFFFFF',
                      color: '#002B49',
                      fontWeight: 700,
                      border: '1px solid #CBD5E1',
                    }}
                  />
                ))
              ) : (
                <Typography variant="caption" sx={{ color: '#94A3B8', p: 0.5, fontStyle: 'italic' }}>
                  Sin integrantes registrados.
                </Typography>
              )}
            </Box>
          </Paper>

          {/* SECCIÓN 3: MATERIAL DE EXPOSICIÓN */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#002B49' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#002B49', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                3. Material de Exposición
              </Typography>
            </Box>

            {/* Dos Tarjetas Interactivas */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2.5 }}>
              <Box
                onClick={() => setPresentationType('file')}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: presentationType === 'file' ? '2.5px solid #002B49' : '1px solid #CBD5E1',
                  backgroundColor: presentationType === 'file' ? 'rgba(0, 43, 73, 0.04)' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: '#002B49' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <Box sx={{ p: 1, borderRadius: 1.5, backgroundColor: presentationType === 'file' ? '#002B49' : '#EEF2F6', color: presentationType === 'file' ? '#fff' : '#002B49' }}>
                    <PictureAsPdfIcon fontSize="small" />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#002B49' }}>
                    Archivo Local (Offline)
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                  PowerPoint (.pptx) o PDF local.
                </Typography>
              </Box>

              <Box
                onClick={() => setPresentationType('link')}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: presentationType === 'link' ? '2.5px solid #002B49' : '1px solid #CBD5E1',
                  backgroundColor: presentationType === 'link' ? 'rgba(0, 43, 73, 0.04)' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: '#002B49' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <Box sx={{ p: 1, borderRadius: 1.5, backgroundColor: presentationType === 'link' ? '#002B49' : '#EEF2F6', color: presentationType === 'link' ? '#fff' : '#002B49' }}>
                    <LinkIcon fontSize="small" />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#002B49' }}>
                    Enlace Web (Canva / Slides)
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                  Canva (canva.link o directo) o Google Slides.
                </Typography>
              </Box>
            </Box>

            {presentationType === 'file' ? (
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: selectedFile ? '#2E7D32' : '#CBD5E1',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: selectedFile ? '#F0FDF4' : '#F8FAFC',
                }}
              >
                <input
                  type="file"
                  id="edit-file-upload"
                  accept=".pdf,.pptx,.ppt,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="edit-file-upload" style={{ cursor: 'pointer', display: 'block' }}>
                  {selectedFile ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <CheckCircleOutlineIcon sx={{ fontSize: 40, color: '#2E7D32' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#166534' }}>
                        Nuevo archivo: {selectedFile.name}
                      </Typography>
                      <Button size="small" variant="outlined" sx={{ mt: 1, color: '#002B49' }}>
                        Cambiar Archivo
                      </Button>
                    </Box>
                  ) : group.original_name ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {group.original_name.endsWith('.pdf') ? (
                          <PictureAsPdfIcon sx={{ color: '#DC2626', fontSize: 32 }} />
                        ) : (
                          <SlideshowIcon sx={{ color: '#EA580C', fontSize: 32 }} />
                        )}
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#002B49' }}>
                          Archivo actual: {group.original_name}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Haga clic aquí si desea reemplazarlo por un nuevo archivo PowerPoint o PDF
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <CloudUploadIcon sx={{ fontSize: 40, color: '#002B49' }} />
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#002B49' }}>
                        Seleccione un archivo (.pdf o .pptx)
                      </Typography>
                    </Box>
                  )}
                </label>
              </Box>
            ) : (
              <Box>
                <TextField
                  label="URL o Enlace de la Presentación *"
                  fullWidth
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://canva.link/... o https://www.canva.com/design/... o Google Slides"
                  helperText="Pegue cualquier enlace de Canva o Google Slides. El servidor lo adaptará automáticamente para proyección."
                />

                {isCanvaLink && (
                  <Alert
                    severity="success"
                    icon={<AutoAwesomeIcon sx={{ color: '#0369A1' }} />}
                    sx={{ mt: 1.5, backgroundColor: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD' }}
                  >
                    <strong>🎨 Enlace de Canva Detectado:</strong> El sistema adaptará automáticamente el diseño para el modo presentación embebida.
                  </Alert>
                )}

                {isGoogleSlidesLink && (
                  <Alert
                    severity="info"
                    icon={<AutoAwesomeIcon sx={{ color: '#002B49' }} />}
                    sx={{ mt: 1.5, backgroundColor: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE' }}
                  >
                    <strong>📑 Google Slides Detectado:</strong> Se configurará en modo reproductor de diapositivas interactivo.
                  </Alert>
                )}

                {externalUrl.trim() && (
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      size="small"
                      startIcon={<OpenInNewIcon fontSize="small" />}
                      href={externalUrl.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: '#002B49', fontWeight: 700, textTransform: 'none', fontSize: '0.8rem' }}
                    >
                      Probar Enlace en Nueva Pestaña
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
      </DialogContent>

      <DialogActions
        sx={{
          flexShrink: 0,
          p: 2,
          px: 3.5,
          backgroundColor: '#FFFFFF',
          borderTop: '2px solid #E2E8F0',
          justifyContent: 'space-between',
          boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.06)',
          zIndex: 10,
        }}
      >
        <Button onClick={onClose} disabled={loading} sx={{ color: '#64748B', fontWeight: 700, textTransform: 'none' }}>
          Cancelar
        </Button>

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          sx={{
            backgroundColor: '#002B49',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.95rem',
            px: 3.5,
            py: 1.1,
            borderRadius: 2,
            boxShadow: '0 4px 14px rgba(0, 43, 73, 0.25)',
            textTransform: 'none',
            '&:hover': { backgroundColor: '#1B4965' },
          }}
        >
          {loading ? 'Guardando Cambios...' : 'Guardar Cambios del Grupo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditGroupModal;
