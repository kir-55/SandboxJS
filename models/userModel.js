import argon2 from 'argon2';
import pool from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();
const PEPPER = process.env.PEPPER;

export async function createUser(username, password, role = 'user') {
    const pepperedPassword = password + (PEPPER || '');
    const hash = await argon2.hash(pepperedPassword, { type: argon2.argon2id });
    const [result] = await pool.execute(
        'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
        [username, hash, role]
    );
    return result.insertId;
}

export async function findUserByUsername(username) {
    const [rows] = await pool.execute(
        'SELECT id, username, password_hash, role FROM users WHERE username = ?',
        [username]
    );
    return rows[0] || null;
}

export async function verifyPassword(user, plainPassword) {
    const pepperedPassword = plainPassword + (PEPPER || '');
    try {
        return await argon2.verify(user.password_hash, pepperedPassword);
    } catch (err) {
        console.error('Password verification error:', err.message);
        return false;
    }
}