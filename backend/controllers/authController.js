// ============================================
// Auth Controller — Registration & Login logic
// ============================================

const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

const SALT_ROUNDS = 10;

/**
 * POST /api/auth/register
 * Validates input, checks for duplicates, hashes password, and inserts user.
 */
const register = async (req, res) => {
    try {
        const { name, email, phone, username, password, confirmPassword } = req.body;

        // --- Input validation ---
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Name is required' });
        }
        if (!email || !email.trim()) {
            return res.status(400).json({ message: 'Email is required' });
        }
        if (!phone || !phone.trim()) {
            return res.status(400).json({ message: 'Phone number is required' });
        }
        if (!username || !username.trim()) {
            return res.status(400).json({ message: 'Username is required' });
        }
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // --- Email format check ---
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // --- Phone format check (digits only, 7–15 chars) ---
        const phoneRegex = /^\d{7,15}$/;
        if (!phoneRegex.test(phone.trim())) {
            return res.status(400).json({ message: 'Phone must contain 7–15 digits only' });
        }

        // --- Check for existing username ---
        const existingUser = await userModel.findByUsername(username.trim());
        if (existingUser) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        // --- Check for existing email ---
        const existingEmail = await userModel.findByEmail(email.trim());
        if (existingEmail) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        // --- Check for existing phone ---
        const existingPhone = await userModel.findByPhone(phone.trim());
        if (existingPhone) {
            return res.status(409).json({ message: 'Phone number already exists' });
        }

        // --- Hash password ---
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // --- Insert user ---
        const result = await userModel.createUser({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            username: username.trim(),
            password: hashedPassword
        });

        return res.status(201).json({
            message: 'Registration successful',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * POST /api/auth/login
 * Validates input, checks credentials with bcrypt, returns user role.
 */
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // --- Input validation ---
        if (!username || !username.trim()) {
            return res.status(400).json({ message: 'Username is required' });
        }
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        const trimmedUsername = username.trim();

        // --- Special Default Admin Check ---
        if (trimmedUsername === 'kittu07' && password === '1002') {
            return res.status(200).json({
                message: 'Login successful (Default Admin)',
                role: 'admin',
                name: 'Default Admin'
            });
        }

        // --- Find user by username ---
        const user = await userModel.findUserForLogin(trimmedUsername);
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // --- Compare password with hashed password ---
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // --- Authentication successful ---
        return res.status(200).json({
            message: 'Login successful',
            role: user.role,
            name: user.name
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { register, login };
