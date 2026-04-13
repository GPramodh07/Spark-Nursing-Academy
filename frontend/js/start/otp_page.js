/**
 * ============================================
 * Spark Nurses Academy – OTP Page JavaScript
 * ============================================
 *
 * Handles:
 *  1. Loading the phone number from URL params / sessionStorage
 *  2. OTP digit input with auto-advance, paste support
 *  3. Toggle between OTP section and phone-update section
 *  4. Basic validation for OTP and phone number
 *  5. Simulated verify & update actions (console.log)
 *
 * Backend integration will be added later.
 */

(() => {
    'use strict';

    // =============================================
    // DOM References
    // =============================================

    // Phone display
    const phoneNumberEl = document.getElementById('phoneNumber');

    // OTP section
    const otpSection = document.getElementById('otpSection');
    const otpDigits = document.querySelectorAll('.otp-digit');
    const otpError = document.getElementById('otpError');
    const verifyBtn = document.getElementById('verifyBtn');
    const resendOtpLink = document.getElementById('resendOtp');

    // Wrong number toggle
    const wrongNumberSection = document.getElementById('wrongNumberSection');
    const wrongNumberLink = document.getElementById('wrongNumberLink');

    // Phone update section
    const phoneUpdateSection = document.getElementById('phoneUpdateSection');
    const newPhoneInput = document.getElementById('newPhone');
    const newPhoneGroup = document.getElementById('newPhoneGroup');
    const updatePhoneBtn = document.getElementById('updatePhoneBtn');
    const cancelUpdateBtn = document.getElementById('cancelUpdateBtn');

    // Status message
    const statusMessage = document.getElementById('statusMessage');

    // =============================================
    // State
    // =============================================

    let currentPhone = '';
    const RESEND_COOLDOWN = 30; // seconds

    // =============================================
    // Initialisation – Load Phone Number
    // =============================================

    /**
     * Attempts to read the phone number from:
     *  1. URL search params (?phone=...)
     *  2. sessionStorage ('userPhone')
     * Falls back to a placeholder if neither is available.
     */
    function loadPhoneNumber() {
        const params = new URLSearchParams(window.location.search);
        const phoneFromUrl = params.get('phone');
        const phoneFromStorage = sessionStorage.getItem('userPhone');

        currentPhone = phoneFromUrl || phoneFromStorage || '';

        if (currentPhone) {
            phoneNumberEl.textContent = formatPhoneDisplay(currentPhone);
        } else {
            // No phone available – show placeholder
            phoneNumberEl.textContent = 'No phone number provided';
        }
    }

    /**
     * Formats a raw phone string for display.
     * If it already starts with '+' keep as-is; otherwise prefix +91 (default).
     */
    function formatPhoneDisplay(phone) {
        const cleaned = phone.replace(/[^\d+]/g, '');
        if (cleaned.startsWith('+')) return cleaned;
        return '+91 ' + cleaned;
    }

    loadPhoneNumber();

    // =============================================
    // OTP Input Handling
    // =============================================

    /**
     * Auto-advance: move focus to the next box on digit entry.
     * Backspace: clear current and move focus to the previous box.
     */
    otpDigits.forEach((input, index) => {
        // Only allow digits
        input.addEventListener('input', (e) => {
            const value = e.target.value;

            // Strip non-digit characters
            if (/\D/.test(value)) {
                input.value = value.replace(/\D/g, '');
                return;
            }

            // Mark filled state
            input.classList.toggle('filled', input.value.length === 1);

            // Clear error styling when user types
            input.classList.remove('error');
            hideOtpError();

            // Auto-advance to next box
            if (input.value.length === 1 && index < otpDigits.length - 1) {
                otpDigits[index + 1].focus();
            }
        });

        // Handle backspace navigation
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                if (input.value === '' && index > 0) {
                    otpDigits[index - 1].focus();
                    otpDigits[index - 1].value = '';
                    otpDigits[index - 1].classList.remove('filled');
                } else {
                    input.classList.remove('filled');
                }
            }

            // Arrow-key navigation
            if (e.key === 'ArrowLeft' && index > 0) {
                otpDigits[index - 1].focus();
            }
            if (e.key === 'ArrowRight' && index < otpDigits.length - 1) {
                otpDigits[index + 1].focus();
            }
        });

        // Select text on focus for easy overwrite
        input.addEventListener('focus', () => input.select());
    });

    /**
     * Paste support: distribute pasted digits across all boxes.
     */
    otpDigits[0].addEventListener('paste', (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData)
            .getData('text')
            .replace(/\D/g, '')
            .slice(0, 6);

        if (pasted.length === 0) return;

        pasted.split('').forEach((char, i) => {
            if (otpDigits[i]) {
                otpDigits[i].value = char;
                otpDigits[i].classList.add('filled');
            }
        });

        // Focus the box after the last pasted digit
        const focusIndex = Math.min(pasted.length, otpDigits.length - 1);
        otpDigits[focusIndex].focus();

        hideOtpError();
    });

    // =============================================
    // OTP Helpers
    // =============================================

    /** Collect OTP value from all 6 boxes. */
    function getOtpValue() {
        return Array.from(otpDigits).map(d => d.value).join('');
    }

    /** Show the OTP error message. */
    function showOtpError(msg) {
        if (msg) otpError.textContent = msg;
        otpError.classList.add('visible');
        otpDigits.forEach(d => d.classList.add('error'));
    }

    /** Hide the OTP error message. */
    function hideOtpError() {
        otpError.classList.remove('visible');
        otpDigits.forEach(d => d.classList.remove('error'));
    }

    /** Clear all OTP inputs. */
    function clearOtpInputs() {
        otpDigits.forEach(d => {
            d.value = '';
            d.classList.remove('filled', 'error');
        });
        hideOtpError();
        otpDigits[0].focus();
    }

    // =============================================
    // Status Message Helpers
    // =============================================

    function showStatus(msg, type) {
        statusMessage.textContent = msg;
        statusMessage.className = 'status-message ' + type; // 'error' or 'success'
    }

    function hideStatus() {
        statusMessage.className = 'status-message';
        statusMessage.textContent = '';
    }

    // =============================================
    // Verify OTP
    // =============================================

    verifyBtn.addEventListener('click', () => {
        hideStatus();
        const otp = getOtpValue();

        // Validation: must be exactly 6 digits
        if (otp.length !== 6 || /\D/.test(otp)) {
            showOtpError('Please enter a valid 6-digit OTP');
            otpDigits[0].focus();
            return;
        }

        hideOtpError();

        // Simulate sending OTP to backend
        console.log('[OTP Verify] Phone:', currentPhone, '| OTP:', otp);

        // UI feedback – simulate loading
        const original = verifyBtn.textContent;
        verifyBtn.textContent = 'Verifying…';
        verifyBtn.disabled = true;

        // Simulate async backend call
        setTimeout(() => {
            verifyBtn.textContent = original;
            verifyBtn.disabled = false;

            // For now, show success status (backend will handle real verification)
            showStatus('OTP submitted successfully. Awaiting backend verification.', 'success');
            console.log('[OTP Verify] Simulated success for OTP:', otp);
        }, 1500);
    });

    // =============================================
    // Resend OTP with Cooldown Timer
    // =============================================

    resendOtpLink.addEventListener('click', (e) => {
        e.preventDefault();

        if (resendOtpLink.classList.contains('disabled')) return;

        hideStatus();

        // Simulate resend
        console.log('[OTP Resend] Resending OTP to:', currentPhone);
        showStatus('A new OTP has been sent to your phone.', 'success');
        clearOtpInputs();

        // Start cooldown
        startResendCooldown();
    });

    /** Disable the resend link for RESEND_COOLDOWN seconds. */
    function startResendCooldown() {
        let remaining = RESEND_COOLDOWN;
        const originalText = 'Resend OTP';

        resendOtpLink.classList.add('disabled');
        resendOtpLink.textContent = `Resend in ${remaining}s`;

        const timer = setInterval(() => {
            remaining--;
            if (remaining <= 0) {
                clearInterval(timer);
                resendOtpLink.classList.remove('disabled');
                resendOtpLink.textContent = originalText;
            } else {
                resendOtpLink.textContent = `Resend in ${remaining}s`;
            }
        }, 1000);
    }

    // =============================================
    // Toggle: Wrong Number  ↔  OTP Section
    // =============================================

    wrongNumberLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPhoneUpdateSection();
    });

    cancelUpdateBtn.addEventListener('click', () => {
        hidePhoneUpdateSection();
    });

    /** Show the phone-update UI, hide OTP inputs. */
    function showPhoneUpdateSection() {
        otpSection.classList.add('hidden');
        wrongNumberSection.classList.add('hidden');
        phoneUpdateSection.classList.remove('hidden');
        hideStatus();
        clearPhoneError();
        newPhoneInput.value = '';
        newPhoneInput.focus();
    }

    /** Hide the phone-update UI, restore OTP inputs. */
    function hidePhoneUpdateSection() {
        phoneUpdateSection.classList.add('hidden');
        otpSection.classList.remove('hidden');
        wrongNumberSection.classList.remove('hidden');
        clearPhoneError();
        otpDigits[0].focus();
    }

    // =============================================
    // Phone Number Update
    // =============================================

    const phoneRegex = /^\d{7,15}$/;

    updatePhoneBtn.addEventListener('click', () => {
        hideStatus();
        const raw = newPhoneInput.value.trim();

        // Validation
        if (!raw) {
            setPhoneError('Please enter a phone number');
            newPhoneInput.focus();
            return;
        }

        if (!phoneRegex.test(raw)) {
            setPhoneError('Phone must contain 7–15 digits only');
            newPhoneInput.focus();
            return;
        }

        clearPhoneError();

        // Update the displayed phone number
        currentPhone = raw;
        phoneNumberEl.textContent = formatPhoneDisplay(raw);

        // Persist in sessionStorage for page reloads
        sessionStorage.setItem('userPhone', raw);

        // Simulate backend call
        console.log('[Phone Update] New phone number:', raw);

        // Switch back to OTP section
        hidePhoneUpdateSection();
        clearOtpInputs();
        showStatus('Phone number updated. A new OTP will be sent.', 'success');
    });

    // Clear error on typing
    newPhoneInput.addEventListener('input', () => {
        if (newPhoneInput.value.trim()) clearPhoneError();
    });

    /** Show an error on the new-phone input group. */
    function setPhoneError(msg) {
        newPhoneGroup.classList.add('error');
        const span = newPhoneGroup.querySelector('.error-message');
        if (msg && span) span.textContent = msg;
    }

    /** Clear the new-phone input error. */
    function clearPhoneError() {
        newPhoneGroup.classList.remove('error');
    }

})();
