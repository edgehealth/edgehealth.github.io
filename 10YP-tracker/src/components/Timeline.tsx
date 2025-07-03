import React, { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import type { PromiseData } from '../types';
import PromiseCard from './PromiseCard';

interface TimelineProps {
  promises: PromiseData[];
}

const TIMELINE_WIDTH = 1200;
const CONTAINER_HEIGHT = 500;
const CARD_WIDTH = 180;
const CARD_HEIGHT = 100;
const MARKER_SIZE = 12;
const FAN_STEP = 60; // vertical step for fanning out
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;

// Helper to check overlap between two cards
function isOverlapping(a: { x: number; y: number }, b: { x: number; y: number }) {
  return (
    Math.abs(a.x - b.x) < CARD_WIDTH &&
    Math.abs(a.y - b.y) < CARD_HEIGHT
  );
}

const Timeline: React.FC<TimelineProps> = ({ promises }) => {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const scrollStart = useRef<{ left: number; top: number }>({ left: 0, top: 0 });
  
  
  if (!promises.length) return null;

  // Sort promises by deadline_date
  const sorted = [...promises].sort((a, b) => new Date(a.deadline_date).getTime() - new Date(b.deadline_date).getTime());
  const minDate = new Date(sorted[0].deadline_date).getTime();
  const maxDate = new Date(sorted[sorted.length - 1].deadline_date).getTime();
  const range = maxDate - minDate || 1;

  // Center Y for timeline
  const centerY = CONTAINER_HEIGHT / 2;

  // Robust collision-avoiding placement
  const placed: { x: number; y: number }[] = [];
  sorted.forEach((promise, i) => {
    const dateMs = new Date(promise.deadline_date).getTime();
    const x = ((dateMs - minDate) / range) * (TIMELINE_WIDTH - CARD_WIDTH) + CARD_WIDTH / 2;
    // Fan out: alternate above/below, increase distance if needed
    let fan = 1;
    let y = centerY;
    let found = false;
    while (!found) {
      // Try above
      y = centerY - fan * FAN_STEP;
      if (!placed.some((p) => isOverlapping({ x, y }, p))) {
        found = true;
        break;
      }
      // Try below
      y = centerY + fan * FAN_STEP;
      if (!placed.some((p) => isOverlapping({ x, y }, p))) {
        found = true;
        break;
      }
      fan++;
    }
    placed.push({ x, y });
  });

  // Handle mouse wheel for zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
      // Let browser handle zoom if modifier is pressed
      return;
    }
    if (Math.abs(e.deltaY) < 1) return;
    e.preventDefault();
    setZoom((z) => {
      let next = z - Math.sign(e.deltaY) * ZOOM_STEP;
      if (next < MIN_ZOOM) next = MIN_ZOOM;
      if (next > MAX_ZOOM) next = MAX_ZOOM;
      return next;
    });
  };

// Mouse drag-to-pan logic
const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
  if (e.button !== 0) return; // Only left mouse button
  isDragging.current = true;
  dragStart.current = { x: e.clientX, y: e.clientY };
  if (containerRef.current) {
    scrollStart.current = {
      left: containerRef.current.scrollLeft,
      top: containerRef.current.scrollTop,
    };
  }
  document.body.style.cursor = 'grabbing';
};
const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  if (!isDragging.current || !containerRef.current) return;
  const dx = e.clientX - dragStart.current.x;
  const dy = e.clientY - dragStart.current.y;
  containerRef.current.scrollLeft = scrollStart.current.left - dx;
  containerRef.current.scrollTop = scrollStart.current.top - dy;
};
const handleMouseUp = () => {
  isDragging.current = false;
  document.body.style.cursor = '';
};
const handleMouseLeave = () => {
  isDragging.current = false;
  document.body.style.cursor = '';
};

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100vw',
        height: CONTAINER_HEIGHT,
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'background.default',
        mt: 6,
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <Box
        sx={{
          width: TIMELINE_WIDTH,
          height: CONTAINER_HEIGHT,
          position: 'relative',
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          mx: 'auto',
          background: 'transparent',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Timeline line */}
        <Box sx={{
          position: 'absolute',
          top: centerY - 2,
          left: 0,
          width: TIMELINE_WIDTH,
          height: 4,
          bgcolor: '#c18dbe',
          borderRadius: 2,
        }} />
        {/* Markers, branches, and cards */}
        {sorted.map((promise, i) => {
          const { x, y } = placed[i];
          // Connecting bar
          const barTop = y < centerY ? y + CARD_HEIGHT : centerY;
          const barHeight = Math.abs(centerY - y) - (y < centerY ? 0 : 0);
          return (
            <React.Fragment key={promise.id}>
              {/* Branch line */}
              <Box sx={{
                position: 'absolute',
                left: x - 1,
                top: y < centerY ? y + CARD_HEIGHT : centerY,
                width: 2,
                height: barHeight,
                bgcolor: '#c18dbe',
                zIndex: 1,
              }} />
              {/* Marker */}
              <Box sx={{
                position: 'absolute',
                left: x - MARKER_SIZE / 2,
                top: centerY - MARKER_SIZE / 2,
                width: MARKER_SIZE,
                height: MARKER_SIZE,
                bgcolor: 'background.paper',
                border: '2px solid',
                borderColor: '#c18dbe',
                borderRadius: '50%',
                zIndex: 2,
                boxShadow: 1,
              }} />
              {/* Promise card */}
              <Box sx={{
                position: 'absolute',
                left: x - CARD_WIDTH / 2,
                top: y,
                zIndex: 3,
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                maxWidth: '90vw',
                fontSize: '0.85rem',
              }}>
                <PromiseCard promise={promise} smallText />
              </Box>
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
};

export default Timeline; 