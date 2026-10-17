import React, { useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import umgTheme from './theme/umgTheme';
import ProjectionRoom from './pages/ProjectionRoom';
import DashboardAdmin from './pages/DashboardAdmin';

function App() {
  const [currentView, setCurrentView] = useState('projection'); // 'projection' | 'admin'

  return (
    <ThemeProvider theme={umgTheme}>
      <CssBaseline />
      {currentView === 'projection' ? (
        <ProjectionRoom onOpenAdmin={() => setCurrentView('admin')} />
      ) : (
        <DashboardAdmin onBack={() => setCurrentView('projection')} />
      )}
    </ThemeProvider>
  );
}

export default App;
