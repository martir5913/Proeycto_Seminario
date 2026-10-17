import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';

export const DashboardAdmin = ({ onBack }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/groups');
      if (res.data.success) {
        setGroups(res.data.data);
      }
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'Error al cargar grupos desde el servidor.' });
    } finally {
      setLoading(false);
    }
  };

  const moveGroup = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= groups.length) return;

    const newGroups = [...groups];
    const [moved] = newGroups.splice(index, 1);
    newGroups.splice(targetIndex, 0, moved);

    // Reasignar presentation_order secuencial
    const updatedWithOrder = newGroups.map((g, idx) => ({
      ...g,
      presentation_order: idx + 1,
    }));

    setGroups(updatedWithOrder);
  };

  const saveNewOrder = async () => {
    try {
      setSaving(true);
      const orders = groups.map((g, idx) => ({
        id: g.id,
        presentation_order: idx + 1,
      }));

      await axios.put('/api/groups/order', { orders });
      setAlertInfo({ type: 'success', message: '¡Orden de exposiciones actualizado y guardado correctamente!' });
    } catch (err) {
      setAlertInfo({ type: 'error', message: 'Error al guardar el nuevo orden de exposición.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', pb: 6 }}>
      {/* Barra Superior */}
      <Paper
        elevation={3}
        sx={{
          backgroundColor: '#002B49',
          color: '#fff',
          py: 2,
          px: { xs: 2, md: 4 },
          borderBottom: '4px solid #C5A059',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onBack}
            startIcon={<ArrowBackIcon />}
            sx={{
              borderColor: '#C5A059',
              color: '#C5A059',
              '&:hover': { borderColor: '#fff', color: '#fff' },
            }}
          >
            Volver a la Sala
          </Button>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Central de Mando: Orden de Exposición
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={saveNewOrder}
          disabled={saving || groups.length === 0}
          startIcon={<SaveIcon />}
          sx={{
            backgroundColor: '#D32F2F',
            color: '#fff',
            fontWeight: 700,
            '&:hover': { backgroundColor: '#9A0007' },
          }}
        >
          {saving ? 'Guardando...' : 'Guardar Orden de Presentación'}
        </Button>
      </Paper>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {alertInfo && (
          <Alert
            severity={alertInfo.type}
            onClose={() => setAlertInfo(null)}
            sx={{ mb: 3 }}
          >
            {alertInfo.message}
          </Alert>
        )}

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
            Utilice las flechas para subir o bajar la prioridad de cada grupo según el orden de agenda definido por los catedráticos moderadores.
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress sx={{ color: '#002B49' }} />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, width: '90px' }}>Orden</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: '100px' }}>No. Grupo</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Nombre del Grupo & Tema</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tipo de Recurso</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, width: '130px' }}>Reordenar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groups.map((group, index) => (
                    <TableRow key={group.id} hover>
                      <TableCell>
                        <Box
                          sx={{
                            backgroundColor: '#002B49',
                            color: '#fff',
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                          }}
                        >
                          {index + 1}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>#{group.group_number}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#002B49' }}>
                          {group.group_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          {group.topic}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={group.presentation_type === 'file' ? (group.original_name || 'Archivo Local') : 'Enlace Web'}
                          size="small"
                          sx={{ backgroundColor: '#EEF2F6', fontSize: '0.75rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={group.status === 'completed' ? 'Concluido' : group.status === 'presenting' ? 'En Curso' : 'Pendiente'}
                          size="small"
                          color={group.status === 'completed' ? 'success' : group.status === 'presenting' ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Subir prioridad">
                          <span>
                            <IconButton
                              size="small"
                              disabled={index === 0}
                              onClick={() => moveGroup(index, 'up')}
                              sx={{ color: '#002B49' }}
                            >
                              <ArrowUpwardIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Bajar prioridad">
                          <span>
                            <IconButton
                              size="small"
                              disabled={index === groups.length - 1}
                              onClick={() => moveGroup(index, 'down')}
                              sx={{ color: '#002B49' }}
                            >
                              <ArrowDownwardIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default DashboardAdmin;
