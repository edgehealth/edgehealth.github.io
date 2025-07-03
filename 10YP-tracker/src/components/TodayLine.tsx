import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface TodayLineProps {
  top: number;
}

const TodayLine: React.FC<TodayLineProps> = ({ top }) => (
  <Box sx={{
    position: 'absolute',
    left: 0,
    right: 0,
    top: top,
    zIndex: 1,
    pointerEvents: 'none',
  }}>
    <Typography sx={{
      position: 'absolute',
      left: 0,
      top: -22,
      color: '#F28F64',
      fontWeight: 700,
      fontFamily: "'Libre Baskerville', serif",
      fontSize: '1.1rem',
      letterSpacing: 0.5,
      bgcolor: 'white',
      px: 1,
      borderRadius: 1,
      boxShadow: '0 2px 8px rgba(35,32,63,0.08)',
    }}>
      Today
    </Typography>
    <Box sx={{
      width: '100%',
      height: 0,
      borderTop: '3px solid #F28F64',
      borderRadius: 2,
    }} />
  </Box>
);

export default TodayLine; 