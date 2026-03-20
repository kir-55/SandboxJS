import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import saveRoutes from './routes/saveRoutes.js';

const app = express();
dotenv.config();

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
app.set('view engine', 'ejs');

const port = process.env.PORT;
const host = process.env.HOST;
const name = 'SandboxJS';

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/saves', saveRoutes);

// Frontend routes
app.get('/', (req, res) => {
    res.render('index', { name });
});

app.get('/simulation/', (req, res) => {
    res.render('simulation', { name });
});

app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
});