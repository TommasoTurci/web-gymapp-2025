import api from './api.js';

export const authService = {
  register(email, password, name, role) {
    return api.post('/auth/register', { email, password, name, role });
  },

  login(email, password) {
    return api.post('/auth/login', { email, password });
  },

  getProfile() {
    return api.get('/auth/profile');
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const gymService = {
  createGym(name, address, phone) {
    return api.post('/gyms', { name, address, phone });
  },

  getGym(id) {
    return api.get(`/gyms/${id}`);
  },

  getAllGyms() {
    return api.get('/gyms/all');
  },

  getOwnerGym() {
    return api.get('/gyms');
  },

  updateGym(id, name, address, phone) {
    return api.put(`/gyms/${id}`, { name, address, phone });
  }
};

export const clientService = {
  createClient(user_id, gym_id, subscription_id) {
    return api.post('/clients', { user_id, gym_id, subscription_id });
  },

  getClientProfile() {
    return api.get('/clients/user/profile');
  },

  getClient(id) {
    return api.get(`/clients/${id}`);
  },

  getCurrentGym() {
    return api.get('/clients/user/current-gym');
  },

  updateClientSubscription(client_id, subscription_id) {
    return api.put('/clients/subscription', { client_id, subscription_id });
  },

  assignTrainer(client_id, trainer_id) {
    return api.put('/clients/trainer', { client_id, trainer_id });
  },

  revokeTrainer(client_id) {
    return api.put('/clients/revoke-trainer', { client_id });
  },

  subscribeToGym(gym_id, subscription_id) {
    return api.post('/clients/subscribe', { gym_id, subscription_id });
  },

  getGymClients(gym_id) {
    return api.get(`/clients/gym/${gym_id}`);
  },

  removeClientFromGym(client_id) {
    return api.delete(`/clients/${client_id}`);
  }
};

export const trainerService = {
  createTrainer(user_id, gym_id, specialization) {
    return api.post('/trainers', { user_id, gym_id, specialization });
  },

  getTrainerProfile() {
    return api.get('/trainers/user/profile');
  },

  getTrainerGym() {
    return api.get('/trainers/user/gym');
  },

  getTrainer(id) {
    return api.get(`/trainers/${id}`);
  },

  getGymTrainers(gym_id) {
    return api.get(`/trainers/gym/${gym_id}`);
  },

  getAvailableGymTrainers(gym_id) {
    return api.get(`/trainers/gym/${gym_id}/available`);
  },

  getAvailableTrainers() {
    return api.get('/trainers/available');
  },

  assignTrainerToGym(user_id, gym_id) {
    return api.put('/trainers/assign-to-gym', { user_id, gym_id });
  },

  updateTrainerSpecialization(trainer_id, specialization) {
    return api.put(`/trainers/${trainer_id}/specialization`, { specialization });
  },

  getTrainerClients() {
    return api.get('/trainers/user/clients');
  },

  removeTrainerFromGym(user_id) {
    return api.put(`/trainers/${user_id}/remove-from-gym`, {});
  }
};

export const subscriptionService = {
  createSubscription(name, price, duration_months, gym_id) {
    return api.post('/subscriptions', { name, price, duration_months, gym_id });
  },

  getSubscription(id) {
    return api.get(`/subscriptions/${id}`);
  },

  getGymSubscriptions(gym_id) {
    return api.get(`/subscriptions/gym/${gym_id}`);
  },

  updateSubscription(id, name, price, duration_months) {
    return api.put(`/subscriptions/${id}`, { name, price, duration_months });
  },

  deleteSubscription(id) {
    return api.delete(`/subscriptions/${id}`);
  }
};

export const exerciseService = {
  createExercise(name, description, sets, reps) {
    return api.post('/exercises', { name, description, sets, reps });
  },

  getExercise(id) {
    return api.get(`/exercises/${id}`);
  },

  getAllExercises() {
    return api.get('/exercises');
  },

  getTrainerExercises() {
    return api.get('/exercises/trainer/my-exercises');
  },

  updateExercise(id, name, description, sets, reps) {
    return api.put(`/exercises/${id}`, { name, description, sets, reps });
  },

  deleteExercise(id) {
    return api.delete(`/exercises/${id}`);
  },

  assignExerciseToClient(client_id, exercise_id) {
    return api.post('/exercises/assign', { client_id, exercise_id });
  },

  getClientExercises(client_id) {
    return api.get(`/exercises/client/${client_id}`);
  },

  deleteClientExercise(plan_id) {
    return api.delete(`/exercises/plan/${plan_id}`);
  }
};

export const shopService = {
  createProduct(name, description, price, category, gym_id) {
    return api.post('/shop/products', { name, description, price, category, gym_id });
  },

  getProduct(id) {
    return api.get(`/shop/products/${id}`);
  },

  getGymProducts(gym_id, category = null) {
    const params = category ? `?category=${category}` : '';
    return api.get(`/shop/gym/${gym_id}/products${params}`);
  },

  updateProduct(id, name, description, price) {
    return api.put(`/shop/products/${id}`, { name, description, price });
  },

  deleteProduct(id) {
    return api.delete(`/shop/products/${id}`);
  },

  createOrder(product_id, quantity, gym_id) {
    return api.post('/shop/orders', { product_id, quantity, gym_id });
  },

  getCartOrders() {
    return api.get('/shop/cart');
  },

  getClientOrders() {
    return api.get('/shop/orders');
  },

  purchaseOrders() {
    return api.post('/shop/purchase');
  },

  updateCartQuantity(orderId, quantity) {
    return api.patch(`/shop/cart/${orderId}`, { quantity });
  },

  deleteCartItem(orderId) {
    return api.delete(`/shop/cart/${orderId}`);
  },

  updateOrderStatus(id, status) {
    return api.put(`/shop/orders/${id}`, { status });
  }
};
