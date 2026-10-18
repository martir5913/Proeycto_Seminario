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
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import RefreshIcon from '@mui/icons-material/Refresh';
import GroupsIcon from '@mui/icons-material/Groups';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

import GroupCard from '../components/GroupCard';
import RegistrationModal from '../components/RegistrationModal';
import PresentationViewer from '../components/PresentationViewer';

export const ProjectionRoom = ({ onOpenAdmin, onOpenStage }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    institution_name: 'UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA',
    institution_faculty: 'Campus Villa Nueva • Facultad de Ingeniería en Sistemas',
    site_title: 'Seminario de Graduación 2026',
    site_subtitle: 'Jornada de Presentación y Defensa de Proyectos de Grado',
  });

  // Filtros de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modales y Proyección
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [projectingGroup, setProjectingGroup] = useState(null);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/settings');
      if (res.data.success && res.data.data) {
        setSettings((prev) => ({ ...prev, ...res.data.data }));
      }
    } catch (err) {
      console.warn('Usando configuración predeterminada en catálogo');
    }
  };

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
    fetchSettings();
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

  // Métricas
  const totalGroups = groups.length;
  const localFileGroups = groups.filter((g) => g.presentation_type === 'file').length;
  const canvaGroups = groups.filter((g) => g.presentation_type === 'link').length;
  const completedGroups = groups.filter((g) => g.status === 'completed').length;

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
    <Box sx={{ minHeight: '100vh', pb: 6, backgroundColor: '#F8FAFC' }}>
      {/* Barra de Navegación Superior Premium Institucional */}
      <Box
        component="header"
        sx={{
          backgroundColor: '#00192D',
          px: { xs: 2, md: 4 },
          py: 0.9,
          borderBottom: '2px solid #C5A059',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
          borderRadius: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
          <Box
            component="img"
            src="/assets/umg-icon.svg"
            alt="Logo UMG"
            sx={{ width: 40, height: 40, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
          />
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                letterSpacing: '0.6px',
                color: '#FFFFFF',
                fontSize: { xs: '0.92rem', md: '1.05rem' },
                lineHeight: 1.15,
              }}
            >
              {settings.institution_name || 'UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.2 }}>
              <Chip
                label="CATÁLOGO DE PROYECTOS"
                size="small"
                sx={{
                  backgroundColor: '#C5A059',
                  color: '#00192D',
                  fontWeight: 900,
                  fontSize: '0.68rem',
                  height: 18,
                  borderRadius: '4px',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: '#C5A059',
                  fontWeight: 700,
                  fontSize: { xs: '0.72rem', md: '0.8rem' },
                }}
              >
                {settings.institution_faculty || 'Campus Villa Nueva • Facultad de Ingeniería en Sistemas'}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={onOpenStage}
            startIcon={<ArrowBackIcon />}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.4)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.82rem',
              py: 0.4,
              px: 1.3,
              borderRadius: '6px',
              '&:hover': { borderColor: '#C5A059', color: '#C5A059' },
            }}
          >
            Volver a la Sala
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={onOpenAdmin}
            startIcon={<AdminPanelSettingsIcon />}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.4)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.82rem',
              py: 0.4,
              px: 1.3,
              borderRadius: '6px',
              '&:hover': { borderColor: '#C5A059', color: '#C5A059' },
            }}
          >
            Gestión del Sitio
          </Button>

          <Button
            variant="contained"
            size="small"
            onClick={() => setIsRegisterOpen(true)}
            startIcon={<AddCircleOutlineIcon />}
            sx={{
              backgroundColor: '#C5A059',
              color: '#00192D',
              fontWeight: 900,
              fontSize: '0.82rem',
              py: 0.4,
              px: 1.5,
              borderRadius: '6px',
              boxShadow: '0 4px 14px rgba(197, 160, 89, 0.35)',
              '&:hover': { backgroundColor: '#DEB869', color: '#00192D' },
            }}
          >
            Registrar Grupo
          </Button>
        </Box>
      </Box>

      {/* Contenido Principal */}
      <Container
        maxWidth={false}
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: '98%', xl: '1800px' },
          px: { xs: 2, sm: 3, md: 4 },
          mt: 3,
        }}
      >
        {/* Fila de Tarjetas KPI / Métricas del Catálogo */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(0, 43, 73, 0.04)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  backgroundColor: 'rgba(0, 43, 73, 0.08)',
                  color: '#002B49',
                  p: 1.2,
                  borderRadius: '8px',
                  display: 'flex',
                }}
              >
                <GroupsIcon />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#002B49', lineHeight: 1 }}>
                  {totalGroups}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.75rem' }}>
                  Grupos Registrados
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(0, 43, 73, 0.04)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  backgroundColor: 'rgba(234, 88, 12, 0.1)',
                  color: '#EA580C',
                  p: 1.2,
                  borderRadius: '8px',
                  display: 'flex',
                }}
              >
                <SlideshowIcon />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#002B49', lineHeight: 1 }}>
                  {localFileGroups}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.75rem' }}>
                  Archivos PPTX / PDF
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(0, 43, 73, 0.04)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  backgroundColor: 'rgba(125, 42, 232, 0.1)',
                  color: '#7D2AE8',
                  p: 1.2,
                  borderRadius: '8px',
                  display: 'flex',
                }}
              >
                <LinkIcon />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#002B49', lineHeight: 1 }}>
                  {canvaGroups}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.75rem' }}>
                  Enlaces Canva / Web
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(0, 43, 73, 0.04)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  backgroundColor: 'rgba(22, 163, 74, 0.1)',
                  color: '#16A34A',
                  p: 1.2,
                  borderRadius: '8px',
                  display: 'flex',
                }}
              >
                <CheckCircleIcon />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: '#002B49', lineHeight: 1 }}>
                  {completedGroups} / {totalGroups}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.75rem' }}>
                  Proyectos Concluidos
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Barra de Filtros y Búsqueda */}
        <Paper
          elevation={0}
          sx={{
            p: 2.2,
            mb: 3,
            borderRadius: '10px',
            backgroundColor: '#ffffff',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por grupo, título de tema o integrante..."
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
                <InputLabel>Estado del Grupo</InputLabel>
                <Select
                  value={statusFilter}
                  label="Estado del Grupo"
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
                <InputLabel>Material de Soporte</InputLabel>
                <Select
                  value={typeFilter}
                  label="Material de Soporte"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="all">Todos los formatos</MenuItem>
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
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid #E2E8F0' }}>
            <Typography variant="h6" sx={{ color: '#002B49', fontWeight: 800, mb: 1 }}>
              No se encontraron grupos registrados
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
              Haga clic en el botón de abajo para registrar el primer grupo y cargar sus diapositivas o enlace Canva.
            </Typography>
            <Button
              variant="contained"
              onClick={() => setIsRegisterOpen(true)}
              startIcon={<AddCircleOutlineIcon />}
              sx={{ backgroundColor: '#002B49', fontWeight: 800, px: 3, py: 1, borderRadius: '8px' }}
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
        groups={groups}
        onClose={() => setIsRegisterOpen(false)}
        onGroupCreated={handleGroupCreated}
      />

      {/* Visor de Presentación a Pantalla Completa */}
      {projectingGroup && (
        <PresentationViewer
          group={projectingGroup}
          onClose={() => {
            setProjectingGroup(null);
            fetchGroups();
          }}
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
