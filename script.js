document.addEventListener('DOMContentLoaded', () => {
    // !!! IMPORTANT: PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE !!!
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzH_KYGZafbS-UswAwuki7aMcNghg8_mxxINj-Wpa9fEQzk-zLkOVom9SkSxSDOC8Y/exec';

    const buttons = document.querySelectorAll('.topic-button');
    const feedbackMessageElement = document.getElementById('feedback-message');

    if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
        feedbackMessageElement.textContent = 'ERROR: Apps Script URL not configured in script.js!';
        feedbackMessageElement.className = 'feedback error';
        console.error("FATAL: SCRIPT_URL is not set. Please paste your Google Apps Script Web App URL into script.js");
        return; // Stop if URL not set
    }

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const topic = button.dataset.topic;
            logTopicChoice(topic);
        });
    });

    function logTopicChoice(topic) {
        feedbackMessageElement.textContent = 'Sending...';
        feedbackMessageElement.className = 'feedback'; // Reset class

        // Disable all buttons to prevent multiple submissions
        buttons.forEach(btn => btn.disabled = true);

        fetch(`${SCRIPT_URL}?topic=${encodeURIComponent(topic)}`, {
            method: 'GET', // Apps Script web apps typically use GET for simple data like this
            mode: 'cors',  // Important for cross-origin requests if your script is on script.google.com
                           // and your page is on github.io. However, Apps Script handles this.
                           // For direct Apps Script calls that return JSON, it's often simpler
                           // to use a redirect trick or ensure JSONP if not using 'cors' correctly.
                           // But for simple GET, this should work.
                           // If you get CORS errors, you might need to return `ContentService.createTextOutput().setMimeType(ContentService.MimeType.JAVASCRIPT)`
                           // and wrap the response in a callback for JSONP, or just let the default Apps Script redirect happen.
                           // The current Apps Script returns JSON, which fetch can handle.
        })
        .then(response => {
            if (!response.ok) {
                // If the HTTP response status is not 2xx, throw an error to be caught by .catch()
                // Note: Apps Script redirects for doGet by default. If it's not a direct JSON response,
                // this `response.json()` might fail or need different handling.
                // The provided Apps Script *does* return JSON directly.
                return response.json().then(errData => {
                    throw new Error(errData.message || `Network response was not ok: ${response.statusText}`);
                });
            }
            return response.json(); // Parse the JSON response from Apps Script
        })
        .then(data => {
            console.log('Success:', data);
            if (data.status === "success") {
                feedbackMessageElement.textContent = `Thanks for choosing ${data.topic}! Pick up your sweet!`;
                feedbackMessageElement.className = 'feedback success';
            } else {
                feedbackMessageElement.textContent = `Error: ${data.message}`;
                feedbackMessageElement.className = 'feedback error';
            }
        })
        .catch(error => {
            console.error('Error logging topic:', error);
            feedbackMessageElement.textContent = 'Oops! Something went wrong. Please try again.';
            feedbackMessageElement.className = 'feedback error';
        })
        .finally(() => {
            // Re-enable buttons after a short delay
            setTimeout(() => {
                buttons.forEach(btn => btn.disabled = false);
                // Optionally clear the message after a few more seconds
                // setTimeout(() => {
                //     feedbackMessageElement.textContent = '';
                //     feedbackMessageElement.className = 'feedback';
                // }, 5000);
            }, 1500); // Allow time to read the message
        });
    }
});