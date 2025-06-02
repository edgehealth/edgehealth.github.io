// dashboard_script.js

document.addEventListener('DOMContentLoaded', () => {
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzH_KYGZafbS-UswAwuki7aMcNghg8_mxxINj-Wpa9fEQzk-zLkOVom9SkSxSDOC8Y/exec';

    const errorMessageDiv = document.getElementById('error_message');
    const loadingDiv = document.getElementById('loading');
    const POLLING_INTERVAL = 750;

    let previousCounts = {
        "Data Engineering": null,
        "AI": null,
        "Analytics": null,
        "Economic Evaluations": null
    };

    let isInitialized = false;

    const topicMapping = {
        "Data Engineering": "data-engineering",
        "AI": "ai", 
        "Analytics": "analytics",
        "Economic Evaluations": "econ-eval"
    };

    // Add click listeners to image quadrants
    document.querySelectorAll('.image-quadrant.clickable').forEach(quadrant => {
        quadrant.addEventListener('click', () => {
            const topicKey = quadrant.dataset.topic;
            if (topicKey) {
                console.log(`Image quadrant clicked: ${topicKey}`);
                enlargeImageLightbox(topicKey);
            }
        });
    });

    function fetchDataAndUpdateCounters() {
        errorMessageDiv.textContent = '';
        
        const fetchUrl = `${SCRIPT_URL}?action=getTopicData&cachebust=${new Date().getTime()}`;

        fetch(fetchUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText} (Status: ${response.status})`);
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    throw new Error(`Error from Apps Script: ${data.error}`);
                }
                updateCounters(data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                errorMessageDiv.textContent = `Error: ${error.message}. Retrying in ${POLLING_INTERVAL/1000}s...`;
            });
    }

    function updateCounters(apiData) {
        if (!apiData || apiData.length < 2) {
            console.log("No data available yet");
            return;
        }

        for (let i = 1; i < apiData.length; i++) {
            const topicName = apiData[i][0];
            const count = apiData[i][1];
            const topicKey = topicMapping[topicName];
            
            if (topicKey) {
                // Update counter display
                const counterElement = document.getElementById(`counter-${topicKey}`);
                if (counterElement) {
                    const valueElement = counterElement.querySelector('.counter-value');
                    if (valueElement) {
                        valueElement.textContent = count;
                        
                        // Add pulse animation if initialized and count increased
                        if (isInitialized && previousCounts[topicName] !== null && count > previousCounts[topicName]) {
                            counterElement.classList.add('pulse');
                            setTimeout(() => {
                                counterElement.classList.remove('pulse');
                            }, 1000);
                        }
                    }
                }

                // Check if this topic got a new vote and trigger image enlargement
                if (isInitialized && previousCounts[topicName] !== null && count > previousCounts[topicName]) {
                    console.log(`New vote detected for ${topicName}! Count: ${previousCounts[topicName]} → ${count}`);
                    enlargeImageLightbox(topicKey);
                }

                previousCounts[topicName] = count;
            }
        }

        if (!isInitialized) {
            isInitialized = true;
            console.log("Dashboard initialized with current counts. Now watching for new votes...");
        }
    }

    function enlargeImageLightbox(topicKey) {
    // Remove any existing lightbox
    const existingLightbox = document.querySelector('.lightbox-overlay');
    if (existingLightbox) {
        existingLightbox.remove();
    }

    // Get the source image
    const sourceQuadrant = document.getElementById(`quadrant-${topicKey}`);
    const sourceImage = sourceQuadrant.querySelector('.quadrant-image');
   // const overlayContent = sourceQuadrant.querySelector('.overlay-content');
    
    if (!sourceImage) return;

    // Create lightbox overlay
    const lightboxOverlay = document.createElement('div');
    lightboxOverlay.className = 'lightbox-overlay';
    
    // Create lightbox content
    const lightboxContent = document.createElement('div');
    lightboxContent.className = 'lightbox-content';
    
    // Clone the image and overlay content
    const enlargedImage = sourceImage.cloneNode(true);
    enlargedImage.className = 'lightbox-image';
    
    //const enlargedOverlay = document.createElement('div');
    //enlargedOverlay.className = 'lightbox-text-overlay';
    //enlargedOverlay.innerHTML = overlayContent.innerHTML;
    
    // Add content to lightbox
    lightboxContent.appendChild(enlargedImage);
    //lightboxContent.appendChild(enlargedOverlay);
    lightboxOverlay.appendChild(lightboxContent);
    
    // Add lightbox to page
    document.body.appendChild(lightboxOverlay);
    
    // Animate in with a longer delay for smoother effect
    setTimeout(() => {
        lightboxOverlay.classList.add('active');
    }, 50); // Slightly longer delay for smoother initiation
    
    // Remove after 30 seconds with smooth exit
    setTimeout(() => {
        lightboxOverlay.classList.remove('active');
        setTimeout(() => {
            if (lightboxOverlay.parentNode) {
                lightboxOverlay.remove();
            }
        }, 800); // Wait for full exit animation
    }, 30000); // 30 seconds

    // Allow clicking to close early
    lightboxOverlay.addEventListener('click', (e) => {
        if (e.target === lightboxOverlay) {
            lightboxOverlay.classList.remove('active');
            setTimeout(() => {
                if (lightboxOverlay.parentNode) {
                    lightboxOverlay.remove();
                }
            }, 800); // Wait for exit animation
        }
    });
}

    // Initial fetch
    fetchDataAndUpdateCounters();

    // Set up polling
    setInterval(fetchDataAndUpdateCounters, POLLING_INTERVAL);
});