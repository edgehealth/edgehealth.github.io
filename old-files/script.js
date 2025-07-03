// Modern, interactive, brand-aligned timeline for 10YP-tracker
// Author: Edge Health AI Assistant

const TIMELINE_CONTAINER_ID = 'timeline';
const MODAL_ID = 'modal';
const MODAL_CONTENT_ID = 'modal-content';
const CLOSE_MODAL_ID = 'close-modal';

function parseDate(str) {
  // 'YYYY-MM-DD' to Date
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function formatMonthYear(date) {
  return date.toLocaleString('default', { month: 'short', year: 'numeric' });
}
function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}
function daysBetween(a, b) {
  return (b - a) / (1000 * 60 * 60 * 24);
}
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
async function loadPromises() {
  try {
    const res = await fetch('promises.json');
    if (!res.ok) throw new Error('No promises.json');
    return await res.json();
  } catch (e) {
    return [];
  }
}
function getTimelineRange(promises) {
  const dates = promises.map(p => parseDate(p.deadline_date)).sort((a, b) => a - b);
  const first = addMonths(dates[0], -1);
  const last = addMonths(dates[dates.length - 1], 1);
  return { start: first, end: last };
}
function getProportionalLeft(date, start, end, width) {
  const total = daysBetween(start, end);
  const pos = daysBetween(start, date);
  return clamp((pos / total) * width, 0, width);
}
function clearTimeline() {
  const timeline = document.getElementById(TIMELINE_CONTAINER_ID);
  timeline.innerHTML = '';
}
function createDiamondMarker(left, idx, label, isActive) {
  const marker = document.createElement('button');
  marker.className = 'timeline-marker';
  marker.style.left = `${left}px`;
  marker.setAttribute('tabindex', '0');
  marker.setAttribute('aria-label', label);
  marker.dataset.idx = idx;
  if (isActive) marker.classList.add('active');
  marker.innerHTML = `<span class="marker-diamond"></span><span class="marker-label">${label}</span>`;
  return marker;
}
function createSpoke(left, top, height) {
  const spoke = document.createElement('div');
  spoke.className = 'timeline-spoke';
  spoke.style.left = `${left}px`;
  spoke.style.top = `${top}px`;
  spoke.style.height = `${height}px`;
  return spoke;
}
function createMilestoneCard(left, top, promise, above) {
  const card = document.createElement('div');
  card.className = 'milestone-card ' + (above ? 'above' : 'below');
  card.style.left = `${left - 170}px`;
  card.style.top = `${top}px`;
  card.innerHTML = `
    <div class="milestone-title">${promise.promise}</div>
    <div class="milestone-date">${promise.deadline_label || promise.deadline_date}</div>
    <a class="milestone-link" href="${promise.source_link}" target="_blank" rel="noopener noreferrer" aria-label="Source PDF${promise.source_page ? ' page ' + promise.source_page : ''}">Source PDF${promise.source_page ? ` (p. ${promise.source_page})` : ''}</a>
  `;
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', promise.promise);
  return card;
}
function showModal(promise) {
  const modal = document.getElementById(MODAL_ID);
  const content = document.getElementById(MODAL_CONTENT_ID);
  content.innerHTML = `
    <h2 id="modal-title" style="margin-top:0;">${promise.promise}</h2>
    <div style="margin-bottom:0.7em; color:var(--secondary1); font-weight:500;">${promise.deadline_label || promise.deadline_date}</div>
    <a class="milestone-link" href="${promise.source_link}" target="_blank" rel="noopener noreferrer" aria-label="Source PDF${promise.source_page ? ' page ' + promise.source_page : ''}">Source PDF${promise.source_page ? ` (p. ${promise.source_page})` : ''}</a>
    <div style="margin-top:1.2em; font-size:0.98em; color:var(--grey);">Source page: ${promise.source_page ? promise.source_page : 'N/A'}</div>
  `;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById(MODAL_ID).classList.add('hidden');
  document.body.style.overflow = '';
}
function setupModalClose() {
  document.getElementById(CLOSE_MODAL_ID).onclick = closeModal;
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}
async function renderTimeline() {
  const promises = (await loadPromises()).sort((a, b) => parseDate(a.deadline_date) - parseDate(b.deadline_date));
  if (!promises.length) return;
  // Group promises by deadline_date
  const grouped = {};
  promises.forEach(p => {
    if (!grouped[p.deadline_date]) grouped[p.deadline_date] = [];
    grouped[p.deadline_date].push(p);
  });
  const groupedDates = Object.keys(grouped).sort((a, b) => parseDate(a) - parseDate(b));
  const { start, end } = getTimelineRange(promises);
  const timeline = document.getElementById(TIMELINE_CONTAINER_ID);
  clearTimeline();
  // Timeline line
  const timelineWidth = 2000;
  timeline.style.width = timelineWidth + 'px';
  const cardWidth = 240;
  const cardHeight = 36;
  const minCardGap = 10;
  const minHorizontalGap = 100;
  const topLine = timeline.offsetHeight / 2;
  const verticalOffsets = [60, 120, 180, 250, 320, 400]; // try these offsets from the timeline
  const placed = [];
  // Render timeline line
  const line = document.createElement('div');
  line.className = 'timeline-line';
  line.style.left = '0';
  line.style.right = '0';
  timeline.appendChild(line);
  // Calculate marker positions with minimum horizontal gap
  let lastX = -Infinity;
  groupedDates.forEach((dateStr, idx) => {
    // Proportional x, but enforce min gap
    let x = getProportionalLeft(parseDate(dateStr), start, end, timelineWidth);
    if (x - lastX < minHorizontalGap) {
      x = lastX + minHorizontalGap;
    }
    x = Math.max(cardWidth / 2, Math.min(timelineWidth - cardWidth / 2, x));
    lastX = x;
    // Try a range of vertical offsets to find a non-overlapping spot
    const above = idx % 2 === 0;
    let y = null;
    for (let offset of verticalOffsets) {
      let tryY = topLine + (above ? -1 : 1) * offset;
      // Check for overlap with all previous cards
      const overlaps = placed.some(card => overlap(x, tryY, card.x, card.y, cardWidth, cardHeight));
      // Ensure card does not cross the timeline
      const crossesLine = above ? (tryY + cardHeight > topLine - 8) : (tryY < topLine + 8);
      if (!overlaps && !crossesLine) {
        y = tryY;
        break;
      }
    }
    // If all offsets overlap, just place at the furthest offset
    if (y === null) {
      let offset = verticalOffsets[verticalOffsets.length - 1];
      y = topLine + (above ? -1 : 1) * offset;
    }
    y = Math.max(0, Math.min(timeline.offsetHeight - cardHeight, y));
    placed.push({ x, y });
    // Marker
    const marker = createDiamondMarker(x, idx, dateStr, false);
    marker.style.position = 'absolute';
    marker.style.left = `${x - 7}px`;
    marker.style.top = `calc(50% - 7px)`;
    marker.onclick = () => showModal(grouped[dateStr][0]);
    marker.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { showModal(grouped[dateStr][0]); } };
    timeline.appendChild(marker);
    // Spoke
    const spokeHeight = above ? (topLine - y + 2) : (y - topLine + 2);
    const spoke = createSpoke(x, above ? y + 18 : topLine, spokeHeight);
    timeline.appendChild(spoke);
    // Card
    const card = document.createElement('div');
    card.className = 'milestone-card ' + (above ? 'above' : 'below');
    card.style.position = 'absolute';
    card.style.left = `${x - cardWidth / 2}px`;
    card.style.top = `${y}px`;
    card.innerHTML = `<div class="milestone-date">${grouped[dateStr][0].deadline_label || dateStr}</div><ul class="milestone-list">${grouped[dateStr].map(p => `<li><span class="milestone-title">${p.promise}</span> <a class="milestone-link" href="${p.source_link}" target="_blank" rel="noopener noreferrer" aria-label="Source PDF${p.source_page ? ' page ' + p.source_page : ''}">(source)</a></li>`).join('')}</ul>`;
    card.onclick = () => showModal(grouped[dateStr][0]);
    card.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { showModal(grouped[dateStr][0]); } };
    timeline.appendChild(card);
  });
}
// Helper for overlap detection
function overlap(x1, y1, x2, y2, w, h) {
  return Math.abs(x1 - x2) < w && Math.abs(y1 - y2) < h;
}
window.onload = () => {
  renderTimeline();
  setupModalClose();
};
