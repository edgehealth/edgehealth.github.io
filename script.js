document.addEventListener('DOMContentLoaded', () => {
    // !!! IMPORTANT: PASTE THE GOOGLE APPS SCRIPT WEB APP URL HERE !!!
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzH_KYGZafbS-UswAwuki7aMcNghg8_mxxINj-Wpa9fEQzk-zLkOVom9SkSxSDOC8Y/exec';

    const buttons = document.querySelectorAll('.topic-button');
    const feedbackMessageElement = document.getElementById('feedback-message');
    const emailForm = document.getElementById('email-form');
    const emailInput = document.getElementById('email-input');
    const submitEmailBtn = document.getElementById('submit-email');
    const skipEmailBtn = document.getElementById('skip-email');
    const emailFeedback = document.getElementById('email-feedback');

    let selectedTopic = null; // Store the selected topic for email submission

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const topic = button.dataset.topic;
            const showName = button.dataset.showName;

            // Store selected topic for potential email submission
            selectedTopic = topic;

            // Add pressed animation
            button.classList.add('pressed');
            setTimeout(() => {
                button.classList.remove('pressed');
            }, 600);

            logTopicChoice(topic, showName);
        });
    });

    function logTopicChoice(topic, displayName) {
        feedbackMessageElement.textContent = 'Sending...';
        feedbackMessageElement.className = 'feedback';

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
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            if (data.status === "success") {
                feedbackMessageElement.innerHTML = `Thanks for choosing ${displayName}!<br>Pick up your gift and check out our interactive dashboard to find out more.`;
                feedbackMessageElement.className = 'feedback success';
                
                // Show email form after successful topic submission
                setTimeout(() => {
                    showEmailForm();
                }, 2000);
                
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
            }, 1500);
        });
    }

    function showEmailForm() {
        emailForm.style.display = 'block';
        setTimeout(() => {
            emailForm.classList.add('show');
        }, 100);
    }

    function hideEmailForm() {
        emailForm.classList.remove('show');
        setTimeout(() => {
            emailForm.style.display = 'none';
            resetForm();
        }, 500);
    }

    function resetForm() {
        emailInput.value = '';
        emailFeedback.textContent = '';
        emailFeedback.className = 'email-feedback';
        feedbackMessageElement.textContent = '';
        feedbackMessageElement.className = 'feedback';
    }

    // Email submission
    submitEmailBtn.addEventListener('click', () => {
        const email = emailInput.value.trim();
        
        if (!email) {
            emailFeedback.textContent = 'Please enter an email address.';
            emailFeedback.className = 'email-feedback error';
            return;
        }

        if (!isValidEmail(email)) {
            emailFeedback.textContent = 'Please enter a valid email address.';
            emailFeedback.className = 'email-feedback error';
            return;
        }

        submitEmail(email, selectedTopic);
    });

    // Skip email
    skipEmailBtn.addEventListener('click', () => {
        hideEmailForm();
    });

    // Enter key submission
    emailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitEmailBtn.click();
        }
    });

    function submitEmail(email, topic) {
        emailFeedback.textContent = 'Submitting...';
        emailFeedback.className = 'email-feedback';
        
        submitEmailBtn.disabled = true;
        skipEmailBtn.disabled = true;

        fetch(`${SCRIPT_URL}?email=${encodeURIComponent(email)}&topic=${encodeURIComponent(topic)}`, {
            method: 'GET',
            mode: 'cors',
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errData => {
                    throw new Error(errData.message || `Network response was not ok: ${response.statusText}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Email Success:', data);
            if (data.status === "success") {
                emailFeedback.textContent = 'Thank you! We\'ll be in touch.';
                emailFeedback.className = 'email-feedback success';
                
                setTimeout(() => {
                    hideEmailForm();
                }, 2000);
            } else {
                emailFeedback.textContent = `Error: ${data.message}`;
                emailFeedback.className = 'email-feedback error';
            }
        })
        .catch(error => {
            console.error('Error submitting email:', error);
            emailFeedback.textContent = 'Oops! Something went wrong. Please try again.';
            emailFeedback.className = 'email-feedback error';
        })
        .finally(() => {
            submitEmailBtn.disabled = false;
            skipEmailBtn.disabled = false;
        });
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
});