import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import VerticalTimeline from './components/VerticalTimeline';
import type { PromiseData } from './types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const App: React.FC = () => {
  const [promises, setPromises] = useState<PromiseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/10YP-tracker/promises.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setPromises(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading promises:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // Apply gradient background to body
  useEffect(() => {
    document.body.style.background = 'linear-gradient(135deg, #f0e0fb 60%, #c18dbe 100%)';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.minHeight = '100vh';
    
    return () => {
      document.body.style.background = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.minHeight = '';
    };
  }, []);

  return (
    <Box sx={{
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
      {loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">Loading timeline...</Typography>
        </Box>
      )}
      {error && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="error">Error loading data: {error}</Typography>
        </Box>
      )}
      {!loading && !error && <VerticalTimeline promises={promises} />}
    </Box>
  );
};

export default App;
