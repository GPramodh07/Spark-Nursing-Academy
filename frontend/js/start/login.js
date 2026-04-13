/**
 * ============================================
 * Spark Nurses Academy – Login Page JavaScript
 * ============================================
 *
 * Handles:
 *  1. Password visibility toggle
 *  2. Live error clearing on input
 *  3. Form validation
 *  4. Login API request & role-based redirect
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // === DOM References ===
    const form = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const usernameGroup = document.getElementById('usernameGroup');
    const passwordGroup = document.getElementById('passwordGroup');
    const toggleBtn = document.getElementById('passwordToggle');
    const eyeOpen = document.getElementById('eyeOpen');
    const eyeClosed = document.getElementById('eyeClosed');

    // === Password Visibility Toggle ===
    toggleBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';

        // Swap eye icons
        eyeOpen.style.display = isPassword ? 'none' : 'block';
        eyeClosed.style.display = isPassword ? 'block' : 'none';

        // Update aria-label
        toggleBtn.setAttribute(
            'aria-label',
            isPassword ? 'Hide password' : 'Show password'
        );
    });

    // === Clear error on input ===
    usernameInput.addEventListener('input', () => {
        if (usernameInput.value.trim()) {
            usernameGroup.classList.remove('error');
        }
    });

    passwordInput.addEventListener('input', () => {
        if (passwordInput.value.trim()) {
            passwordGroup.classList.remove('error');
        }
    });

    // === Form Validation & Submission ===
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        // Validate username
        if (!usernameInput.value.trim()) {
            usernameGroup.classList.add('error');
            isValid = false;
        } else {
            usernameGroup.classList.remove('error');
        }

        // Validate password
        if (!passwordInput.value.trim()) {
            passwordGroup.classList.add('error');
            isValid = false;
        } else {
            passwordGroup.classList.remove('error');
        }

        if (!isValid) {
            // Focus the first invalid field
            const firstError = form.querySelector('.form-group.error input');
            if (firstError) firstError.focus();
            return;
        }

        // === Send credentials to backend ===
        const serverError = document.getElementById('serverError');
        serverError.classList.remove('visible');
        serverError.textContent = '';

        const btn = document.getElementById('loginBtn');
        const original = btn.textContent;
        btn.textContent = 'Signing in…';
        btn.disabled = true;
        btn.style.opacity = '0.8';

        fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: usernameInput.value.trim(),
                password: passwordInput.value
            })
        })
            .then(res => res.json().then(data => ({ status: res.status, data })))
            .then(({ status, data }) => {
                btn.textContent = original;
                btn.disabled = false;
                btn.style.opacity = '1';

                if (status === 200) {
                    // Login successful — redirect based on role
                    if (data.role === 'admin') {
                        window.location.href = '../admin/admin_dashboard.html';
                    } else {
                        window.location.href = '../user/user_dashboard.html';
                    }
                } else {
                    // Show server error (e.g. "Invalid username or password")
                    serverError.textContent = data.message || 'Login failed';
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
