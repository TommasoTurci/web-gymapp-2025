import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  gymService,
  trainerService,
  clientService,
  subscriptionService,
  shopService
} from '../services/index.js';
import { store } from '../config.js';

export function useOwnerDashboardLogic() {
  const router = useRouter();
  const gyms = ref([]);
  const selectedGym = ref(null);
  const trainers = ref([]);
  const availableTrainers = ref([]);
  const availableGymTrainers = ref([]);
  const clients = ref([]);
  const subscriptions = ref([]);
  const products = ref([]);

  const activeTab = ref('info');
  const showCreateGymForm = ref(false);
  const editingGym = ref(false);
  const selectedClientModal = ref(null);
  const trainerSelection = ref('');
  const editingTrainer = ref(null);
  const editingSpecialization = ref('');
  const showDeleteProductModal = ref(false);
  const productToDelete = ref(null);
  const showConfirmModal = ref(false);
  const confirmMessage = ref('');
  const confirmAction = ref(null);

  const gymForm = ref({ name: '', address: '', phone: '' });
  const subForm = ref({ name: '', price: 0, duration_months: 12 });
  const productForm = ref({ name: '', description: '', price: 0, category: '' });

  onMounted(async () => {
    await loadGyms();
  });

  async function loadGyms() {
    try {
      const response = await gymService.getOwnerGym();
      gyms.value = Array.isArray(response.data) ? response.data : [response.data];
    } catch (error) {
      console.error('Error loading gyms:', error);
      gyms.value = [];
    }
  }

  async function selectGym(gym) {
    selectedGym.value = gym;
    activeTab.value = 'info';
    await Promise.all([
      loadTrainers(gym.id),
      loadAvailableTrainers(),
      loadClients(gym.id),
      loadSubscriptions(gym.id),
      loadProducts(gym.id)
    ]);
  }

  async function loadTrainers(gymId) {
    try {
      const response = await trainerService.getGymTrainers(gymId);
      trainers.value = response.data;
    } catch (error) {
      console.error('Error loading trainers:', error);
    }
  }

  async function loadAvailableTrainers() {
    try {
      const response = await trainerService.getAvailableTrainers();
      availableTrainers.value = response.data;
    } catch (error) {
      console.error('Error loading available trainers:', error);
    }
  }

  async function recruitTrainer(trainer) {
    try {
      await trainerService.assignTrainerToGym(trainer.id, selectedGym.value.id);
      await Promise.all([
        loadAvailableTrainers(),
        loadTrainers(selectedGym.value.id)
      ]);
    } catch (error) {
      console.error('Error recruiting trainer:', error);
    }
  }

  async function loadClients(gymId) {
    try {
      const response = await clientService.getGymClients(gymId);
      clients.value = response.data;
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  }

  async function loadSubscriptions(gymId) {
    try {
      const response = await subscriptionService.getGymSubscriptions(gymId);
      subscriptions.value = response.data;
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  }

  async function loadProducts(gymId) {
    try {
      const response = await shopService.getGymProducts(gymId);
      products.value = response.data;
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  async function createGym() {
    try {
      await gymService.createGym(gymForm.value.name, gymForm.value.address, gymForm.value.phone);
      gymForm.value = { name: '', address: '', phone: '' };
      showCreateGymForm.value = false;
      await loadGyms();
    } catch (error) {
      console.error('Error creating gym:', error);
    }
  }

  async function updateGym() {
    try {
      await gymService.updateGym(
        selectedGym.value.id,
        gymForm.value.name,
        gymForm.value.address,
        gymForm.value.phone
      );
      selectedGym.value = {
        ...selectedGym.value,
        name: gymForm.value.name,
        address: gymForm.value.address,
        phone: gymForm.value.phone
      };
      editingGym.value = false;
    } catch (error) {
      console.error('Error updating gym:', error);
    }
  }

  async function createSubscription() {
    try {
      await subscriptionService.createSubscription(
        subForm.value.name,
        subForm.value.price,
        subForm.value.duration_months,
        selectedGym.value.id
      );
      subForm.value = { name: '', price: 0, duration_months: 12 };
      await loadSubscriptions(selectedGym.value.id);
    } catch (error) {
      console.error('Error creating subscription:', error);
    }
  }

  async function createProduct() {
    try {
      await shopService.createProduct(
        productForm.value.name,
        productForm.value.description,
        productForm.value.price,
        productForm.value.category,
        selectedGym.value.id
      );
      productForm.value = { name: '', description: '', price: 0, category: '' };
      await loadProducts(selectedGym.value.id);
    } catch (err) {
      console.error('Error creating product:', err);
    }
  }

  async function deleteProduct(productId) {
    productToDelete.value = productId;
    showDeleteProductModal.value = true;
  }

  async function confirmDeleteProduct() {
    try {
      await shopService.deleteProduct(productToDelete.value);
      await loadProducts(selectedGym.value.id);
      showDeleteProductModal.value = false;
      productToDelete.value = null;
    } catch (err) {
      console.error('Error deleting product:', err);
      showDeleteProductModal.value = false;
      productToDelete.value = null;
    }
  }

  function cancelDeleteProduct() {
    showDeleteProductModal.value = false;
    productToDelete.value = null;
  }

  function selectClientForTrainer(client) {
    selectedClientModal.value = client;
    trainerSelection.value = '';
    loadAvailableGymTrainers();
  }

  async function loadAvailableGymTrainers() {
    try {
      const response = await trainerService.getAvailableGymTrainers(selectedGym.value.id);
      availableGymTrainers.value = response.data;
    } catch (error) {
      console.error('Error loading available trainers:', error);
    }
  }

  async function assignTrainerToClient() {
    try {
      await clientService.assignTrainer(selectedClientModal.value.id, parseInt(trainerSelection.value));
      selectedClientModal.value = null;
      await loadClients(selectedGym.value.id);
    } catch (error) {
      console.error('Error assigning trainer:', error);
    }
  }

  async function revokeTrainerFromClient(client) {
    try {
      await clientService.revokeTrainer(client.id);
      await loadClients(selectedGym.value.id);
    } catch (error) {
      console.error('Error revoking trainer:', error);
    }
  }

  function startEditingTrainer(trainer) {
    editingTrainer.value = trainer.id;
    editingSpecialization.value = trainer.specialization || '';
  }

  async function saveTrainerSpecialization() {
    try {
      await trainerService.updateTrainerSpecialization(editingTrainer.value, editingSpecialization.value);
      editingTrainer.value = null;
      await loadTrainers(selectedGym.value.id);
    } catch (error) {
      console.error('Error updating specialization:', error);
    }
  }

  function cancelEditingTrainer() {
    editingTrainer.value = null;
    editingSpecialization.value = '';
  }

  async function removeTrainer(trainerId) {
    const trainerToRemove = trainers.value.find(t => t.id === trainerId);
    if (!trainerToRemove) {
      console.error('Trainer non trovato');
      return;
    }

    confirmMessage.value = `Sei sicuro di voler rimuovere ${trainerToRemove.users.name}? Verranno rimossi tutti gli assegnamenti ai clienti.`;
    confirmAction.value = async () => {
      try {
        // Rimuovi tutti gli assegnamenti di questo trainer ai clienti
        const clientsWithTrainer = clients.value.filter(c => c.trainer_id === trainerId);
        for (const client of clientsWithTrainer) {
          await clientService.revokeTrainer(client.id);
        }
        
        // Disassocia il trainer dalla palestra
        await trainerService.removeTrainerFromGym(trainerToRemove.user_id);
        await loadTrainers(selectedGym.value.id);
        await loadClients(selectedGym.value.id);
        showConfirmModal.value = false;
      } catch (error) {
        console.error('Error removing trainer:', error);
        showConfirmModal.value = false;
      }
    };
    showConfirmModal.value = true;
  }

  async function removeSubscription(subscriptionId) {
    const subToRemove = subscriptions.value.find(s => s.id === subscriptionId);
    if (!subToRemove) {
      console.error('Abbonamento non trovato');
      return;
    }

    confirmMessage.value = `Sei sicuro di voler rimuovere l'abbonamento "${subToRemove.name}"? Tutti i clienti con questo abbonamento saranno rimossi dalla palestra.`;
    confirmAction.value = async () => {
      try {
        // Trova tutti i clienti con questo abbonamento
        const clientsWithSubscription = clients.value.filter(c => c.subscription_id === subscriptionId);
        
        // Per ogni cliente, rimuovilo dalla palestra (la revoca del trainer avviene automaticamente)
        for (const client of clientsWithSubscription) {
          await clientService.removeClientFromGym(client.id);
        }
        
        // Rimuovi l'abbonamento
        await subscriptionService.deleteSubscription(subscriptionId);
        await loadSubscriptions(selectedGym.value.id);
        await loadClients(selectedGym.value.id);
        showConfirmModal.value = false;
      } catch (error) {
        console.error('Error removing subscription:', error);
        showConfirmModal.value = false;
      }
    };
    showConfirmModal.value = true;
  }

  async function logout() {
    store.logout();
    router.push('/login');
  }

  return {
    gyms,
    selectedGym,
    trainers,
    availableTrainers,
    availableGymTrainers,
    clients,
    subscriptions,
    products,
    activeTab,
    showCreateGymForm,
    editingGym,
    selectedClientModal,
    trainerSelection,
    editingTrainer,
    editingSpecialization,
    showDeleteProductModal,
    productToDelete,
    showConfirmModal,
    confirmMessage,
    confirmAction,
    gymForm,
    subForm,
    productForm,
    selectGym,
    loadTrainers,
    loadAvailableTrainers,
    recruitTrainer,
    loadClients,
    loadSubscriptions,
    createGym,
    updateGym,
    createSubscription,
    createProduct,
    loadProducts,
    deleteProduct,
    confirmDeleteProduct,
    cancelDeleteProduct,
    selectClientForTrainer,
    loadAvailableGymTrainers,
    assignTrainerToClient,
    revokeTrainerFromClient,
    startEditingTrainer,
    saveTrainerSpecialization,
    cancelEditingTrainer,
    removeTrainer,
    removeSubscription,
    logout,
    cancelConfirm: () => { showConfirmModal.value = false; confirmAction.value = null; }
  };
}
