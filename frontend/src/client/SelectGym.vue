<template>
  <div class="container">
    <header class="navbar">
      <h1>Seleziona una Palestra</h1>
      <button @click="logout" class="btn-logout">Logout</button>
    </header>

    <main class="content">
      <div v-if="gyms.length > 0" class="gyms-grid">
        <div v-for="gym in gyms" :key="gym.id" class="gym-card">
          <h2>{{ gym.name }}</h2>
          <p><strong>Indirizzo:</strong> {{ gym.address }}</p>
          <p><strong>Telefono:</strong> {{ gym.phone }}</p>
          <button @click="selectGym(gym)" class="btn btn-primary">
            Vedi Abbonamenti
          </button>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>Nessuna palestra disponibile</p>
      </div>
    </main>

    <div v-if="selectedGym" class="modal-overlay" @click="selectedGym = null">
      <div class="modal" @click.stop>
        <h2>{{ selectedGym.name }}</h2>
        <p><strong>Indirizzo:</strong> {{ selectedGym.address }}</p>
        <p><strong>Telefono:</strong> {{ selectedGym.phone }}</p>

        <h3>Abbonamenti Disponibili</h3>
        <div v-if="subscriptions.length > 0" class="subscriptions-list">
          <div v-for="sub in subscriptions" :key="sub.id" class="subscription-item">
            <p><strong>{{ sub.name }}</strong></p>
            <p>Prezzo: €{{ sub.price }}</p>
            <p v-if="sub.duration_months">Durata: {{ sub.duration_months }} mesi</p>
            <button @click="subscribeToGym(sub)" class="btn btn-success">
              Iscriviti
            </button>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>Nessun abbonamento disponibile per questa palestra</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSelectGymLogic } from './services.js';

const {
  gyms,
  selectedGym,
  subscriptions,
  selectGym,
  subscribeToGym,
  logout
} = useSelectGymLogic();
</script>

<style scoped src="./styles.scss"></style>