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

    let selectedTopic = null;

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const topic = button.dataset.topic;
            const showName = button.dataset.showName;

            selectedTopic = topic;

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
                
                // Show email form with longer delay for better UX
                setTimeout(() => {
                    showEmailForm();
                }, 3000); // Increased from 2000ms
                
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
            setTimeout(() => {
                buttons.forEach(btn => btn.disabled = false);
            }, 1500);
        });
    }

    function showEmailForm() {
        // Force layout recalculation for iOS Safari
        emailForm.style.display = 'block';
        emailForm.offsetHeight; // Force reflow
        
        // Use requestAnimationFrame for better iOS compatibility
        requestAnimationFrame(() => {
            emailForm.classList.add('show');
            // Focus on input for better mobile UX (but not on iOS where it causes keyboard issues)
            if (!navigator.userAgent.includes('iPhone') && !navigator.userAgent.includes('iPad')) {
                setTimeout(() => {
                    emailInput.focus();
                }, 100);
            }
        });
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

    // Email submission with iOS-friendly event handling
    submitEmailBtn.addEventListener('click', handleEmailSubmit);
    submitEmailBtn.addEventListener('touchend', handleEmailSubmit); // iOS fallback

    function handleEmailSubmit(e) {
        e.preventDefault();
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
    }

    // Skip email with iOS-friendly event handling
    skipEmailBtn.addEventListener('click', hideEmailForm);
    skipEmailBtn.addEventListener('touchend', hideEmailForm); // iOS fallback

    // Enter key submission
    emailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleEmailSubmit(e);
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
                }, 2500); // Slightly longer to read success message
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