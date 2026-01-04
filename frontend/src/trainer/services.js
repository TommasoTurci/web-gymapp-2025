import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { trainerService, exerciseService } from '../services/index.js';
import { store } from '../config.js';

export function useTrainerDashboardLogic() {
  const router = useRouter();
  const activeTab = ref('palestra');

  const gym = ref(null);
  const trainerSpecialization = ref('');
  const clients = ref([]);
  const selectedClient = ref(null);

  const trainerExercises = ref([]);
  const clientExercises = ref([]);
  const newExerciseForm = ref({
    name: '',
    description: '',
    sets: 3,
    reps: 10
  });
  const exerciseForm = ref({ exercise_id: '' });

  onMounted(async () => {
    await Promise.all([
      loadGym(),
      loadClients(),
      loadTrainerExercises()
    ]);
  });

  async function loadGym() {
    try {
      const response = await trainerService.getTrainerGym();
      gym.value = response.data.gym;
      trainerSpecialization.value = response.data.specialization;
    } catch (error) {
      console.error('Errore nel caricare la palestra:', error);
    }
  }

  async function loadClients() {
    try {
      const response = await trainerService.getTrainerClients();
      clients.value = response.data;
    } catch (error) {
      console.error('Errore nel caricare i clienti', error);
    }
  }

  async function loadTrainerExercises() {
    try {
      const response = await exerciseService.getTrainerExercises();
      trainerExercises.value = response.data;
    } catch (error) {
      console.error('Errore nel caricare gli esercizi del trainer:', error);
    }
  }

  async function createNewExercise() {
    try {
      await exerciseService.createExercise(
        newExerciseForm.value.name,
        newExerciseForm.value.description,
        newExerciseForm.value.sets,
        newExerciseForm.value.reps
      );
      newExerciseForm.value = {
        name: '',
        description: '',
        sets: 3,
        reps: 10
      };
      await loadTrainerExercises();
    } catch (error) {
      console.error('Errore nel creare gli esercizi del cliente:', error);
    }
  }

  async function selectClientForExercises(client) {
    selectedClient.value = client;
    try {
      const response = await exerciseService.getClientExercises(client.id);
      clientExercises.value = response.data;
    } catch (error) {
      console.error('Errore nel caricare gli esercizi del cliente:', error);
    }
  }

  async function assignExercise() {
    try {
      await exerciseService.assignExerciseToClient(
        selectedClient.value.id,
        exerciseForm.value.exercise_id
      );
      exerciseForm.value.exercise_id = '';
      await selectClientForExercises(selectedClient.value);
    } catch (error) {
      console.error('Errore nel assegnare gli esercizi del cliente:', error);
    }
  }

  async function removeExercise(clientExerciseId) {
    try {
      await exerciseService.deleteClientExercise(clientExerciseId);
      await selectClientForExercises(selectedClient.value);
    } catch (error) {
      console.error('Errore nel rimuovere l\'esercizio del cliente:', error);
    }
  }

  async function deleteExercise(exerciseId) {
    try {
      await exerciseService.deleteExercise(exerciseId);
      await loadTrainerExercises();
    } catch (error) {
      console.error('Errore nell\'eliminare l\'esercizio:', error);
    }
  }

  async function logout() {
    store.logout();
    router.push('/login');
  }

  return {
    activeTab,
    gym,
    trainerSpecialization,
    clients,
    selectedClient,
    trainerExercises,
    clientExercises,
    newExerciseForm,
    exerciseForm,
    loadGym,
    loadClients,
    loadTrainerExercises,
    createNewExercise,
    selectClientForExercises,
    assignExercise,
    removeExercise,
    deleteExercise,
    logout
  };
}
