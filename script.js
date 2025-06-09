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
    let emailFormTimeoutId = null; // Variable to store the timeout ID

    const AUTO_HIDE_EMAIL_FORM_DELAY = 30000; // email form disappears after 30 seconds if no interaction

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

        // Clear any existing auto-hide timer for the form (e.g., if a new topic is chosen quickly)
        clearTimeout(emailFormTimeoutId);
        // Ensure form is hidden if it was previously shown and auto-hidden
        // (and now user picks another topic)
        if (emailForm.classList.contains('show')) {
             hideEmailForm(false); // Hide immediately without success message delay
        }


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
                showEmailForm();
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
        emailForm.style.display = 'block';
        emailForm.offsetHeight;
        requestAnimationFrame(() => {
            emailForm.classList.add('show');
            if (!navigator.userAgent.includes('iPhone') && !navigator.userAgent.includes('iPad')) {
                setTimeout(() => {
                    emailInput.focus();
                }, 100);
            }
        });

        // Start the auto-hide timer
        clearTimeout(emailFormTimeoutId); // Clear any previous timer
        emailFormTimeoutId = setTimeout(() => {
            console.log("Auto-hiding email form due to inactivity.");
            hideEmailForm(false); // Pass false to not delay based on success message
        }, AUTO_HIDE_EMAIL_FORM_DELAY);
    }

    // Modify hideEmailForm to accept an optional parameter
    // `delayForSuccessMessage` to control the timeout for hiding.
    // If called by auto-hide, we might want to hide it faster.
    function hideEmailForm(delayForSuccessMessage = true) {
        clearTimeout(emailFormTimeoutId); // Always clear the auto-hide timer when hiding

        emailForm.classList.remove('show');
        const hideDelay = delayForSuccessMessage ? 500 : 100; // Shorter delay if not success
        setTimeout(() => {
            emailForm.style.display = 'none';
            resetForm();
        }, hideDelay);
    }

    function resetForm() {
        emailInput.value = '';
        emailFeedback.textContent = '';
        emailFeedback.className = 'email-feedback';
        // feedbackMessageElement.textContent = ''; // Keep the topic choice feedback
        // feedbackMessageElement.className = 'feedback';
    }

    function handleEmailSubmit(e) {
        e.preventDefault();
        clearTimeout(emailFormTimeoutId); // Clear auto-hide timer on interaction

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

    // Attach event listeners
    submitEmailBtn.addEventListener('click', handleEmailSubmit);
    // For touchend, it's better to prevent default and then call the handler
    // to avoid potential double calls if 'click' also fires.
    // However, modern browsers are good at handling this. Simpler is:
    // submitEmailBtn.addEventListener('touchend', handleEmailSubmit);
    // But to be safe and avoid double logic:
    let touchendSubmitHandled = false;
    submitEmailBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (touchendSubmitHandled) return;
        touchendSubmitHandled = true;
        handleEmailSubmit(e);
        setTimeout(() => { touchendSubmitHandled = false; }, 300); // Reset flag
    });


    function handleSkipEmail(e) {
        e.preventDefault();
        clearTimeout(emailFormTimeoutId); // Clear auto-hide timer on interaction
        hideEmailForm(false); // Hide form, no need for long delay
    }

    skipEmailBtn.addEventListener('click', handleSkipEmail);
    let touchendSkipHandled = false;
    skipEmailBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (touchendSkipHandled) return;
        touchendSkipHandled = true;
        handleSkipEmail(e);
        setTimeout(() => { touchendSkipHandled = false; }, 300); // Reset flag
    });


    emailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleEmailSubmit(e); // This will also clear the timer
        }
    });

    function submitEmail(email, topic) {
        emailFeedback.textContent = 'Submitting...';
        emailFeedback.className = 'email-feedback';
        submitEmailBtn.disabled = true;
        skipEmailBtn.disabled = true;

        fetch(`${SCRIPT_URL}?email=${encodeURIComponent(email)}&topic=${encodeURIComponent(topic || 'Not specified')}`, { // Ensure topic is sent
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
                    hideEmailForm(true); // Hide form after success message, allow delay
                }, 2500);
            } else {
                emailFeedback.textContent = `Error: ${data.message}`;
                emailFeedback.className = 'email-feedback error';
                // Re-enable buttons if server-side error on email submission
                submitEmailBtn.disabled = false;
                skipEmailBtn.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error submitting email:', error);
            emailFeedback.textContent = 'Oops! Something went wrong. Please try again.';
            emailFeedback.className = 'email-feedback error';
        })
        .finally(() => {
            // Only re-enable if not already handled by success/error specific logic
            // The success path has its own timeout for hiding the form.
            // If error on submit, we re-enable above.
            // This finally might be too broad.
            // Let's ensure buttons are enabled if the success path isn't taken for hiding
            if (!emailFeedback.classList.contains('success')) {
                submitEmailBtn.disabled = false;
                skipEmailBtn.disabled = false;
            }
        });
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
});