import 'dotenv/config';
import { pool } from './db.js';
import express from 'express';
import studentRoutes from './routes/studentRoutes.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/students', studentRoutes);

pool.query('SELECT NOW()')
  .then(() => console.log('Database connected successfully'))
  .catch(() => console.error('Database connection failed. Check .env, Supabase, and your network.'));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});