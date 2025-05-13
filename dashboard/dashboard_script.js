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
            // Remove spinner if it's still there
            const spinner = chartDiv.querySelector('.loading-spinner');
            if (spinner) spinner.remove();
            return;
        }

        const dataTable = google.visualization.arrayToDataTable(apiData);

        // Define consistent colors based on your button colors
        const topicColors = {
            "Data Engineering": "#c18dbe", // Pink (from your style.css)
            "AI": "#56BABF",               // Blue
            "Analytics": "#F28F64",        // Orange
            "Economic Evaluation": "#559370" // Green
        };

        // Build the colors array in the order they appear in apiData (after header)
        let orderedColors = [];
        if (apiData && apiData.length > 1) {
            for (let i = 1; i < apiData.length; i++) {
                const topicName = apiData[i][0];
                orderedColors.push(topicColors[topicName] || '#cccccc'); // Default to gray if not found
            }
        }

        chartOptions = {
            title: 'Topic Popularity by Selections',
            titleTextStyle: { color: '#005EB8', fontSize: 18, bold: false },
            // Use 'bars: 'horizontal'' for horizontal bar chart, or remove for vertical column chart
            // bars: 'horizontal', // For BarChart (classic)
            // hAxis: { title: 'Number of Selections', minValue: 0, textStyle: { color: '#555' }, titleTextStyle: { color: '#333' } },
            // vAxis: { title: 'Topic', textStyle: { color: '#555' }, titleTextStyle: { color: '#333' } },
            // For ColumnChart (vertical bars)
            vAxis: { title: 'Number of Selections', minValue: 0, format: '0', gridlines: { color: '#e0e0e0' }, textStyle: { color: '#555' }, titleTextStyle: { color: '#333' } },
            hAxis: { title: 'Topic', textStyle: { color: '#555' }, titleTextStyle: { color: '#333' } },
            legend: { position: 'none' }, // 'none', 'top', 'bottom', 'right', 'in'
            chartArea: { width: '80%', height: '75%' }, // Adjust to give space for labels
            animation: {
                duration: 1000,
                easing: 'out',
                startup: true // Animate on first draw
            },
            colors: orderedColors.length > 0 ? orderedColors : ['#005EB8', '#007A33', '#DA291C', '#FFB81C'], // Fallback NHS-ish colors
            bar: { groupWidth: "60%" } // For ColumnChart, makes bars a bit thicker
        };

        // Remove spinner before drawing
        const spinner = chartDiv.querySelector('.loading-spinner');
        if (spinner) spinner.remove();

        // Create a new chart instance or update existing
        // Using ColumnChart for vertical bars
        if (!chart) {
            chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
            // For horizontal bars:
            // chart = new google.visualization.BarChart(document.getElementById('chart_div'));
        }
        chart.draw(dataTable, chartOptions);
    }

    // Initial call and set up polling
    // fetchDataAndDrawChart(); // Called by setOnLoadCallback
    setInterval(fetchDataAndDrawChart, POLLING_INTERVAL);
});