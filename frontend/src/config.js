import { createRouter, createWebHistory } from 'vue-router';
import { reactive, computed } from 'vue';
import { Login, Register } from './auth/index.js';
import { Dashboard as OwnerDashboard } from './gym/index.js';
import { Dashboard as TrainerDashboard } from './trainer/index.js';
import { Dashboard as ClientDashboard, SelectGym } from './client/index.js';

const state = reactive({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
});

export const store = {
  user: computed(() => state.user),
  token: computed(() => state.token),
  isAuthenticated: computed(() => !!state.token),
  role: computed(() => state.user?.role),

  setUser(user, token) {
    state.user = user;
    state.token = token;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  },

  logout() {
    state.user = null;
    state.token = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
};

const routes = [
  { path: '/login', component: Login, meta: { requiresAuth: false } },
  { path: '/register', component: Register, meta: { requiresAuth: false } },
  {
    path: '/dashboard/owner',
    component: OwnerDashboard,
    meta: { requiresAuth: true, role: 'owner' }
  },
  {
    path: '/dashboard/trainer',
    component: TrainerDashboard,
    meta: { requiresAuth: true, role: 'trainer' }
  },
  {
    path: '/dashboard/client',
    component: ClientDashboard,
    meta: { requiresAuth: true, role: 'client' }
  },
  {
    path: '/select-gym',
    component: SelectGym,
    meta: { requiresAuth: true, role: 'client' }
  },
  { path: '/', redirect: '/login' }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = store.isAuthenticated.value;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.meta.role && store.role.value !== to.meta.role) {
    next('/login');
  } else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    const role = store.role.value;
    next(`/dashboard/${role}`);
  } else {
    next();
  }
});

export default router;
