import { supabase } from '../index.js';

export async function createProduct(req, res) {
  const { name, description, price, category, gym_id } = req.body;
  const owner_id = req.user.id;

  if (!name || !price || !category || !gym_id) {
    return res.status(400).json({ error: 'Campi obbligatori mancanti' });
  }

  try {
    const { data: gymData, error: gymError } = await supabase
      .from('gyms')
      .select('id')
      .eq('id', gym_id)
      .eq('owner_id', owner_id)
      .single();

    if (gymError) {
      console.error('Gym check error:', gymError);
      return res.status(403).json({ error: 'Non autorizzato: non possiedi questa palestra' });
    }

    if (!gymData) {
      console.warn(`Gym ${gym_id} not found for owner ${owner_id}`);
      return res.status(403).json({ error: 'Palestra non trovata o non di tua proprietà' });
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{ name, description, price, category, gym_id }])
      .select();

    if (error) {
      console.error('Errore nella creazione del prodotto:', error);
      return res.status(400).json({ error: error.message || 'Errore nella creazione del prodotto' });
    }

    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Errore nella creazione del prodotto:', err);
    res.status(500).json({ error: 'Errore di database: ' + err.message });
  }
}

export async function getProduct(req, res) {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Prodotto non trovato' });
  }

  res.json(data);
}

export async function getGymProducts(req, res) {
  const gym_id = req.params.gym_id;
  const { category } = req.query;

  let query = supabase
    .from('products')
    .select('*')
    .eq('gym_id', gym_id);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
}

export async function updateProduct(req, res) {
  const { id } = req.params;
  const { name, description, price } = req.body;

  const { data, error } = await supabase
    .from('products')
    .update({ name, description, price })
    .eq('id', id)
    .select();

  if (error || !data || data.length === 0) {
    return res.status(404).json({ error: 'Prodotto non trovato' });
  }

  res.json(data[0]);
}

export async function deleteProduct(req, res) {
  const { id } = req.params;
  const owner_id = req.user.id;

  try {

    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('gym_id')
      .eq('id', id)
      .single();

    if (productError || !productData) {
      return res.status(404).json({ error: 'Prodotto non trovato' });
    }

    const { data: gymData, error: gymError } = await supabase
      .from('gyms')
      .select('id')
      .eq('id', productData.gym_id)
      .eq('owner_id', owner_id)
      .single();

    if (gymError || !gymData) {
      return res.status(403).json({ error: 'Non autorizzato: non possiedi questo prodotto' });
    }

    const { error: deleteOrdersError } = await supabase
      .from('orders')
      .delete()
      .eq('product_id', id);

    if (deleteOrdersError) throw deleteOrdersError;

    const { error: deleteProductError } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (deleteProductError) throw deleteProductError;

    res.json({ message: 'Prodotto eliminato' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Errore di database' });
  }
}

export async function createOrder(req, res) {
  const { product_id, quantity, gym_id } = req.body;
  const user_id = req.user.id;

  if (!product_id || !quantity || !gym_id) {
    return res.status(400).json({ error: 'Campi obbligatori mancanti' });
  }

  try {

    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .eq('gym_id', gym_id)
      .single();

    if (productError || !productData) {
      return res.status(400).json({ error: 'Prodotto non trovato in questa palestra' });
    }

    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user_id)
      .eq('gym_id', gym_id)
      .single();

    if (clientError || !clientData) {
      return res.status(403).json({ error: 'Non sei registrato a questa palestra' });
    }

    const client_id = clientData.id;
    const total_price = productData.price * quantity;

    const { data, error } = await supabase
      .from('orders')
      .insert([{ client_id, gym_id, product_id, quantity, total_price, status: 'unconfirmed' }])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Errore di database: ' + err.message });
  }
}

export async function getClientOrders(req, res) {
  const user_id = req.user.id;

  try {
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (clientError || !clientData) {
      return res.status(404).json({ error: 'Cliente non trovato' });
    }

    const client_id = clientData.id;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        products:product_id (name, price, category)
      `)
      .eq('client_id', client_id)
      .neq('status', 'unconfirmed')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Ottenimento ordini cliente fallito:', err);
    res.status(500).json({ error: 'Errore di database: ' + err.message });
  }
}

export async function getCartOrders(req, res) {
  const user_id = req.user.id;

  try {
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (clientError || !clientData) {
      return res.status(404).json({ error: 'Cliente non trovato' });
    }

    const client_id = clientData.id;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        products:product_id (name, price, category)
      `)
      .eq('client_id', client_id)
      .eq('status', 'unconfirmed')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Get cart orders error:', err);
    res.status(500).json({ error: 'Errore di database: ' + err.message });
  }
}

export async function purchaseOrders(req, res) {
  const user_id = req.user.id;

  try {
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (clientError || !clientData) {
      return res.status(404).json({ error: 'Cliente non trovato' });
    }

    const client_id = clientData.id;

    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'pending' })
      .eq('client_id', client_id)
      .eq('status', 'unconfirmed')
      .select();

    if (error) throw error;

    res.json({ message: 'Acquisto completato', orders: data });
  } catch (err) {
    console.error('Errore di acquisto:', err);
    res.status(500).json({ error: 'Errore di database: ' + err.message });
  }
}

export async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Stato non valido' });
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select();

  if (error || !data || data.length === 0) {
    return res.status(404).json({ error: 'Ordine non trovato' });
  }

  res.json(data[0]);
}

export async function updateCartQuantity(req, res) {
  const { id } = req.params;
  const { quantity } = req.body;
  const user_id = req.user.id;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Quantità non valida' });
  }

  try {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('id, client_id, product_id, status')
      .eq('id', id)
      .eq('status', 'unconfirmed')
      .single();

    if (orderError || !orderData) {
      return res.status(404).json({ error: 'Ordine non trovato o già confermato' });
    }

    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', orderData.client_id)
      .eq('user_id', user_id)
      .single();

    if (clientError || !clientData) {
      return res.status(403).json({ error: 'Non autorizzato' });
    }

    const { data: productData } = await supabase
      .from('products')
      .select('price')
      .eq('id', orderData.product_id)
      .single();

    const total_price = (productData?.price || 0) * quantity;

    const { data, error } = await supabase
      .from('orders')
      .update({ quantity, total_price })
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json(data[0]);
  } catch (err) {
    console.error('Errore di aggiornamento quantità carrello:', err);
    res.status(500).json({ error: 'Errore di database: ' + err.message });
  }
}

export async function deleteCartItem(req, res) {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('id, client_id, status')
      .eq('id', id)
      .eq('status', 'unconfirmed')
      .single();

    if (orderError || !orderData) {
      return res.status(404).json({ error: 'Ordine non trovato o già confermato' });
    }

    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', orderData.client_id)
      .eq('user_id', user_id)
      .single();

    if (clientError || !clientData) {
      return res.status(403).json({ error: 'Non autorizzato' });
    }

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Articolo rimosso dal carrello' });
  } catch (err) {
    console.error('Errore di rimozione di prodotto:', err);
    res.status(500).json({ error: 'Errore di database: ' + err.message });
  }
}

