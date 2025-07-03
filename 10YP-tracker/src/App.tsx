import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import VerticalTimeline from './components/VerticalTimeline';
import type { PromiseData } from './types';
import Box from '@mui/material/Box';

const App: React.FC = () => {
  const [promises, setPromises] = useState<PromiseData[]>([]);

  useEffect(() => {
    fetch('/10YP-tracker/promises.json')
      .then((res) => res.json())
      .then((data) => setPromises(data));
  }, []);

  return (
    <Box sx={{
      background: 'linear-gradient(135deg, #f0e0fb 60%, #c18dbe 100%)',
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', 'Arial', sans-serif",
      color: '#23203f',
    }}>
      <Header />
      <VerticalTimeline promises={promises} />
    </Box>
  );
};

export default App;
