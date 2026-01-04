import { supabase } from '../index.js';

export async function createGym(req, res) {
  const { name, address, phone } = req.body;
  const owner_id = req.user.id;

  if (!name) {
    return res.status(400).json({ error: 'Nome palestra obbligatorio' });
  }

  const { data, error } = await supabase
    .from('gyms')
    .insert([{ name, owner_id, address, phone }])
    .select();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json(data[0]);
}

export async function getAllGyms(req, res) {
  const { data, error } = await supabase
    .from('gyms')
    .select('*')
    .order('name', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  res.json(data || []);
}

export async function getGym(req, res) {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('gyms')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Palestra non trovata' });
  }

  res.json(data);
}

export async function getOwnerGym(req, res) {
  const owner_id = req.user.id;

  const { data, error } = await supabase
    .from('gyms')
    .select('*')
    .eq('owner_id', owner_id);

  if (error) return res.status(500).json({ error: error.message });

  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'Nessuna palestra trovata per questo proprietario' });
  }

  res.json(data.length === 1 ? data[0] : data);
}

export async function updateGym(req, res) {
  const { id } = req.params;
  const { name, address, phone } = req.body;

  const { data, error } = await supabase
    .from('gyms')
    .update({ name, address, phone })
    .eq('id', id)
    .select();

  if (error || !data || data.length === 0) {
    return res.status(404).json({ error: 'Palestra non trovata' });
  }

  res.json(data[0]);
}
