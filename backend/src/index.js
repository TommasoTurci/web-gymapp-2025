import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';
import gymRoutes from './gym/routes.js';
import clientRoutes from './client/routes.js';
import trainerRoutes from './trainer/routes.js';
import subscriptionRoutes from './subscription/routes.js';
import exerciseRoutes from './exercise/routes.js';
import shopRoutes from './shop/routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token non fornito' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token non valido' });
    }
    req.user = decoded;
    console.log('Token analizzato, user:', { id: req.user.id, role: req.user.role });
    next();
  });
}

function checkRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permessi insufficienti' });
    }
    next();
  };
}

async function register(req, res) {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'Campi obbligatori mancanti' });
  }

  if (!['owner', 'trainer', 'client'].includes(role)) {
    return res.status(400).json({ error: 'Ruolo invalido' });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password: hashedPassword, name, role }])
      .select();

    if (error) {
      console.error('Errore di INSERT:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      if (error.message.includes('duplicate')) {
        return res.status(400).json({ error: 'Email già utilizzata' });
      }
      throw error;
    }

    const user = data[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      token
    });
  } catch (err) {
    console.error('Errore di registrazione:', err.message || err);
    res.status(500).json({ error: err.message || 'Errore di database' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password richiesti' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const passwordMatch = bcrypt.compareSync(password, data.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const token = jwt.sign(
      { id: data.id, email: data.email, role: data.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      token
    });
  } catch (err) {
    console.error('Errore di login:', err);
    res.status(500).json({ error: 'Errore di database' });
  }
}

async function getProfile(req, res) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('id', req.user.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    res.json(data);
  } catch (err) {
    console.error('Errore nel ottenere il profilo:', err);
    res.status(500).json({ error: 'Errore di database' });
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/profile', verifyToken, getProfile);

app.use('/api/gyms', gymRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/shop', shopRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Errore del server' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export { verifyToken, checkRole, supabase };
