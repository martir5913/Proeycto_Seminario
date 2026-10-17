import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

export const RegistrationModal = ({ open, onClose, onGroupCreated }) => {
  const [groupNumber, setGroupNumber] = useState('');
  const [groupName, setGroupName] = useState('');
  const [topic, setTopic] = useState('');
  const [career, setCareer] = useState('Ingeniería en Sistemas');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [members, setMembers] = useState([]);
  const [currentMember, setCurrentMember] = useState('');
  const [presentationType, setPresentationType] = useState('file'); // 'file' | 'link'
  const [selectedFile, setSelectedFile] = useState(null);
  const [externalUrl, setExternalUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddMember = () => {
    if (currentMember.trim()) {
      setMembers([...members, currentMember.trim()]);
      setCurrentMember('');
    }
  };

  const handleRemoveMember = (indexToRemove) => {
    setMembers(members.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setErrorMsg('El archivo seleccionado supera el límite máximo permitido de 50MB.');
        return;
      }
      setSelectedFile(file);
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!groupNumber || !groupName || !topic) {
      setErrorMsg('Por favor complete los campos obligatorios: Número, Nombre de Grupo y Tema.');
      return;
    }

    if (presentationType === 'file' && !selectedFile) {
      setErrorMsg('Debe adjuntar un archivo de presentación (.pdf o .pptx).');
      return;
    }

    if (presentationType === 'link' && !externalUrl.trim()) {
      setErrorMsg('Debe ingresar un enlace válido a la presentación (Canva, Slides o Prezi).');
      return;
    }

    const formData = new FormData();
    formData.append('group_number', groupNumber);
    formData.append('group_name', groupName);
    formData.append('topic', topic);
    formData.append('career', career);
    formData.append('duration_minutes', durationMinutes);
    formData.append('members', JSON.stringify(members));
    formData.append('presentation_type', presentationType);

    if (presentationType === 'file') {
      formData.append('file', selectedFile);
    } else {
      formData.append('external_url', externalUrl.trim());
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/groups', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        onGroupCreated(response.data.data);
        handleClose();
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 'Error al registrar el grupo. Revise los datos e intente de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setGroupNumber('');
    setGroupName('');
    setTopic('');
    setMembers([]);
    setCurrentMember('');
    setSelectedFile(null);
    setExternalUrl('');
    setErrorMsg('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ backgroundColor: '#002B49', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Registro de Grupo de Exposición
        </Typography>
        <IconButton onClick={handleClose} sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3 }}>
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="No. de Grupo *"
              type="number"
              value={groupNumber}
              onChange={(e) => setGroupNumber(e.target.value)}
              sx={{ width: '130px' }}
              required
            />
            <TextField
              label="Nombre del Grupo *"
              fullWidth
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Ej. Grupo Los Innovadores"
              required
            />
          </Box>

          <TextField
            label="Tema de la Exposición *"
            fullWidth
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ej. Arquitectura de Microservicios en la Nube"
            sx={{ mb: 2 }}
            required
          />

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Carrera / Especialidad"
              fullWidth
              value={career}
              onChange={(e) => setCareer(e.target.value)}
            />
            <TextField
              label="Minutos *"
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              sx={{ width: '120px' }}
            />
          </Box>

          {/* Integrantes Dinámicos */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#002B49' }}>
              Integrantes del Grupo
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Nombre y Apellido del Estudiante"
                value={currentMember}
                onChange={(e) => setCurrentMember(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMember();
                  }
                }}
              />
              <Button
                variant="outlined"
                onClick={handleAddMember}
                startIcon={<AddIcon />}
                sx={{ borderColor: '#002B49', color: '#002B49', minWidth: '110px' }}
              >
                Agregar
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {members.map((m, idx) => (
                <Chip
                  key={idx}
                  label={m}
                  onDelete={() => handleRemoveMember(idx)}
                  size="small"
                  sx={{ backgroundColor: '#E2E8F0', color: '#1E293B' }}
                />
              ))}
            </Box>
          </Box>

          {/* Selector de Tipo de Material */}
          <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
            <FormLabel component="legend" sx={{ fontWeight: 700, color: '#002B49', mb: 1 }}>
              Modalidad de Presentación *
            </FormLabel>
            <RadioGroup
              row
              value={presentationType}
              onChange={(e) => setPresentationType(e.target.value)}
            >
              <FormControlLabel
                value="file"
                control={<Radio color="primary" />}
                label="Cargar Archivo (PDF / PPTX)"
              />
              <FormControlLabel
                value="link"
                control={<Radio color="primary" />}
                label="Enlace Externo (Canva / Slides)"
              />
            </RadioGroup>
          </FormControl>

          {/* Opción A: Subida de Archivo */}
          {presentationType === 'file' ? (
            <Box
              sx={{
                border: '2px dashed #CBD5E1',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                backgroundColor: '#F8FAFC',
                '&:hover': { borderColor: '#002B49' },
              }}
            >
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.pptx,.ppt,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                <CloudUploadIcon sx={{ fontSize: 40, color: '#002B49', mb: 1 }} />
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#002B49' }}>
                  {selectedFile ? selectedFile.name : 'Haga clic para seleccionar archivo PDF o PowerPoint'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
                  Tamaño máximo: 50MB (Recomendado PDF para proyección fluida offline)
                </Typography>
              </label>
            </Box>
          ) : (
            <TextField
              label="URL de Presentación Externa *"
              fullWidth
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://www.canva.com/design/... o Google Slides"
              helperText="El sistema adaptará automáticamente el enlace para modo presentación embebida."
            />
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={loading} sx={{ color: '#64748B' }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: '#002B49',
              fontWeight: 700,
              px: 3,
              '&:hover': { backgroundColor: '#1B4965' },
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Registrar Grupo'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RegistrationModal;
