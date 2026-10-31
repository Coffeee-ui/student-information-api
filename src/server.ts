import 'dotenv/config';
import { pool } from './db.js';
import express from 'express';
import studentRoutes from './routes/studentRoutes.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Root & Health check routes for Render / cloud monitoring
app.get('/', (_req, res) => {
  res.status(200).json({ message: 'Student API is running' });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/students', studentRoutes);

pool.query('SELECT NOW()')
  .then(() => console.log('Database connected successfully'))
  .catch(() => console.error('Database connection failed. Check .env, Supabase, and your network.'));

// Bind explicitly to 0.0.0.0 for Render / cloud reverse proxy compatibility
app.listen(Number(port), '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
