// routes/saveRoutes.js
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
    getSavesByUserId,
    getSaveByUserAndWorld,
    createSave,
    updateSave,
    deleteSave
} from '../models/saveModel.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
    try {
        const saves = await getSavesByUserId(req.user.id);
        res.json(saves);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    const { world_name, screen_data} = req.body;
    if (!world_name || !screen_data) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    try {
        const existing = await getSaveByUserAndWorld(req.user.id, world_name);
        if (existing) {
            await updateSave(req.user.id, world_name, screen_data);
            res.json({ message: 'World updated' });
        } else {
            await createSave(req.user.id, world_name, screen_data);
            res.status(201).json({ message: 'World saved' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

router.get('/:worldName', authenticateToken, async (req, res) => {
    const { worldName } = req.params;
    try {
        const save = await getSaveByUserAndWorld(req.user.id, worldName);
        if (!save) return res.status(404).json({ error: 'World not found' });
        res.json({
            world_name: worldName,
            screen_data: JSON.parse(save.screen_data),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

router.delete('/:worldName', authenticateToken, async (req, res) => {
    const { worldName } = req.params;
    try {
        const affected = await deleteSave(req.user.id, worldName);
        if (affected === 0) return res.status(404).json({ error: 'World not found' });
        res.json({ message: 'World deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;