import pool from '../config/db.js';

export async function getSavesByUserId(userId) {
    const [rows] = await pool.execute(
        'SELECT world_name, created_at, updated_at FROM saves WHERE user_id = ?',
        [userId]
    );
    return rows;
}

export async function getSaveByUserAndWorld(userId, worldName) {
    const [rows] = await pool.execute(
        'SELECT screen_data FROM saves WHERE user_id = ? AND world_name = ?',
        [userId, worldName]
    );
    return rows[0] || null;
}

export async function createSave(userId, worldName, screenData) {
    await pool.execute(
        `INSERT INTO saves (user_id, world_name, screen_data)
         VALUES (?, ?, ?)`,
        [userId, worldName, JSON.stringify(screenData)]
    );
}

export async function updateSave(userId, worldName, screenData) {
    await pool.execute(
        `UPDATE saves
         SET screen_data = ?, updated_at = NOW()
         WHERE user_id = ? AND world_name = ?`,
        [JSON.stringify(screenData), userId, worldName]
    );
}

export async function deleteSave(userId, worldName) {
    const [result] = await pool.execute(
        'DELETE FROM saves WHERE user_id = ? AND world_name = ?',
        [userId, worldName]
    );
    return result.affectedRows;
}