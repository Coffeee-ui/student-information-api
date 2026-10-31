import 'dotenv/config';
import { pool } from './db.js';
import express from 'express';
import studentRoutes from './routes/studentRoutes.js';

const app = express();
const port = process.env.PORT || 3000;

// Enable JSON parsing
app.use(express.json());

// Enable CORS for external or separate frontend clients
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

// Serve the CRUD UI from the public directory
app.use(express.static('public'));

// Health check endpoint for Render / cloud monitoring
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Student REST API routes
app.use('/students', studentRoutes);

pool.query('SELECT NOW()')
  .then(() => console.log('Database connected successfully'))
  .catch(() => console.error('Database connection failed. Check .env, Supabase, and your network.'));

// Bind explicitly to 0.0.0.0 for cloud reverse proxy compatibility
app.listen(Number(port), '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
