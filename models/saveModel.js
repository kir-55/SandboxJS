import pool from '../config/db.js';

export async function getSavesByUserId(userId) {
    const [rows] = await pool.execute(
        'SELECT id, world_name, width, height, created_at, updated_at, screen_data FROM saves WHERE user_id = ?',
        [userId]
    );
    console.log('userId: ' + userId);
    const parsedRows = rows.map(row => {
        // Log the type and a snippet of the data
        console.log('Raw screen_data type:', typeof row.screen_data);
        console.log('Raw screen_data (first 100 chars):', 
            typeof row.screen_data === 'string' ? row.screen_data.slice(0, 100) : 'Not a string');

        let parsedData = row.screen_data;
        if (typeof row.screen_data === 'string') {
            try {
                parsedData = JSON.parse(row.screen_data);
                console.log('Successfully parsed JSON. Type:', typeof parsedData);
            } catch (err) {
                console.error('JSON parse error:', err.message);
                // fallback to empty array to avoid crashes
                parsedData = [];
            }
        } else {
            console.log('screen_data is already an object, no parsing needed.');
        }

        return {
            ...row,
            screen_data: parsedData
        };
    });

    console.log('Returning parsed rows (count):', parsedRows.length);
    return parsedRows;
}

// Add these exports to the existing file
export async function getAllSavesWithUser() {
    const [rows] = await pool.execute(
        `SELECT s.id, s.world_name, s.width, s.height, s.created_at, s.updated_at, u.username as author
         FROM saves s
         JOIN users u ON s.user_id = u.id
         ORDER BY s.updated_at DESC`
    );
    return rows;
}

export async function getSaveById(saveId) {
    const [rows] = await pool.execute(
        'SELECT screen_data, width, height, world_name, user_id FROM saves WHERE id = ?',
        [saveId]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
        ...row,
        screen_data: typeof row.screen_data === 'string' ? JSON.parse(row.screen_data) : row.screen_data
    };
}

export async function getSaveByUserAndWorld(userId, worldName) {
    const [rows] = await pool.execute(
        'SELECT screen_data, width, height FROM saves WHERE user_id = ? AND world_name = ?',
        [userId, worldName]
    );
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
        ...row,
        screen_data: typeof row.screen_data === 'string' ? JSON.parse(row.screen_data) : row.screen_data
    };
}

export async function createSave(userId, worldName, screenData, width = 100, height = 100) {
    await pool.execute(
        `INSERT INTO saves (user_id, world_name, screen_data, width, height)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, worldName, JSON.stringify(screenData), width, height]
    );
}

export async function updateSave(userId, worldName, screenData, width = 100, height = 100) {
    await pool.execute(
        `UPDATE saves
         SET screen_data = ?, width = ?, height = ?, updated_at = NOW()
         WHERE user_id = ? AND world_name = ?`,
        [JSON.stringify(screenData), width, height, userId, worldName]
    );
}

export async function deleteSave(userId, worldName) {
    const [result] = await pool.execute(
        'DELETE FROM saves WHERE user_id = ? AND world_name = ?',
        [userId, worldName]
    );
    return result.affectedRows;
}