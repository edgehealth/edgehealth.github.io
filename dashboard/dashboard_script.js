// dashboard_script.js

document.addEventListener('DOMContentLoaded', () => {
    // !!! IMPORTANT: PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE !!!
    // This MUST be the same URL used in your 'script.js' for the buttons.
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzH_KYGZafbS-UswAwuki7aMcNghg8_mxxINj-Wpa9fEQzk-zLkOVom9SkSxSDOC8Y/exec';

    const chartDiv = document.getElementById('chart_div');
    const lastUpdatedDiv = document.getElementById('last_updated');
    const errorMessageDiv = document.getElementById('error_message');
    const POLLING_INTERVAL = 7000; // Fetch data every 7 seconds (7000 ms)
                                    // Adjust as needed. Be mindful of Apps Script quotas.


    // Load the Google Visualization API and the corechart package.
    google.charts.load('current', {'packages':['corechart', 'bar']}); // 'corechart' for most charts, 'bar' for Material Bar

    // Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(fetchDataAndDrawChart);

    let chart; // To store the chart object for updates
    let chartOptions; // To store chart options

    function fetchDataAndDrawChart() {
        errorMessageDiv.textContent = ''; // Clear previous errors
        // Add 'action=getTopicData' and a cache-busting parameter
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
                console.log("Data fetched for chart:", data);
                drawChart(data);
                lastUpdatedDiv.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
            })
            .catch(error => {
                console.error('Error fetching or drawing chart:', error);
                errorMessageDiv.textContent = `Error: ${error.message}. Retrying in ${POLLING_INTERVAL/1000}s...`;
                // Optionally, you could clear the chart or show a static "error fetching data" message
                // chartDiv.innerHTML = '<p style="color:red; text-align:center;">Could not load chart data. Retrying...</p>';
            });
    }

    function drawChart(apiData) {
        if (!google.visualization || !google.visualization.arrayToDataTable) {
            console.error("Google Charts library not fully loaded yet.");
            errorMessageDiv.textContent = "Chart library not ready. Please wait...";
            const spinner = chartDiv.querySelector('.loading-spinner');
            if (spinner) spinner.remove();
            return;
        }

        const dataTable = google.visualization.arrayToDataTable(apiData);

        // Your defined brand colors
        const topicColors = {
            "Data Engineering": "#c18dbe", // Pink
            "AI": "#56BABF",               // Blue
            "Analytics": "#F28F64",        // Orange
            "Economic Evaluations": "#559370" // Green
        };


               // --- KEY CHANGE FOR ANNOTATIONS AND COLORS ---
        // We need to add an annotation column and a style column for colors.
        // The data structure will be: [Topic, Count, {role: 'style'}, {role: 'annotation'}]

        const dataWithStylesAndAnnotations = [
            // Add the style role and annotation role to the header
            ['Topic', 'Count', { role: 'style' }, { role: 'annotation' }]
        ];
        
        let maxCount = 0; // <<<< Initialize maxCount

        if (apiData && apiData.length > 1) {
            for (let i = 1; i < apiData.length; i++) {
                const topicName = apiData[i][0];
                const count = apiData[i][1];
                const color = topicColors[topicName] || '#cccccc';
    
                if (count > maxCount) { // <<<< Find the maximum count
                    maxCount = count;
                }
    
                dataWithStylesAndAnnotations.push([topicName, count, color, String(count)]);
            }
        }

        const styledDataTable = google.visualization.arrayToDataTable(dataWithStylesAndAnnotations);
        
        let vAxisMax;
        if (maxCount === 0) {
            vAxisMax = 5; // Or 1, or 10 - a sensible minimum if no data yet
        } else {
            // Add a percentage buffer (e.g., 20%) or a fixed buffer
            // Adjust this buffer as needed for your annotation font size
            const buffer = Math.ceil(maxCount * 0.20); // 20% buffer
            // const fixedBuffer = 2; // Or a fixed buffer, e.g., add 2 units
            vAxisMax = maxCount + Math.max(buffer, 1); // Ensure at least 1 unit buffer
        }

        const chartOptions = {
            title: 'Topic Popularity by Selections',
            titleTextStyle: { color: '#1D1B38', fontSize: 18, bold: false },
            vAxis: {
                title: 'Number of Selections',
                minValue: 0,
                format: '0', // Ensures whole numbers on the axis
                gridlines: { color: '#e0e0e0' },
                textStyle: { color: '#555' },
                titleTextStyle: { color: '#333' },
                viewWindow: {
                    min: 0,
                    max: vAxisMax  // <<<< Use the calculated maximum
                }
            },
            hAxis: {
                title: 'Topic',
                textStyle: { color: '#555' },
                titleTextStyle: { color: '#333' }
            },
            legend: { position: 'none' },
            chartArea: { width: '80%', height: '75%' }, // Adjust to give space for labels and annotations
            animation: {
                duration: 1000,
                easing: 'out',
                startup: true
            },
            // The 'colors' option is not needed here because we are using the style role column
            bar: { groupWidth: "60%" }, // For ColumnChart, makes bars a bit thicker
            // --- ANNOTATION STYLING ---
            annotations: {
                alwaysOutside: true, // false to try and fit inside, true to force outside
                textStyle: {
                    fontSize: 20,
                    color: '#000', // Color of the annotation text
                    auraColor: 'none' // Set to 'none' if you don't want an outline, or a color like '#fff' for a white outline
                },
            }

        };

        const spinner = chartDiv.querySelector('.loading-spinner');
        if (spinner) spinner.remove();

        if (!chart) {
            chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
        }
        chart.draw(styledDataTable, chartOptions);
    }

    setInterval(fetchDataAndDrawChart, POLLING_INTERVAL);
});