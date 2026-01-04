const API_URL = '/api';

async function request(method, url, body = null) {
  const headers = {
    'Content-Type': 'application/json'
  };

  const token = localStorage.getItem('token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${url}`, options);

    if (response.status === 401) {
      // Solo fare redirect se non siamo nella pagina di login
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      const errorData = await response.json();
      const error = new Error(errorData.error || 'Credenziali non valide');
      error.response = { status: response.status, data: errorData };
      throw error;
    }

    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.error || 'API Error');
      error.response = { status: response.status, data: errorData };
      throw error;
    }

    return { data: await response.json() };
  } catch (error) {
    throw error;
  }
}

const api = {
  get: (url) => request('GET', url),
  post: (url, data) => request('POST', url, data),
  put: (url, data) => request('PUT', url, data),
  patch: (url, data) => request('PATCH', url, data),
  delete: (url) => request('DELETE', url)
};

export default api;
