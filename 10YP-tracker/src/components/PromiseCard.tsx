import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import type { PromiseData } from '../types';

interface PromiseCardProps {
  promise: PromiseData;
  smallText?: boolean;
}

const PromiseCard: React.FC<PromiseCardProps> = ({ promise, smallText }) => (
  <Card sx={{
    minWidth: 180,
    maxWidth: 400,
    boxShadow: '0 2px 8px rgba(35,32,63,0.08)',
    borderRadius: 2,
    bgcolor: 'white',
    border: '1px solid',
    borderColor: '#c18dbe',
    fontSize: smallText ? '0.8rem' : '1rem',
    px: 2,
    py: 1,
    fontFamily: "'Segoe UI', 'Arial', sans-serif",
  }}>
    <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
      <Typography variant={smallText ? 'body2' : 'body1'} sx={{ 
        fontWeight: 500, 
        mb: 0.5, 
        fontSize: smallText ? '0.8rem' : '1rem',
        color: '#23203f',
        fontFamily: "'Segoe UI', 'Arial', sans-serif",
      }}>
        {promise.promise}
      </Typography>
      <Link href={promise.source_link} target="_blank" rel="noopener" variant="caption" sx={{ 
        fontSize: '0.7rem',
        color: '#56BABF',
        fontFamily: "'Segoe UI', 'Arial', sans-serif",
      }}>
        Source
      </Link>
    </CardContent>
  </Card>
);

export default PromiseCard; 