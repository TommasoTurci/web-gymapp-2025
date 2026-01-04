import { supabase } from '../index.js';

export async function createClient(req, res) {
  const { user_id, gym_id, subscription_id } = req.body;

  const { data, error } = await supabase
    .from('clients')
    .insert([{ user_id, gym_id, subscription_id, subscription_start_date: new Date() }])
    .select();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json(data[0]);
}

export async function getClient(req, res) {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      users:user_id (name, email),
      subscriptions:subscription_id (name, price),
      trainers:trainer_id (id)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Cliente non trovato' });
  }

  res.json(data);
}

export async function getClientByUserId(req, res) {
  const user_id = req.user.id;

  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      users:user_id (name, email),
      subscriptions:subscription_id (name, price, duration_months, gyms:gym_id (id, name, address, phone))
    `)
    .eq('user_id', user_id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Profilo cliente non trovato' });
  }

  res.json(data);
}

export async function getCurrentGym(req, res) {
  const user_id = req.user.id;

  const { data, error } = await supabase
    .from('clients')
    .select('gym_id, gyms:gym_id (id, name, address, phone)')
    .eq('user_id', user_id)
    .limit(1)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Nessun abbonamento palestra trovato' });
  }

  res.json(data);
}

export async function updateClientSubscription(req, res) {
  const { client_id, subscription_id } = req.body;

  const { data, error } = await supabase
    .from('clients')
    .update({ subscription_id, subscription_start_date: new Date() })
    .eq('id', client_id)
    .select();

  if (error || !data || data.length === 0) {
    return res.status(404).json({ error: 'Cliente non trovato' });
  }

  res.json(data[0]);
}

export async function assignTrainer(req, res) {
  const { client_id, trainer_id } = req.body;

  const { data, error } = await supabase
    .from('clients')
    .update({ trainer_id })
    .eq('id', client_id)
    .select();

  if (error || !data || data.length === 0) {
    return res.status(404).json({ error: 'Cliente non trovato' });
  }

  res.json(data[0]);
}

export async function revokeTrainer(req, res) {
  const { client_id } = req.body;

  const { data, error } = await supabase
    .from('clients')
    .update({ trainer_id: null })
    .eq('id', client_id)
    .select();

  if (error || !data || data.length === 0) {
    return res.status(404).json({ error: 'Cliente non trovato' });
  }

  res.json(data[0]);
}

export async function getGymClients(req, res) {
  const gym_id = req.params.gym_id;

  const { data, error } = await supabase
    .from('clients')
    .select(`
      id,
      gym_id,
      trainer_id,
      subscription_id,
      users:user_id (name, email),
      subscriptions:subscription_id (name),
      trainers:trainer_id (id, specialization, users:user_id (name, email))
    `)
    .eq('gym_id', gym_id);

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
}
export async function subscribeToGym(req, res) {
  const { gym_id, subscription_id } = req.body;
  const user_id = req.user.id;

  if (!gym_id || !subscription_id) {
    return res.status(400).json({ error: 'gym_id e subscription_id obbligatori' });
  }

  const { data: existingClient } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', user_id)
    .eq('gym_id', gym_id)
    .single();

  if (existingClient) {
    return res.status(400).json({ error: 'Già abbonato a questa palestra' });
  }

  const { data, error } = await supabase
    .from('clients')
    .insert([{
      user_id,
      gym_id,
      subscription_id,
      subscription_start_date: new Date()
    }])
    .select();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json(data[0]);
}

export async function deleteClient(req, res) {
  const { id } = req.params;

  try {
    // Prima cancella tutti i workout_plans associati a questo cliente
    const { error: workoutError } = await supabase
      .from('workout_plans')
      .delete()
      .eq('client_id', id);

    if (workoutError) {
      console.error('Error deleting workout plans:', workoutError);
      return res.status(500).json({ error: workoutError.message });
    }

    // Cancella tutti gli orders associati a questo cliente
    const { error: ordersError } = await supabase
      .from('orders')
      .delete()
      .eq('client_id', id);

    if (ordersError) {
      console.error('Error deleting orders:', ordersError);
      return res.status(500).json({ error: ordersError.message });
    }

    // Poi cancella il cliente
    const { data, error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error deleting client:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Cliente non trovato' });
    }

    res.json(data[0]);
  } catch (err) {
    console.error('Error in deleteClient:', err);
    res.status(500).json({ error: 'Errore durante l\'eliminazione del cliente' });
  }
}
