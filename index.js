import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';   
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import saveRoutes from './routes/saveRoutes.js';
import { getSavesByUserId, getSaveByUserAndWorld, getAllSavesWithUser, getSaveById } from './models/saveModel.js';


const app = express();
dotenv.config();

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());


app.use((req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            console.log('Token validated:');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;               // attach to req for routes
            res.locals.user = decoded;        // attach for views (EJS)
        } catch (err) {
            // token invalid – ignore, user remains undefined
            console.log('Invalid token:', err.message);
        }
    }else{
        console.log('no token');
    }
    next();
});

app.use(express.static('public'));
app.set('view engine', 'ejs');

const port = process.env.PORT;
const host = process.env.HOST;

const name = 'SandboxJS';
const simulation_background_color = "#7a7a7a";

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/saves', saveRoutes);

// Frontend routes
app.get('/', async (req, res) => {
    let saves = [];
    if (req.user) {
        try {
            
            saves = await getSavesByUserId(req.user.id);
        } catch (err) {
            console.error('Error fetching saves:', err);
        }
    }
    res.render('index', { name, simulation_background_color, user: req.user, saves });
});


app.get('/login/', (req, res) => {
    res.render('login', { name});
});

app.get('/register/', (req, res) => {
    res.render('register', { name });
});

app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});


app.get('/discover', async (req, res) => {
    let worlds = [];
    try {
        worlds = await getAllSavesWithUser();
    } catch (err) {
        console.error('Error fetching worlds:', err);
    }
    res.render('discover', { name, simulation_background_color, user: req.user, worlds });
});

app.get('/simulation/', async (req, res) => {
    let saveData = null;
    const cloneId = req.query.clone;
    const loadWorld = req.query.load;

    if (req.user && loadWorld) {
        try {
            const worldName = loadWorld;
            const save = await getSaveByUserAndWorld(req.user.id, worldName);
            if (save) {
                saveData = {
                    world_name: worldName,
                    screen_data: save.screen_data,
                    width: save.width,
                    height: save.height,
                    isClone: false
                };
            }
        } catch (err) {
            console.error('Error loading save:', err);
        }
    } else if (cloneId) {
        try {
            const save = await getSaveById(cloneId);
            if (save) {
                saveData = {
                    world_name: `Clone of ${save.world_name}`,
                    screen_data: save.screen_data,
                    width: save.width,
                    height: save.height,
                    isClone: true
                };
            }
        } catch (err) {
            console.error('Error cloning world:', err);
        }
    }

    res.render('simulation', { name, simulation_background_color, saveData });
});

app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
});