export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('it-IT');
}

export function formatTime(time) {
  if (!time) return '';
  return new Date(`1970-01-01 ${time}`).toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatRole(role) {
  const roles = {
    owner: 'Proprietario',
    trainer: 'Personal Trainer',
    client: 'Cliente'
  };
  return roles[role] || role;
}

export function getInitials(name) {
  if (!name) return '';
  return name.split(' ').map(word => word[0]).join('').toUpperCase();
}
