import { supabase } from '../index.js';

export async function createExercise(req, res) {
  const { name, description, sets, reps } = req.body;
  const user_id = req.user.id;

  if (!name) {
    return res.status(400).json({ error: 'Nome esercizio obbligatorio' });
  }

  const { data: trainerData, error: trainerError } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', user_id)
    .single();

  if (trainerError || !trainerData) {
    return res.status(400).json({ error: 'Trainer non trovato' });
  }

  const { data, error } = await supabase
    .from('exercises')
    .insert([{ name, description, sets, reps, trainer_id: trainerData.id }])
    .select();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json(data[0]);
}

export async function getExercise(req, res) {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Esercizio non trovato' });
  }

  res.json(data);
}

export async function getAllExercises(req, res) {
  const { data, error } = await supabase
    .from('exercises')
    .select('*');

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
}

export async function updateExercise(req, res) {
  const { id } = req.params;
  const { name, description, sets, reps } = req.body;

  const { data, error } = await supabase
    .from('exercises')
    .update({ name, description, sets, reps })
    .eq('id', id)
    .select();

  if (error || !data || data.length === 0) {
    return res.status(404).json({ error: 'Esercizio non trovato' });
  }

  res.json(data[0]);
}

export async function deleteExercise(req, res) {
  const { id } = req.params;

  // First, delete all workout_plans that reference this exercise
  const { error: workoutError } = await supabase
    .from('workout_plans')
    .delete()
    .eq('exercise_id', id);

  if (workoutError) return res.status(500).json({ error: workoutError.message });

  // Then delete the exercise itself
  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: 'Esercizio eliminato' });
}

export async function assignExerciseToClient(req, res) {
  const { client_id, exercise_id } = req.body;
  const trainer_id = req.user.id;

  const { data: trainerData, error: trainerError } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', trainer_id)
    .single();

  if (trainerError || !trainerData) {
    return res.status(400).json({ error: 'Trainer non trovato' });
  }

  const { data, error } = await supabase
    .from('workout_plans')
    .insert([{ client_id, trainer_id: trainerData.id, exercise_id }])
    .select();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json(data[0]);
}

export async function getClientExercises(req, res) {
  const { client_id } = req.params;

  const { data, error } = await supabase
    .from('workout_plans')
    .select(`
      id,
      exercises:exercise_id (*)
    `)
    .eq('client_id', client_id);

  if (error) return res.status(500).json({ error: error.message });

  res.json(data || []);
}

export async function deleteClientExercise(req, res) {
  const { plan_id } = req.params;

  const { error } = await supabase
    .from('workout_plans')
    .delete()
    .eq('id', plan_id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: 'Esercizio rimosso dal piano' });
}

export async function getTrainerExercises(req, res) {
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
    .from('exercises')
    .select('*')
    .eq('trainer_id', trainerData.id)
    .order('name', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  res.json(data || []);
}

