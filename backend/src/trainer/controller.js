import { supabase } from '../index.js';

export async function createTrainer(req, res) {
  const { user_id, gym_id, specialization } = req.body;

  const { data, error } = await supabase
    .from('trainers')
    .insert([{ user_id, gym_id, specialization }])
    .select();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json(data[0]);
}

export async function getTrainer(req, res) {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('trainers')
    .select(`
      *,
      users:user_id (name, email)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Trainer non trovato' });
  }

  res.json(data);
}

export async function getTrainerByUserId(req, res) {
  const user_id = req.user.id;

  const { data, error } = await supabase
    .from('trainers')
    .select(`
      *,
      users:user_id (name, email)
    `)
    .eq('user_id', user_id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Profilo trainer non trovato' });
  }

  res.json(data);
}

export async function getGymTrainers(req, res) {
  const gym_id = req.params.gym_id;

  const { data, error } = await supabase
    .from('trainers')
    .select(`
      *,
      users:user_id (name, email)
    `)
    .eq('gym_id', gym_id);

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
}

export async function getAvailableGymTrainers(req, res) {
  const gym_id = req.params.gym_id;

  try {

    const { data: gymTrainers, error: trainersError } = await supabase
      .from('trainers')
      .select('id, user_id, specialization, users:user_id (name, email)')
      .eq('gym_id', gym_id);

    if (trainersError) throw trainersError;

    const { data: busyTrainers, error: clientsError } = await supabase
      .from('clients')
      .select('trainer_id')
      .eq('gym_id', gym_id)
      .not('trainer_id', 'is', null);

    if (clientsError) throw clientsError;

    const busyTrainerIds = busyTrainers.map(c => c.trainer_id);
    const availableTrainers = gymTrainers.filter(t => !busyTrainerIds.includes(t.id));

    res.json(availableTrainers);
  } catch (err) {
    console.error('Errore di raccolta allenatori disponibili:', err);
    res.status(500).json({ error: 'Errore di database' });
  }
}

export async function getTrainerClients(req, res) {
  const user_id = req.user.id;

  const { data: trainerData, error: trainerError } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', user_id)
    .single();

  if (trainerError || !trainerData) {
    return res.status(404).json({ error: 'Trainer non trovato' });
  }

  const { data, error } = await supabase
    .from('clients')
    .select(`
      id,
      gym_id,
      user_id,
      users:user_id (name, email),
      subscriptions:subscription_id (name)
    `)
    .eq('trainer_id', trainerData.id);

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
}
export async function getAvailableTrainers(req, res) {
  const { data: allTrainers, error: usersError } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('role', 'trainer');

  if (usersError) return res.status(500).json({ error: usersError.message });

  const { data: assignedTrainers, error: trainersError } = await supabase
    .from('trainers')
    .select('user_id')
    .not('gym_id', 'is', null);

  if (trainersError) return res.status(500).json({ error: trainersError.message });

  const assignedUserIds = assignedTrainers.map(t => t.user_id);
  const availableTrainers = allTrainers.filter(u => !assignedUserIds.includes(u.id));

  res.json(availableTrainers);
}

export async function assignTrainerToGym(req, res) {
  const { user_id, gym_id } = req.body;

  if (!user_id || !gym_id) {
    return res.status(400).json({ error: 'user_id e gym_id obbligatori' });
  }

  try {

    const { data: existingTrainer, error: checkError } = await supabase
      .from('trainers')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (existingTrainer) {

      const { data, error } = await supabase
        .from('trainers')
        .update({ gym_id })
        .eq('user_id', user_id)
        .select();

      if (error || !data || data.length === 0) {
        return res.status(500).json({ error: 'Assegnazione trainer fallita' });
      }

      return res.json(data[0]);
    }

    const { data, error } = await supabase
      .from('trainers')
      .insert([{ user_id, gym_id, specialization: '' }])
      .select();

    if (error) throw error;

    res.json(data[0]);
  } catch (err) {
    console.error('Assign trainer to gym error:', err);
    res.status(500).json({ error: 'Errore di database' });
  }
}

export async function updateTrainerSpecialization(req, res) {
  const { id } = req.params;
  const { specialization } = req.body;

  const { data, error } = await supabase
    .from('trainers')
    .update({ specialization })
    .eq('id', id)
    .select();

  if (error || !data || data.length === 0) {
    return res.status(404).json({ error: 'Trainer non trovato' });
  }

  res.json(data[0]);
}

export async function getTrainerGym(req, res) {
  const user_id = req.user.id;

  const { data: trainerData, error: trainerError } = await supabase
    .from('trainers')
    .select('gym_id, specialization')
    .eq('user_id', user_id)
    .single();

  if (trainerError || !trainerData) {
    return res.status(404).json({ error: 'Trainer not found' });
  }

  if (!trainerData.gym_id) {
    return res.status(404).json({ error: 'Palestra non assegnata' });
  }

  const { data: gymData, error: gymError } = await supabase
    .from('gyms')
    .select('*')
    .eq('id', trainerData.gym_id)
    .single();

  if (gymError || !gymData) {
    return res.status(404).json({ error: 'Palestra non trovata' });
  }

  res.json({
    gym: gymData,
    specialization: trainerData.specialization
  });
}

export async function removeTrainerFromGym(req, res) {
  const { user_id } = req.params;
  console.log('removeTrainerFromGym - user_id:', user_id);

  const { data, error } = await supabase
    .from('trainers')
    .delete()
    .eq('user_id', user_id)
    .select();

  if (error) {
    console.error('Error removing trainer from gym:', error);
    return res.status(500).json({ error: error.message });
  }

  if (!data || data.length === 0) {
    console.log('No trainer found with user_id:', user_id);
    return res.status(404).json({ error: 'Trainer non trovato' });
  }

  res.json(data[0]);
}
