import { supabase } from '../index.js';

export async function createSubscription(req, res) {
  const { name, price, duration_months, gym_id } = req.body;

  if (!name || !price || !gym_id) {
    return res.status(400).json({ error: 'Campi obbligatori mancanti' });
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .insert([{ name, price, duration_months, gym_id }])
    .select();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json(data[0]);
}

export async function getSubscription(req, res) {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Abbonamento non trovato' });
  }

  res.json(data);
}

export async function getGymSubscriptions(req, res) {
  const gym_id = req.params.gym_id;

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('gym_id', gym_id);

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
}

export async function updateSubscription(req, res) {
  const { id } = req.params;
  const { name, price, duration_months } = req.body;

  const { data, error } = await supabase
    .from('subscriptions')
    .update({ name, price, duration_months })
    .eq('id', id)
    .select();

  if (error || !data || data.length === 0) {
    return res.status(404).json({ error: 'Abbonamento non trovato' });
  }

  res.json(data[0]);
}

export async function deleteSubscription(req, res) {
  const { id } = req.params;

  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: 'Abbonamento eliminato' });
}
