import React from 'react';
import Typography from '@mui/material/Typography';

interface MarkerLabelProps {
  label: string;
}

const MarkerLabel: React.FC<MarkerLabelProps> = ({ label }) => (
  <Typography 
    variant="h6" 
    sx={{ 
      fontWeight: 600,
      fontSize: '1.1rem',
      color: '#23203f',
      fontFamily: "'Libre Baskerville', serif",
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </Typography>
);

export default MarkerLabel; 