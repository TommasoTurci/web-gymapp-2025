import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService, clientService } from '../services/index.js';
import { store } from '../config.js';

export function useLoginLogic() {
  const router = useRouter();
  const form = reactive({
    email: '',
    password: ''
  });
  const error = ref('');

  async function handleLogin() {
    error.value = '';
    try {
      const response = await authService.login(form.email, form.password);
      const { token, ...user } = response.data;
      store.setUser(user, token);
      
      if (user.role === 'client') {
        try {
          await clientService.getCurrentGym();
          router.push('/dashboard/client');
        } catch (err) {
          router.push('/select-gym');
        }
      } else {
        router.push(`/dashboard/${user.role}`);
      }
    } catch (err) {
      console.error('Login error:', err);
      error.value = err.response?.data?.error || 'Email o password non corretti';
    }
  }

  return {
    form,
    error,
    handleLogin
  };
}

export function useRegisterLogic() {
  const router = useRouter();
  const form = reactive({
    name: '',
    email: '',
    password: '',
    role: ''
  });

  async function handleRegister() {
    try {
      const response = await authService.register(form.email, form.password, form.name, form.role);
      const { token, ...user } = response.data;
      store.setUser(user, token);
      router.push('/select-gym');
    } catch (err) {
      console.error('Register error:', err);
    }
  }

  return {
    form,
    handleRegister
  };
}
