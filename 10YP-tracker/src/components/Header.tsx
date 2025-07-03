import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const Header: React.FC = () => (
  <Box sx={{ width: '100%', py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    <Stack direction="column" spacing={2} alignItems="center">
      <Box component="img" src="/10YP-tracker/EdgeHealthLogo.svg" alt="Edge Health Logo" sx={{ height: 64, width: 'auto' }} />
      <Typography variant="h4" sx={{ 
        fontWeight: 'bold', 
        color: '#23203f', 
        textAlign: 'center',
        fontFamily: "'Libre Baskerville', serif",
      }}>
        Uk Government 10 Year Plan Promises Timeline
      </Typography>
    </Stack>
  </Box>
);

export default Header; 