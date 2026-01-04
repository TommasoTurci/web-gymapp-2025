import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { clientService, trainerService, exerciseService, shopService, gymService, subscriptionService } from '../services/index.js';
import { store } from '../config.js';

export function useClientDashboardLogic() {
  const router = useRouter();
  const activeTab = ref('profile');
  const profile = ref(null);
  const trainer = ref(null);
  const myExercises = ref([]);
  const products = ref([]);
  const allProducts = ref([]);
  const orders = ref([]);
  const cartOrders = ref([]);
  const confirmedOrders = ref([]);
  const searchQuery = ref('');
  const selectedCategory = ref('');
  const showCart = ref(false);
  const productQuantities = ref({});

  onMounted(async () => {
    await loadProfile();
    await loadTrainer();
    await loadExercises();
    await loadProducts();
    await loadCartOrders();
    await loadConfirmedOrders();
  });

  watch([searchQuery, selectedCategory], () => {
    filterProducts();
  });

  watch(showCart, async (newVal) => {
    if (newVal) {
      await loadCartOrders();
    }
  });

  async function loadProfile() {
    try {
      const response = await clientService.getClientProfile();
      profile.value = response.data;
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  async function loadTrainer() {
    try {
      if (profile.value && profile.value.trainer_id) {
        const response = await trainerService.getTrainer(profile.value.trainer_id);
        trainer.value = response.data;
      }
    } catch (error) {
      console.error('Error loading trainer:', error);
    }
  }

  async function loadExercises() {
    try {
      if (profile.value) {
        const response = await exerciseService.getClientExercises(profile.value.id);
        myExercises.value = response.data;
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  }

  async function loadProducts() {
    try {
      if (profile.value) {
        const response = await shopService.getGymProducts(profile.value.gym_id);
        allProducts.value = response.data;
        allProducts.value.forEach(product => {
          if (!productQuantities.value[product.id]) {
            productQuantities.value[product.id] = 1;
          }
        });
        filterProducts();
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  function filterProducts() {
    let filtered = allProducts.value;
    
    if (selectedCategory.value) {
      filtered = filtered.filter(p => p.category === selectedCategory.value);
    }
    
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.description && p.description.toLowerCase().includes(query))
      );
    }
    
    products.value = filtered;
  }

  async function loadCartOrders() {
    try {
      const response = await shopService.getCartOrders();
      cartOrders.value = response.data || [];
    } catch (error) {
      console.error('Error loading cart:', error);
      cartOrders.value = [];
    }
  }

  async function loadConfirmedOrders() {
    try {
      const response = await shopService.getClientOrders();
      confirmedOrders.value = response.data || [];
    } catch (error) {
      console.error('Error loading orders:', error);
      confirmedOrders.value = [];
    }
  }

  async function addToCart(product) {
    try {
      await shopService.createOrder(profile.value.id, product.id, productQuantities.value[product.id] || 1);
      await loadCartOrders();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }

  async function confirmOrder(order) {
    try {
      await shopService.updateOrderStatus(order.id, 'confirmed');
      await loadCartOrders();
      await loadConfirmedOrders();
    } catch (error) {
      console.error('Error confirming order:', error);
    }
  }

  async function buyProduct(productId) {
    try {
      if (!profile.value) {
        console.error('Errore: profilo non caricato');
        return;
      }
      
      if (!profile.value.gym_id) {
        console.error('Errore: gym_id non trovato nel profilo', profile.value);
        return;
      }
      
      const quantity = productQuantities.value[productId] || 1;
      console.log(`Aggiungendo prodotto ${productId}, quantità ${quantity}, gym_id ${profile.value.gym_id}`);
      
      await shopService.createOrder(productId, quantity, profile.value.gym_id);
      productQuantities.value[productId] = 1;
      await loadCartOrders();
      console.log('Prodotto aggiunto al carrello con successo');
    } catch (error) {
      console.error('Errore nell\'aggiunta al carrello:', error);
    }
  }

  async function updateOrderQuantity(orderId, quantity) {
    if (quantity < 1) return;
    try {
      await shopService.updateCartQuantity(orderId, quantity);
      await loadCartOrders();
    } catch (error) {
      console.error('Errore nell\'aggiornamento quantità:', error);
    }
  }

  async function deleteCartItem(orderId) {
    try {
      await shopService.deleteCartItem(orderId);
      await loadCartOrders();
    } catch (error) {
      console.error('Errore nella rimozione articolo:', error);
    }
  }

  async function purchaseCart() {
    try {
      await shopService.purchaseOrders();
      showCart.value = false;
      await loadCartOrders();
      await loadConfirmedOrders();
    } catch (error) {
      console.error('Errore nell\'acquisto:', error);
    }
  }

  const cartTotal = computed(() => {
    return cartOrders.value.reduce((total, order) => {
      return total + (order.products?.price * order.quantity || 0);
    }, 0).toFixed(2);
  });

  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  async function logout() {
    store.logout();
    router.push('/login');
  }

  return {
    activeTab,
    profile,
    trainer,
    myExercises,
    products,
    cartOrders,
    confirmedOrders,
    searchQuery,
    selectedCategory,
    showCart,
    productQuantities,
    addToCart,
    confirmOrder,
    buyProduct,
    updateOrderQuantity,
    deleteCartItem,
    purchaseCart,
    cartTotal,
    formatDate,
    logout
  };
}

export function useSelectGymLogic() {
  const router = useRouter();
  const gyms = ref([]);
  const selectedGym = ref(null);
  const subscriptions = ref([]);

  onMounted(async () => {
    await loadGyms();
  });

  async function loadGyms() {
    try {
      const response = await gymService.getAllGyms();
      gyms.value = response.data;
    } catch (error) {
      console.error('Error loading gyms:', error);
    }
  }

  async function selectGym(gym) {
    selectedGym.value = gym;
    await loadSubscriptions(gym.id);
  }

  async function loadSubscriptions(gymId) {
    try {
      const response = await subscriptionService.getGymSubscriptions(gymId);
      subscriptions.value = response.data;
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  }

  async function subscribeToGym(subscription) {
    try {
      await clientService.subscribeToGym(selectedGym.value.id, subscription.id);
      router.push('/dashboard/client');
    } catch (error) {
      console.error('Error subscribing to gym:', error);
    }
  }

  async function logout() {
    store.logout();
    router.push('/login');
  }

  return {
    gyms,
    selectedGym,
    subscriptions,
    selectGym,
    subscribeToGym,
    logout
  };
}
