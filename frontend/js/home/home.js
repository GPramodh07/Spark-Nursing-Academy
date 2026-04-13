/**
 * ============================================
 * Spark Nurses Academy – Homepage JavaScript
 * ============================================
 *
 * Handles:
 *  1. Mobile hamburger toggle (open / close nav)
 *  2. Mobile accordion-style dropdown menus
 *  3. Close nav when clicking outside on mobile
 *  4. Keyboard accessibility for dropdowns
 *  5. Dark/Light theme toggle with localStorage
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // === DOM References ===
    const mobileToggle = document.getElementById('mobileToggle');
    const mainNav = document.getElementById('mainNav');
    const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown');
    const themeToggle = document.getElementById('themeToggle');

    // =============================================
    // Dark / Light Theme Toggle
    // =============================================
    const THEME_KEY = 'spark-theme';

    /** Apply theme based on stored preference or system default. */
    function applyStoredTheme() {
        const stored = localStorage.getItem(THEME_KEY);
        if (stored === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    applyStoredTheme();

    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    });

    // === Mobile Menu Toggle ===
    mobileToggle.addEventListener('click', () => {
        const isOpen = mainNav.classList.toggle('open');
        mobileToggle.classList.toggle('active', isOpen);
        mobileToggle.setAttribute('aria-expanded', isOpen);

        // Prevent body scroll when menu is open
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // === Dropdown Toggle (mobile: click, desktop: handled via CSS hover) ===
    dropdownItems.forEach(item => {
        const link = item.querySelector('.nav-link');

        link.addEventListener('click', (e) => {
            // Only toggle on mobile / touch devices
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const wasOpen = item.classList.contains('open');

                // Close all other dropdowns first
                dropdownItems.forEach(other => {
                    if (other !== item) {
                        other.classList.remove('open');
                        other.querySelector('.nav-link').setAttribute('aria-expanded', 'false');
                    }
                });

                // Toggle current
                item.classList.toggle('open', !wasOpen);
                link.setAttribute('aria-expanded', !wasOpen);
            }
        });
    });

    // === Close mobile nav when clicking outside ===
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            const isInsideNav = mainNav.contains(e.target);
            const isToggle = mobileToggle.contains(e.target);

            if (!isInsideNav && !isToggle && mainNav.classList.contains('open')) {
                mainNav.classList.remove('open');
                mobileToggle.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        }
    });

    // === Keyboard: close dropdowns on Escape ===
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close mobile nav
            if (mainNav.classList.contains('open')) {
                mainNav.classList.remove('open');
                mobileToggle.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
                mobileToggle.focus();
            }

            // Close any open desktop dropdown
            dropdownItems.forEach(item => {
                item.classList.remove('open');
                item.querySelector('.nav-link').setAttribute('aria-expanded', 'false');
            });
        }
    });

    // === Reset nav state on resize crossing breakpoint ===
    let lastWidth = window.innerWidth;
    window.addEventListener('resize', () => {
        const currentWidth = window.innerWidth;

        // Crossed the mobile/desktop breakpoint
        if ((lastWidth <= 768 && currentWidth > 768) || (lastWidth > 768 && currentWidth <= 768)) {
            mainNav.classList.remove('open');
            mobileToggle.classList.remove('active');
            mobileToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';

            dropdownItems.forEach(item => {
                item.classList.remove('open');
                item.querySelector('.nav-link').setAttribute('aria-expanded', 'false');
            });
        }

        lastWidth = currentWidth;
    });

    // =============================================
    // Platform Stats — Animated Count-Up
    // Runs once per counter when it scrolls into view.
    // Respects prefers-reduced-motion to skip animation.
    // =============================================
    const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches;

    /**
     * Easing function: ease-out cubic
     * @param {number} t  progress 0–1
     * @returns {number}
     */
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    /**
     * Animate a single counter element from 0 to its data-target value.
     * @param {HTMLElement} el  — .stat-number element
     */
    function animateCounter(el) {
        const target = parseInt(el.dataset.target, 10);
        if (isNaN(target)) return;

        // Suffix node (the <span class="stat-plus">) is preserved
        const suffixEl = el.querySelector('.stat-plus');
        const suffix = suffixEl ? suffixEl.outerHTML : '';

        // If reduced motion requested, just display the final number immediately
        if (prefersReducedMotion) {
            el.innerHTML = formatNumber(target) + suffix;
            el.classList.add('counted');
            return;
        }

        const duration = 1800; // ms
        let startTime = null;

        el.classList.add('counting');

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutCubic(progress);
            const current = Math.round(easedProgress * target);

            el.innerHTML = formatNumber(current) + suffix;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.innerHTML = formatNumber(target) + suffix;
                el.classList.remove('counting');
                el.classList.add('counted');
            }
        }

        requestAnimationFrame(step);
    }

    /**
     * Format a number with commas: 10000 → "10,000"
     * @param {number} n
     * @returns {string}
     */
    function formatNumber(n) {
        return n.toLocaleString('en-IN');
    }

    // Use IntersectionObserver to trigger counters only when visible
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');

    if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    obs.unobserve(entry.target); // fire only once
                }
            });
        }, {
            threshold: 0.25  // trigger when 25% of the element is visible
        });

        statNumbers.forEach(el => observer.observe(el));
    } else {
        // Fallback for browsers without IntersectionObserver
        statNumbers.forEach(el => animateCounter(el));
    }
});
