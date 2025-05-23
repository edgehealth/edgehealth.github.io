
document.addEventListener('DOMContentLoaded', () => {
    // !!! IMPORTANT: PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE !!!
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzH_KYGZafbS-UswAwuki7aMcNghg8_mxxINj-Wpa9fEQzk-zLkOVom9SkSxSDOC8Y/exec';

    const lastUpdatedDiv = document.getElementById('last_updated');
    const errorMessageDiv = document.getElementById('error_message');
    const loadingDiv = document.getElementById('loading');
    const POLLING_INTERVAL = 3000; // Fetch data every 3 seconds for more responsive updates

    // Track previous counts to detect new votes
    let previousCounts = {
        "Data Engineering": null,  // Start with null instead of 0
        "AI": null,
        "Analytics": null,
        "Economic Evaluations": null
    };

    let isInitialized = false; // Flag to track if we've set initial baseline

    // Mapping for easier reference
    const topicMapping = {
        "Data Engineering": "data-engineering",
        "AI": "ai", 
        "Analytics": "analytics",
        "Economic Evaluations": "econ-eval"
    };

    function fetchDataAndUpdateCounters() {
        errorMessageDiv.textContent = ''; // Clear previous errors
        loadingDiv.style.display = 'block';
        
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
                console.log("Data fetched for counters:", data);
                updateCounters(data);
                lastUpdatedDiv.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
                loadingDiv.style.display = 'none';
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                errorMessageDiv.textContent = `Error: ${error.message}. Retrying in ${POLLING_INTERVAL/1000}s...`;
                loadingDiv.style.display = 'none';
            });
    }

    function updateCounters(apiData) {
        if (!apiData || apiData.length < 2) {
            console.log("No data available yet");
            return;
        }

        // Skip header row (index 0), process data rows
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
                        
                        // Only add pulse animation if initialized and count increased
                        if (isInitialized && previousCounts[topicName] !== null && count > previousCounts[topicName]) {
                            counterElement.classList.add('pulse');
                            setTimeout(() => {
                                counterElement.classList.remove('pulse');
                            }, 1000);
                        }
                    }
                }

                // Check if this topic got a new vote and trigger image enlargement
                // ONLY if we're initialized and there's a real increase
                if (isInitialized && previousCounts[topicName] !== null && count > previousCounts[topicName]) {
                    console.log(`New vote detected for ${topicName}! Count: ${previousCounts[topicName]} → ${count}`);
                    enlargeImageLightbox(topicKey);
                }

                // Update previous count
                previousCounts[topicName] = count;
            }
        }

        // Mark that we've completed initialization
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
        const sourceLabel = sourceQuadrant.querySelector('.quadrant-label');
        
        if (!sourceImage) return;

        // Create lightbox overlay
        const lightboxOverlay = document.createElement('div');
        lightboxOverlay.className = 'lightbox-overlay';
        
        // Create lightbox content
        const lightboxContent = document.createElement('div');
        lightboxContent.className = 'lightbox-content';
        
        // Clone the image and label
        const enlargedImage = sourceImage.cloneNode(true);
        enlargedImage.className = 'lightbox-image';
        
        const enlargedLabel = sourceLabel.cloneNode(true);
        enlargedLabel.className = 'lightbox-label';
        
        // Add content to lightbox
        lightboxContent.appendChild(enlargedImage);
        lightboxContent.appendChild(enlargedLabel);
        lightboxOverlay.appendChild(lightboxContent);
        
        // Add lightbox to page
        document.body.appendChild(lightboxOverlay);
        
        // Animate in
        setTimeout(() => {
            lightboxOverlay.classList.add('active');
        }, 10);
        
        // Remove after 30 seconds
        setTimeout(() => {
            lightboxOverlay.classList.remove('active');
            setTimeout(() => {
                if (lightboxOverlay.parentNode) {
                    lightboxOverlay.remove();
                }
            }, 500); // Wait for fade out animation
        }, 30000); // 30 seconds

        // Allow clicking to close early
        lightboxOverlay.addEventListener('click', (e) => {
            if (e.target === lightboxOverlay) {
                lightboxOverlay.classList.remove('active');
                setTimeout(() => {
                    if (lightboxOverlay.parentNode) {
                        lightboxOverlay.remove();
                    }
                }, 500);
            }
        });
    }

    // Initial fetch
    fetchDataAndUpdateCounters();

    // Set up polling
    setInterval(fetchDataAndUpdateCounters, POLLING_INTERVAL);
});