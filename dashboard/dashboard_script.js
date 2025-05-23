// dashboard_script.js

document.addEventListener('DOMContentLoaded', () => {
    // !!! IMPORTANT: PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE !!!
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzH_KYGZafbS-UswAwuki7aMcNghg8_mxxINj-Wpa9fEQzk-zLkOVom9SkSxSDOC8Y/exec';

    const lastUpdatedDiv = document.getElementById('last_updated');
    const errorMessageDiv = document.getElementById('error_message');
    const loadingDiv = document.getElementById('loading');
    const POLLING_INTERVAL = 3000; // Fetch data every 3 seconds for more responsive updates

    // Track previous counts to detect new votes
    let previousCounts = {
        "Data Engineering": 0,
        "AI": 0,
        "Analytics": 0,
        "Economic Evaluations": 0
    };

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
                        
                        // Add pulse animation to counter if count increased
                        if (count > previousCounts[topicName]) {
                            counterElement.classList.add('pulse');
                            setTimeout(() => {
                                counterElement.classList.remove('pulse');
                            }, 1000);
                        }
                    }
                }

                // Check if this topic got a new vote and trigger image enlargement
                if (count > previousCounts[topicName]) {
                    console.log(`New vote detected for ${topicName}! Count: ${previousCounts[topicName]} → ${count}`);
                    enlargeImage(topicKey);
                }

                // Update previous count
                previousCounts[topicName] = count;
            }
        }
    }

    function enlargeImage(topicKey) {
        const quadrant = document.getElementById(`quadrant-${topicKey}`);
        if (quadrant) {
            // Add enlarged class
            quadrant.classList.add('enlarged');
            
            // Remove the class after 30 seconds
            setTimeout(() => {
                quadrant.classList.remove('enlarged');
            }, 30000); // 30 seconds
        }
    }

    // Initial fetch
    fetchDataAndUpdateCounters();

    // Set up polling
    setInterval(fetchDataAndUpdateCounters, POLLING_INTERVAL);
});