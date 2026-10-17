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
      setDurationMinutes(group.duration_minutes || 15);
      setMembers(Array.isArray(group.members) ? group.members : []);
      setPresentationType(group.presentation_type || 'file');
      setExternalUrl(group.external_url || '');
      setSelectedFile(null);
      setErrorMsg('');
    }
  }, [group]);

  const handleAddMember = () => {
    if (currentMember.trim()) {
      setMembers([...members, currentMember.trim()]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!group) return;

    if (!groupNumber || !groupName || !topic) {
      setErrorMsg('Número, Nombre de Grupo y Tema son obligatorios.');
      return;
    }

    if (presentationType === 'link' && !externalUrl.trim()) {
      setErrorMsg('Debe ingresar un enlace válido a la presentación.');
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
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
    } else {
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
      setErrorMsg(err.response?.data?.message || 'Error al actualizar el grupo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ backgroundColor: '#002B49', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Editar Grupo #{group?.group_number}: {group?.group_name}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#fff' }}>
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
              label="No. de Grupo"
              type="number"
              value={groupNumber}
              onChange={(e) => setGroupNumber(e.target.value)}
              required
              sx={{ width: '130px' }}
            />
            <TextField
              label="Nombre del Grupo o Proyecto"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
              fullWidth
            />
          </Box>

          <TextField
            label="Tema de Investigación / Tesis"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            fullWidth
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Carrera / Facultad"
              value={career}
              onChange={(e) => setCareer(e.target.value)}
              fullWidth
            />
            <TextField
              label="Tiempo (minutos)"
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              sx={{ width: '150px' }}
            />
          </Box>

          {/* Gestión de Integrantes */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>
              Integrantes del Grupo
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, mb: 1 }}>
              <TextField
                size="small"
                placeholder="Nombre del estudiante"
                value={currentMember}
                onChange={(e) => setCurrentMember(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMember();
                  }
                }}
                fullWidth
              />
              <Button variant="outlined" onClick={handleAddMember} startIcon={<AddIcon />}>
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
                  sx={{ backgroundColor: '#EEF2F6', fontWeight: 600 }}
                />
              ))}
            </Box>
          </Box>

          {/* Tipo de Presentación */}
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Tipo de Material a Proyectar</FormLabel>
            <RadioGroup row value={presentationType} onChange={(e) => setPresentationType(e.target.value)}>
              <FormControlLabel value="file" control={<Radio />} label="Archivo Local (.pdf / .pptx)" />
              <FormControlLabel value="link" control={<Radio />} label="Enlace Web (Canva / Slides)" />
            </RadioGroup>
          </FormControl>

          {presentationType === 'file' ? (
            <Box sx={{ p: 2, border: '1px dashed #CBD5E1', borderRadius: 2, textAlign: 'center' }}>
              {group?.presentation_type === 'file' && !selectedFile && (
                <Typography variant="body2" sx={{ color: '#002B49', fontWeight: 600, mb: 1 }}>
                  Archivo actual: {group?.original_name || 'Presentación guardada'}
                </Typography>
              )}
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 1 }}
              >
                {selectedFile ? 'Cambiar Archivo' : 'Subir Nuevo Archivo'}
                <input type="file" hidden accept=".pdf,.pptx,.ppt" onChange={handleFileChange} />
              </Button>
              {selectedFile && (
                <Typography variant="body2" sx={{ color: '#16A34A', fontWeight: 700 }}>
                  Nuevo archivo seleccionado: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </Typography>
              )}
            </Box>
          ) : (
            <TextField
              label="URL de Canva, Google Slides o Prezi"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://www.canva.com/design/... o similar"
              fullWidth
            />
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: '#002B49',
              color: '#fff',
              fontWeight: 700,
              '&:hover': { backgroundColor: '#001A2C' },
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditGroupModal;
