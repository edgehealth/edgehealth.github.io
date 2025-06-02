document.addEventListener('DOMContentLoaded', () => {
    // !!! IMPORTANT: PASTE THE GOOGLE APPS SCRIPT WEB APP URL HERE !!!
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzH_KYGZafbS-UswAwuki7aMcNghg8_mxxINj-Wpa9fEQzk-zLkOVom9SkSxSDOC8Y/exec';

    const buttons = document.querySelectorAll('.topic-button');
    const feedbackMessageElement = document.getElementById('feedback-message');

    buttons.forEach(button => {
    button.addEventListener('click', () => {
        const topic = button.dataset.topic;
        
        // Add pressed animation
        button.classList.add('pressed');
        setTimeout(() => {
            button.classList.remove('pressed');
        }, 600);
        
        logTopicChoice(topic);
    });
});

    function logTopicChoice(topic) {
        feedbackMessageElement.textContent = 'Sending...';
        feedbackMessageElement.className = 'feedback'; // Reset class

        // Disable all buttons to prevent multiple submissions
        buttons.forEach(btn => btn.disabled = true);

        fetch(`${SCRIPT_URL}?topic=${encodeURIComponent(topic)}`, {
            method: 'GET', 
            mode: 'cors',  
        })
        .then(response => {
            if (!response.ok) {

                return response.json().then(errData => {
                    throw new Error(errData.message || `Network response was not ok: ${response.statusText}`);
                });
            }
            return response.json(); // Parse the JSON response from Apps Script
        })
        .then(data => {
            console.log('Success:', data);
            if (data.status === "success") {
                feedbackMessageElement.textContent = `Thanks for choosing ${data.topic}! Pick up your treat!`;
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
                // Clear the message after a few more seconds
            setTimeout(() => {
                feedbackMessageElement.textContent = '';
                feedbackMessageElement.className = 'feedback';
                }, 5000);
            }, 1500); // Allow time to read the message
        });
    }
});