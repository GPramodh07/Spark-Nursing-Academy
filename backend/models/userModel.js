// ============================================
// User Model — Database queries for the users table
// ============================================

const conn = require('../../config/db');

/**
 * Check if a username already exists in the database.
 * @param {string} username
 * @returns {Promise<Object|null>} - The user row if found, or null
 */
const findByUsername = (username) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, username FROM users WHERE username = ?';
        conn.query(sql, [username], (err, results) => {
            if (err) return reject(err);
            resolve(results.length > 0 ? results[0] : null);
        });
    });
};

/**
 * Check if an email already exists in the database.
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
const findByEmail = (email) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, email FROM users WHERE email = ?';
        conn.query(sql, [email], (err, results) => {
            if (err) return reject(err);
            resolve(results.length > 0 ? results[0] : null);
        });
    });
};

/**
 * Check if a phone number already exists in the database.
 * @param {string} phone
 * @returns {Promise<Object|null>}
 */
const findByPhone = (phone) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, phone FROM users WHERE phone = ?';
        conn.query(sql, [phone], (err, results) => {
            if (err) return reject(err);
            resolve(results.length > 0 ? results[0] : null);
        });
    });
};

/**
 * Insert a new user into the users table.
 * @param {Object} userData - { name, email, phone, username, password }
 * @returns {Promise<Object>} - The insert result
 */
const createUser = (userData) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO users (name, email, phone, username, password) VALUES (?, ?, ?, ?, ?)';
        const values = [
            userData.name,
            userData.email,
            userData.phone,
            userData.username,
            userData.password   // already hashed by the controller
        ];
        conn.query(sql, values, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

/**
 * Find a user by username for login (returns full auth-relevant fields).
 * @param {string} username
 * @returns {Promise<Object|null>} - { id, name, username, password, role } or null
 */
const findUserForLogin = (username) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, name, username, password, role FROM users WHERE username = ?';
        conn.query(sql, [username], (err, results) => {
            if (err) return reject(err);
            resolve(results.length > 0 ? results[0] : null);
        });
    });
};

module.exports = {
    findByUsername,
    findByEmail,
    findByPhone,
    createUser,
    findUserForLogin
};
