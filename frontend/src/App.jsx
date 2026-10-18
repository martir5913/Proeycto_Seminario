import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import umgTheme from './theme/umgTheme';
import AuditoriumStage from './pages/AuditoriumStage';
import ProjectionRoom from './pages/ProjectionRoom';
import SiteManagement from './pages/SiteManagement';
import PresentationViewer from './components/PresentationViewer';

function App() {
  const [currentView, setCurrentView] = useState('stage'); // 'stage' (Auditorio) | 'catalog' (Catálogo) | 'admin' (Gestión del Sitio)
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectingGroup, setProjectingGroup] = useState(null);

  const fetchGroups = async () => {
    try {
      const res = await axios.get('/api/groups');
      if (res.data.success) {
        setGroups(res.data.data);
      }
    } catch (err) {
      console.error('Error al obtener lista de grupos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleStartPresentation = (group) => {
    setProjectingGroup(group);
  };

  const handleClosePresentation = () => {
    setProjectingGroup(null);
    fetchGroups(); // Actualizar estados
  };

  // Encontrar índices para grupo siguiente y anterior en el visor
  const currentProjectingIndex = projectingGroup
    ? groups.findIndex((g) => g.id === projectingGroup.id)
    : -1;

  const handleNextProjectingGroup = () => {
    if (currentProjectingIndex >= 0 && currentProjectingIndex < groups.length - 1) {
      setProjectingGroup(groups[currentProjectingIndex + 1]);
    }
  };

  const handlePrevProjectingGroup = () => {
    if (currentProjectingIndex > 0) {
      setProjectingGroup(groups[currentProjectingIndex - 1]);
    }
  };

  return (
    <ThemeProvider theme={umgTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#00192D' }}>
            <CircularProgress sx={{ color: '#C5A059' }} />
          </Box>
        ) : (
          <>
            {currentView === 'stage' && (
              <AuditoriumStage
                groups={groups}
                onStartPresentation={handleStartPresentation}
                onOpenCatalog={() => setCurrentView('catalog')}
                onOpenAdmin={() => setCurrentView('admin')}
              />
            )}

            {currentView === 'catalog' && (
              <ProjectionRoom
                onOpenAdmin={() => setCurrentView('admin')}
                onOpenStage={() => setCurrentView('stage')}
              />
            )}

            {currentView === 'admin' && (
              <SiteManagement
                onBack={() => {
                  setCurrentView('stage');
                  fetchGroups();
                }}
                onSettingsChanged={fetchGroups}
              />
            )}

            {/* Visor de Presentaciones en Pantalla Completa */}
            {projectingGroup && (
              <PresentationViewer
                group={projectingGroup}
                onClose={handleClosePresentation}
                onNextGroup={handleNextProjectingGroup}
                onPrevGroup={handlePrevProjectingGroup}
                hasNext={currentProjectingIndex < groups.length - 1}
                hasPrev={currentProjectingIndex > 0}
              />
            )}
          </>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
