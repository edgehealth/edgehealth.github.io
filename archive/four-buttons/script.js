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
    let pageResetTimeoutId = null; // Timer for resetting the whole page state

    const PAGE_RESET_DELAY = 30000; // 30 seconds of inactivity to reset the page

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

    function resetPageToInitialState() {
        console.log("Resetting page to initial state due to inactivity or completion.");
        clearTimeout(pageResetTimeoutId); // Clear any pending reset

        // Hide feedback message
        feedbackMessageElement.textContent = '';
        feedbackMessageElement.className = 'feedback'; // Reset class

        // Hide and reset email form
        emailForm.classList.remove('show');
        setTimeout(() => { // Allow transition out
            emailForm.style.display = 'none';
            emailInput.value = '';
            emailFeedback.textContent = '';
            emailFeedback.className = 'email-feedback';
        }, 500); // Match CSS transition duration for .email-form if any

        // Re-enable topic buttons (if they were disabled)
        buttons.forEach(btn => btn.disabled = false);
        // Re-enable email form buttons (if they were disabled)
        submitEmailBtn.disabled = false;
        skipEmailBtn.disabled = false;

        selectedTopic = null; // Clear selected topic
    }

    function startPageResetTimer() {
        clearTimeout(pageResetTimeoutId); // Clear existing timer
        pageResetTimeoutId = setTimeout(resetPageToInitialState, PAGE_RESET_DELAY);
        console.log(`Page reset timer started for ${PAGE_RESET_DELAY / 1000}s`);
    }

    function logTopicChoice(topic, displayName) {
        resetPageToInitialState(); // Clear previous state immediately before new interaction

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
            console.log('Topic Log Success:', data);
            if (data.status === "success") {
                feedbackMessageElement.innerHTML = `Thanks for choosing ${displayName}!<br>Pick up your gift and check out our interactive dashboard to find out more.`;
                feedbackMessageElement.className = 'feedback success';
                showEmailForm(); // This will also start/restart the page reset timer
            } else {
                feedbackMessageElement.textContent = `Error: ${data.message}`;
                feedbackMessageElement.className = 'feedback error';
                buttons.forEach(btn => btn.disabled = false); // Re-enable if topic logging failed
                startPageResetTimer(); // Start timer even on error to eventually clear message
            }
        })
        .catch(error => {
            console.error('Error logging topic:', error);
            feedbackMessageElement.textContent = 'Oops! Something went wrong. Please try again.';
            feedbackMessageElement.className = 'feedback error';
            buttons.forEach(btn => btn.disabled = false); // Re-enable on catch
            startPageResetTimer(); // Start timer even on error to eventually clear message
        })
        // .finally() no longer needed here for topic buttons re-enabling, handled by reset or error paths
    }

    function showEmailForm() {
        emailForm.style.display = 'block';
        emailForm.offsetHeight; // Force reflow
        requestAnimationFrame(() => {
            emailForm.classList.add('show');
            if (!navigator.userAgent.includes('iPhone') && !navigator.userAgent.includes('iPad')) {
                setTimeout(() => {
                    emailInput.focus();
                }, 100);
            }
        });
        startPageResetTimer(); // When email form is shown, ensure the page reset timer is active
    }

    function hideEmailFormAndPotentiallyResetPage(isSuccess = false) {
        clearTimeout(pageResetTimeoutId); // Stop the main page reset timer

        emailForm.classList.remove('show');
        setTimeout(() => {
            emailForm.style.display = 'none';
            emailInput.value = ''; // Reset input
            emailFeedback.textContent = ''; // Reset feedback
            emailFeedback.className = 'email-feedback';

            // If email was successful, we want to show the "Thank you" message
            // for a bit, then reset the whole page.
            // If "skip" was pressed, we reset immediately.
            if (isSuccess) {
                // Email feedback (e.g., "Thank you!") is already shown.
                // Wait a bit for user to read it, then reset the page.
                setTimeout(resetPageToInitialState, 2500); // Wait for success message to be read
            } else {
                // If skip or auto-hide, reset the page state sooner
                resetPageToInitialState();
            }
        }, 500); // Email form hide transition
    }


    function handleEmailSubmit(e) {
        e.preventDefault();
        clearTimeout(pageResetTimeoutId); // User is active, clear general page reset timer

        const email = emailInput.value.trim();
        if (!email) {
            emailFeedback.textContent = 'Please enter an email address.';
            emailFeedback.className = 'email-feedback error';
            startPageResetTimer(); // Restart timer if validation fails
            return;
        }
        if (!isValidEmail(email)) {
            emailFeedback.textContent = 'Please enter a valid email address.';
            emailFeedback.className = 'email-feedback error';
            startPageResetTimer(); // Restart timer if validation fails
            return;
        }
        submitEmail(email, selectedTopic);
    }

    submitEmailBtn.addEventListener('click', handleEmailSubmit);
    // Add touchend for submitEmailBtn as before if needed

    function handleSkipEmail(e) {
        e.preventDefault();
        // User clicked skip, so we hide the form and reset the page.
        hideEmailFormAndPotentiallyResetPage(false); // false indicates not a success
    }

    skipEmailBtn.addEventListener('click', handleSkipEmail);
    // Add touchend for skipEmailBtn as before if needed

    emailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleEmailSubmit(e);
        } else {
            // Any typing can be considered activity
            startPageResetTimer();
        }
    });
    emailInput.addEventListener('focus', startPageResetTimer); // Focus on input resets timer


    function submitEmail(email, topic) {
        emailFeedback.textContent = 'Submitting...';
        emailFeedback.className = 'email-feedback';
        submitEmailBtn.disabled = true;
        skipEmailBtn.disabled = true;

        // No need to call startPageResetTimer() here as success/error will handle it

        fetch(`${SCRIPT_URL}?email=${encodeURIComponent(email)}&topic=${encodeURIComponent(topic || 'Not specified')}`, {
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
            console.log('Email Submit Success:', data);
            if (data.status === "success") {
                emailFeedback.textContent = 'Thank you! We\'ll be in touch.';
                emailFeedback.className = 'email-feedback success';
                // After showing success, the form and page will reset
                hideEmailFormAndPotentiallyResetPage(true); // true indicates success
            } else {
                emailFeedback.textContent = `Error: ${data.message}`;
                emailFeedback.className = 'email-feedback error';
                submitEmailBtn.disabled = false;
                skipEmailBtn.disabled = false;
                startPageResetTimer(); // Restart timer if email submission failed
            }
        })
        .catch(error => {
            console.error('Error submitting email:', error);
            emailFeedback.textContent = 'Oops! Something went wrong. Please try again.';
            emailFeedback.className = 'email-feedback error';
            submitEmailBtn.disabled = false;
            skipEmailBtn.disabled = false;
            startPageResetTimer(); // Restart timer on catch
        });
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Initial call to set the timer if the page loads and nothing happens
    // Or, you might decide the timer only starts after the first interaction.
    // For a kiosk, starting it immediately makes sense.
    // startPageResetTimer();
    // Let's make it so the timer only starts *after* the first topic choice.
});