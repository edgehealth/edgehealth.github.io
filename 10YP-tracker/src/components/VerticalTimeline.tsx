import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import type { PromiseData } from '../types';
import PromiseCard from './PromiseCard';
import MarkerLabel from './MarkerLabel';
import TodayLine from './TodayLine';
import dayjs from 'dayjs';

interface VerticalTimelineProps {
  promises: PromiseData[];
}

const MARKER_SIZE = 24;
const CARD_MARGIN = 64;
const CARD_WIDTH = 380;
const MIN_CARD_WIDTH = 200;
const MAX_CARD_WIDTH = 400;
const MAX_CARDS_PER_GROUP = 5;

const VerticalTimeline: React.FC<VerticalTimelineProps> = ({ promises }) => {
  const [todayY, setTodayY] = useState(0);
  
  // Group by deadline_label, but keep order as in original array
  const groups: { label: string; items: PromiseData[] }[] = [];
  const seen = new Set<string>();
  for (const p of promises) {
    if (!seen.has(p.deadline_label)) {
      groups.push({ label: p.deadline_label, items: promises.filter(x => x.deadline_label === p.deadline_label) });
      seen.add(p.deadline_label);
    }
  }

  // --- Today marker logic ---
  // Get all deadline dates
  const allDates = promises.map(p => new Date(p.deadline_date).getTime());
  const minDate = Math.min(...allDates);
  const maxDate = Math.max(...allDates);
  const today = Date.now();
  // Clamp today between min and max
  const todayClamped = Math.max(minDate, Math.min(today, maxDate));
  // Find vertical range (from first to last group marker)
  const groupCount = groups.length;
  const timelineHeight = groupCount > 1 ? (groupCount - 1) * 120 : 1; // 120 is minHeight per group
  
  // Calculate and update todayY position
  useEffect(() => {
    const calculateTodayY = () => {
      const now = Date.now();
      const nowClamped = Math.max(minDate, Math.min(now, maxDate));
      const newTodayY = groupCount > 1
        ? ((nowClamped - minDate) / (maxDate - minDate)) * timelineHeight
        : 0;
      setTodayY(newTodayY);
    };

    // Calculate initial position
    calculateTodayY();

    // Update every hour (3600000ms)
    const interval = setInterval(calculateTodayY, 3600000);

    return () => clearInterval(interval);
  }, [minDate, maxDate, groupCount, timelineHeight]);

  return (
    <Box sx={{
      position: 'relative',
      width: 900,
      mx: 'auto',
      py: 6,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '80vh',
    }}>
      {/* Vertical line */}
      <Box sx={{
        position: 'absolute',
        left: '50%',
        top: 0,
        bottom: 0,
        width: '4px',
        bgcolor: '#c18dbe',
        transform: 'translateX(-50%)',
        zIndex: 0,
      }} />
      {/* Today line positioned absolutely in the main container */}
      <TodayLine top={todayY + 60} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, position: 'relative', minHeight: timelineHeight + 120 }}>
        {groups.map((group, i) => {
          const isLeft = i % 2 === 0;
          const n = group.items.length;
          // Shrink cards if there are many in a group
          const cardWidth = n > MAX_CARDS_PER_GROUP ? MIN_CARD_WIDTH : CARD_WIDTH;
          const fontSize = n > MAX_CARDS_PER_GROUP ? '0.4rem' : '0.45rem';
          return (
            <Box key={group.label + i} sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              position: 'relative',
              minHeight: Math.max(120, n * 90),
              width: '100%',
              py: 1,
            }}>
              {/* Timeline line (centered, behind marker) */}
              <Box sx={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: '4px',
                bgcolor: '#c18dbe',
                transform: 'translateX(-50%)',
                zIndex: 0,
              }} />
              {/* Label (positioned next to marker, center aligned) */}
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: isLeft ? 'auto' : 'auto',
                right: isLeft ? 'auto' : 'auto',
                transform: 'translateY(-50%)',
                zIndex: 3,
              }}>
                {isLeft ? (
                  <Box sx={{ position: 'absolute', right: MARKER_SIZE + 16, top: '50%', transform: 'translateY(-50%)' }}>
                    <MarkerLabel label={group.label} />
                  </Box>
                ) : (
                  <Box sx={{ position: 'absolute', left: MARKER_SIZE + 16, top: '50%', transform: 'translateY(-50%)' }}>
                    <MarkerLabel label={group.label} />
                  </Box>
                )}
              </Box>
              {/* Cards (positioned next to marker, center aligned) */}
              <Box sx={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 3,
              }}>
                {isLeft ? (
                  <Box sx={{ 
                    position: 'absolute', 
                    left: MARKER_SIZE + 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 1.5,
                  }}>
                    {group.items.map((promise, idx) => (
                      <Box key={promise.id} sx={{ width: cardWidth, minWidth: MIN_CARD_WIDTH, maxWidth: MAX_CARD_WIDTH, fontSize }}>
                        <PromiseCard promise={promise} smallText={true} />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ 
                    position: 'absolute', 
                    right: MARKER_SIZE + 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 1.5,
                  }}>
                    {group.items.map((promise, idx) => (
                      <Box key={promise.id} sx={{ width: cardWidth, minWidth: MIN_CARD_WIDTH, maxWidth: MAX_CARD_WIDTH, fontSize }}>
                        <PromiseCard promise={promise} smallText={true} />
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
              {/* Marker (absolutely centered on timeline) */}
              <Box sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: MARKER_SIZE,
                height: MARKER_SIZE,
                bgcolor: 'white',
                border: '3px solid',
                borderColor: '#c18dbe',
                borderRadius: '50%',
                boxShadow: '0 2px 8px rgba(35,32,63,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
              }} />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default VerticalTimeline; 