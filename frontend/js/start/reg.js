/**
 * ============================================
 * Spark Nurses Academy – Registration Page JavaScript
 * ============================================
 *
 * Handles:
 *  1. Password visibility toggles
 *  2. Live error clearing on input
 *  3. Form validation (name, email, phone, username, password, confirm)
 *  4. Registration API request & redirect
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // === DOM References ===
    const form = document.getElementById('regForm');
    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const confirmPwd = document.getElementById('confirmPassword');

    const nameGroup = document.getElementById('nameGroup');
    const emailGroup = document.getElementById('emailGroup');
    const phoneGroup = document.getElementById('phoneGroup');
    const usernameGroup = document.getElementById('usernameGroup');
    const passwordGroup = document.getElementById('passwordGroup');
    const confirmGroup = document.getElementById('confirmGroup');

    // === Reusable: set / clear error ===
    const setError = (group, msg) => {
        group.classList.add('error');
        const span = group.querySelector('.error-message');
        if (msg && span) span.textContent = msg;
    };
    const clearError = (group) => group.classList.remove('error');

    // === Password visibility toggles ===
    document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const isHidden = input.type === 'password';

            input.type = isHidden ? 'text' : 'password';
            btn.querySelector('.eye-open').style.display = isHidden ? 'none' : 'block';
            btn.querySelector('.eye-closed').style.display = isHidden ? 'block' : 'none';
            btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
        });
    });

    // === Live error clearing ===
    const liveClear = [
        [fullName, nameGroup],
        [email, emailGroup],
        [phone, phoneGroup],
        [username, usernameGroup],
        [password, passwordGroup],
        [confirmPwd, confirmGroup]
    ];
    liveClear.forEach(([input, group]) => {
        input.addEventListener('input', () => {
            if (input.value.trim()) clearError(group);
        });
    });

    // === Validation helpers ===
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{7,15}$/;

    // === Form submit ===
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        // Full Name
        if (!fullName.value.trim()) {
            setError(nameGroup, 'Please enter your full name');
            isValid = false;
        } else { clearError(nameGroup); }

        // Email
        if (!email.value.trim()) {
            setError(emailGroup, 'Please enter your email address');
            isValid = false;
        } else if (!emailRegex.test(email.value.trim())) {
            setError(emailGroup, 'Please enter a valid email address');
            isValid = false;
        } else { clearError(emailGroup); }

        // Phone
        if (!phone.value.trim()) {
            setError(phoneGroup, 'Please enter your phone number');
            isValid = false;
        } else if (!phoneRegex.test(phone.value.trim())) {
            setError(phoneGroup, 'Phone must contain 7–15 digits only');
            isValid = false;
        } else { clearError(phoneGroup); }

        // Username
        if (!username.value.trim()) {
            setError(usernameGroup, 'Please enter a username');
            isValid = false;
        } else { clearError(usernameGroup); }

        // Password
        if (!password.value) {
            setError(passwordGroup, 'Please enter a password');
            isValid = false;
        } else if (password.value.length < 6) {
            setError(passwordGroup, 'Password must be at least 6 characters');
            isValid = false;
        } else { clearError(passwordGroup); }

        // Confirm Password
        if (!confirmPwd.value) {
            setError(confirmGroup, 'Please confirm your password');
            isValid = false;
        } else if (confirmPwd.value !== password.value) {
            setError(confirmGroup, 'Passwords do not match');
            isValid = false;
        } else { clearError(confirmGroup); }

        // Focus first error
        if (!isValid) {
            const first = form.querySelector('.form-group.error input');
            if (first) first.focus();
            return;
        }

        // === Send data to backend ===
        const serverError = document.getElementById('serverError');
        serverError.classList.remove('visible');
        serverError.textContent = '';

        const btn = document.getElementById('regBtn');
        const original = btn.textContent;
        btn.textContent = 'Creating account…';
        btn.disabled = true;
        btn.style.opacity = '0.8';

        fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: fullName.value.trim(),
                email: email.value.trim(),
                phone: phone.value.trim(),
                username: username.value.trim(),
                password: password.value,
                confirmPassword: confirmPwd.value
            })
        })
            .then(res => res.json().then(data => ({ status: res.status, data })))
            .then(({ status, data }) => {
                btn.textContent = original;
                btn.disabled = false;
                btn.style.opacity = '1';

                if (status === 201) {
                    // Registration successful — redirect to login
                    alert('Registration successful! Please login.');
                    window.location.href = 'login.html';
                } else {
                    // Show server-side error (e.g. "Username already exists")
                    serverError.textContent = data.message || 'Registration failed';
                    serverError.classList.add('visible');
                }
            })
            .catch(err => {
                btn.textContent = original;
                btn.disabled = false;
                btn.style.opacity = '1';
                serverError.textContent = 'Unable to connect to server. Please try again.';
                serverError.classList.add('visible');
                console.error('Fetch error:', err);
            });
    });
});
