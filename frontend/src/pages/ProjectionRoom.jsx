import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';

import GroupCard from '../components/GroupCard';
import RegistrationModal from '../components/RegistrationModal';
import PresentationViewer from '../components/PresentationViewer';
import NetworkStatusBadge from '../components/NetworkStatusBadge';

export const ProjectionRoom = ({ onOpenAdmin }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modales y Proyección
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [projectingGroup, setProjectingGroup] = useState(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/groups');
      if (res.data.success) {
        setGroups(res.data.data);
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor local para obtener la lista de grupos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleGroupCreated = (newGroup) => {
    setGroups((prev) => [...prev, newGroup]);
  };

  const handleStatusChange = async (groupId, newStatus) => {
    try {
      await axios.patch(`/api/groups/${groupId}/status`, { status: newStatus });
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, status: newStatus } : g))
      );
    } catch (err) {
      alert('Error al actualizar estado del grupo');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm('¿Está seguro de eliminar este grupo y su presentación?')) {
      try {
        await axios.delete(`/api/groups/${groupId}`);
        setGroups((prev) => prev.filter((g) => g.id !== groupId));
      } catch (err) {
        alert('Error al eliminar el grupo');
      }
    }
  };

  // Filtrado de grupos
  const filteredGroups = groups.filter((g) => {
    const matchesSearch =
      g.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.group_number.toString().includes(searchTerm) ||
      (g.members && g.members.some((m) => m.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesStatus = statusFilter === 'all' || g.status === statusFilter;

    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'file' && g.presentation_type === 'file') ||
      (typeFilter === 'link' && g.presentation_type === 'link');

    return matchesSearch && matchesStatus && matchesType;
  });

  // Navegación entre grupos proyectados
  const currentProjectingIndex = projectingGroup
    ? filteredGroups.findIndex((g) => g.id === projectingGroup.id)
    : -1;

  const handleNextProjectingGroup = () => {
    if (currentProjectingIndex >= 0 && currentProjectingIndex < filteredGroups.length - 1) {
      setProjectingGroup(filteredGroups[currentProjectingIndex + 1]);
    }
  };

  const handlePrevProjectingGroup = () => {
    if (currentProjectingIndex > 0) {
      setProjectingGroup(filteredGroups[currentProjectingIndex - 1]);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', pb: 6 }}>
      {/* Barra Superior Institucional */}
      <Paper
        elevation={3}
        sx={{
          backgroundColor: '#002B49',
          color: '#fff',
          py: 2,
          px: { xs: 2, md: 4 },
          borderBottom: '4px solid #C5A059',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            component="img"
            src="/assets/umg-icon.svg"
            alt="Logo UMG"
            sx={{ width: 48, height: 48 }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '0.5px' }}>
              UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA
            </Typography>
            <Typography variant="caption" sx={{ color: '#C5A059', fontWeight: 600, fontSize: '0.85rem' }}>
              Campus Villa Nueva • Seminario de Graduación • Sala Central de Proyecciones
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NetworkStatusBadge />

          <Button
            variant="outlined"
            size="small"
            onClick={onOpenAdmin}
            startIcon={<FormatListNumberedIcon />}
            sx={{
              borderColor: '#C5A059',
              color: '#C5A059',
              fontWeight: 600,
              '&:hover': { borderColor: '#fff', color: '#fff' },
            }}
          >
            Orden de Exposición
          </Button>

          <Button
            variant="contained"
            size="small"
            onClick={() => setIsRegisterOpen(true)}
            startIcon={<AddCircleOutlineIcon />}
            sx={{
              backgroundColor: '#D32F2F',
              color: '#fff',
              fontWeight: 700,
              '&:hover': { backgroundColor: '#9A0007' },
            }}
          >
            Registrar Grupo
          </Button>
        </Box>
      </Paper>

      {/* Contenido Principal */}
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        {/* Barra de Filtros y Búsqueda */}
        <Paper elevation={1} sx={{ p: 2.5, mb: 4, borderRadius: 3, backgroundColor: '#ffffff' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por número de grupo, nombre, tema o integrante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#002B49' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={statusFilter}
                  label="Estado"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">Todos los estados</MenuItem>
                  <MenuItem value="pending">Pendiente</MenuItem>
                  <MenuItem value="presenting">En Exposición</MenuItem>
                  <MenuItem value="completed">Concluido</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={5} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Material</InputLabel>
                <Select
                  value={typeFilter}
                  label="Material"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="all">Todos los tipos</MenuItem>
                  <MenuItem value="file">Archivos Locales (PDF/PPTX)</MenuItem>
                  <MenuItem value="link">Enlaces Web (Canva/Slides)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={1} md={0.5} sx={{ textAlign: 'center' }}>
              <Tooltip title="Actualizar lista">
                <IconButton onClick={fetchGroups} sx={{ color: '#002B49' }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Paper>

        {/* Mensajes de Estado / Alertas */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Listado de Grupos en Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#002B49' }} />
          </Box>
        ) : filteredGroups.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, backgroundColor: '#ffffff' }}>
            <Typography variant="h6" sx={{ color: '#002B49', fontWeight: 700, mb: 1 }}>
              No se encontraron grupos registrados
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
              Haga clic en el botón de abajo para registrar el primer grupo y cargar sus diapositivas.
            </Typography>
            <Button
              variant="contained"
              onClick={() => setIsRegisterOpen(true)}
              startIcon={<AddCircleOutlineIcon />}
              sx={{ backgroundColor: '#002B49', fontWeight: 700 }}
            >
              Registrar Primer Grupo
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredGroups.map((group) => (
              <Grid item xs={12} sm={6} md={4} key={group.id}>
                <GroupCard
                  group={group}
                  onProject={(grp) => setProjectingGroup(grp)}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteGroup}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Modal de Registro */}
      <RegistrationModal
        open={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onGroupCreated={handleGroupCreated}
      />

      {/* Visor de Presentación a Pantalla Completa */}
      {projectingGroup && (
        <PresentationViewer
          group={projectingGroup}
          onClose={() => setProjectingGroup(null)}
          onNextGroup={handleNextProjectingGroup}
          onPrevGroup={handlePrevProjectingGroup}
          hasNext={currentProjectingIndex < filteredGroups.length - 1}
          hasPrev={currentProjectingIndex > 0}
        />
      )}
    </Box>
  );
};

export default ProjectionRoom;
