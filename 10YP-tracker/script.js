// Edge Health 10-Year Plan Tracker: Fishbone Timeline
// Loads data from promises.json and renders a custom horizontal fishbone timeline

document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const timeline = document.getElementById('timeline');
  const detailsPanel = document.getElementById('details-panel');
  const detailsTitle = document.getElementById('details-title');
  const detailsPromise = document.getElementById('details-promise');
  const detailsDeadline = document.getElementById('details-deadline');
  const detailsLink = document.getElementById('details-link');
  const detailsPage = document.getElementById('details-page');
  const instructionsPanel = document.getElementById('instructions-panel');

  // PDF preview container
  let pdfPreview = null;

  // Fetch promises data from JSON
  fetch('promises.json')
    .then(res => res.json())
    .then(promisesData => {
      // Sort by deadline
      promisesData.sort((a, b) => new Date(a.deadline_date) - new Date(b.deadline_date));
      renderFishboneTimeline(promisesData);
    });

  function renderFishboneTimeline(promises) {
    // Clear timeline
    timeline.innerHTML = '';
    // Draw the main horizontal line
    const line = document.createElement('div');
    line.className = 'eh-timeline-line';
    timeline.appendChild(line);
    // Calculate marker positions
    const n = promises.length;
    const timelineWidth = timeline.offsetWidth || 900;
    const margin = 60;
    const availableWidth = timelineWidth - 2 * margin;
    // Place markers evenly
    promises.forEach((item, i) => {
      const percent = n === 1 ? 0.5 : i / (n - 1);
      const left = margin + percent * availableWidth;
      // Marker
      const marker = document.createElement('div');
      marker.className = 'eh-timeline-marker';
      marker.style.left = `${left}px`;
      marker.style.top = i % 2 === 0 ? '40px' : '122px'; // alternate above/below
      marker.setAttribute('tabindex', '0');
      marker.setAttribute('role', 'button');
      marker.setAttribute('aria-label', `Promise #${item.id}: ${item.promise}`);
      // Label
      const label = document.createElement('div');
      label.className = 'eh-timeline-label ' + (i % 2 === 0 ? 'above' : 'below');
      label.style.left = `${left}px`;
      label.textContent = item.deadline_label;
      // Click/keyboard event
      marker.addEventListener('click', () => selectPromise(item, marker));
      marker.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          selectPromise(item, marker);
        }
      });
      timeline.appendChild(marker);
      timeline.appendChild(label);
    });
    // Responsive: redraw on resize
    window.addEventListener('resize', () => renderFishboneTimeline(promises));
  }

  let lastSelected = null;
  function selectPromise(item, marker) {
    // Remove previous selection
    if (lastSelected) lastSelected.classList.remove('selected');
    marker.classList.add('selected');
    lastSelected = marker;
    // Populate details
    detailsTitle.textContent = `Promise #${item.id}`;
    detailsPromise.textContent = item.promise;
    detailsDeadline.textContent = item.deadline_label;
    detailsPage.textContent = item.source_page;
    detailsLink.href = item.source_link;
    // Remove previous preview if any
    if (pdfPreview) pdfPreview.remove();
    // PDF preview logic
    pdfPreview = document.createElement('div');
    pdfPreview.style.margin = '1.2rem 0 0.5rem 0';
    pdfPreview.style.width = '100%';
    pdfPreview.style.maxWidth = '540px';
    pdfPreview.style.minHeight = '320px';
    pdfPreview.style.display = 'flex';
    pdfPreview.style.justifyContent = 'center';
    pdfPreview.style.alignItems = 'center';
    // Detect mobile
    const isMobile = window.innerWidth < 700 || /Mobi|Android/i.test(navigator.userAgent);
    if (!isMobile) {
      // Try to embed PDF
      const iframe = document.createElement('iframe');
      iframe.src = item.source_link;
      iframe.width = '100%';
      iframe.height = '320';
      iframe.style.border = '1px solid #c18dbe';
      iframe.setAttribute('title', `PDF preview for page ${item.source_page}`);
      // Fallback: if PDF fails to load, show image
      iframe.onerror = function() {
        showPdfImageFallback(item);
      };
      pdfPreview.appendChild(iframe);
      // Also add a fallback image if iframe fails (after a timeout)
      setTimeout(() => {
        if (!iframe.contentDocument) {
          showPdfImageFallback(item);
        }
      }, 3000);
    } else {
      showPdfImageFallback(item);
    }
    detailsPanel.insertBefore(pdfPreview, detailsPanel.children[2]);
    detailsPanel.hidden = false;
    instructionsPanel.style.display = 'none';
    detailsPanel.setAttribute('tabindex', '-1');
    detailsPanel.focus();
  }

  function showPdfImageFallback(item) {
    pdfPreview.innerHTML = '';
    const img = document.createElement('img');
    img.src = `img/pdf-pages/page-${item.source_page}.png`;
    img.alt = `Preview of PDF page ${item.source_page}`;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '320px';
    img.style.border = '1px solid #c18dbe';
    pdfPreview.appendChild(img);
  }
});
