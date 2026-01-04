<script setup>
import { useTrainerDashboardLogic } from './services.js';

const {
  activeTab, gym, trainerSpecialization, clients, selectedClient, trainerExercises,
  clientExercises, newExerciseForm, exerciseForm, loadGym, loadClients, loadTrainerExercises,
  createNewExercise, selectClientForExercises, assignExercise, removeExercise, deleteExercise, logout
} = useTrainerDashboardLogic();
</script>

<template>
  <div class="dashboard">
    <header class="navbar">
      <h1>Dashboard Personal Trainer</h1>
      <button @click="logout" class="btn-logout">Logout</button>
    </header>

    <nav class="tabs-top">
      <button
        @click="activeTab = 'palestra'"
        :class="['tab', { active: activeTab === 'palestra' }]"
      >
        Palestra
      </button>
      <button
        @click="activeTab = 'clienti'"
        :class="['tab', { active: activeTab === 'clienti' }]"
      >
        Clienti
      </button>
      <button
        @click="activeTab = 'esercizi'"
        :class="['tab', { active: activeTab === 'esercizi' }]"
      >
        Esercizi
      </button>
    </nav>

    <main class="content">

      <section v-if="activeTab === 'palestra'" class="section">
        <h2>Informazioni Palestra</h2>
        <div v-if="gym" class="gym-info">
          <p><strong>Nome:</strong> {{ gym.name }}</p>
          <p><strong>Indirizzo:</strong> {{ gym.address }}</p>
          <p><strong>Telefono:</strong> {{ gym.phone }}</p>
          <p><strong>Specializzazione:</strong> {{ trainerSpecialization || 'Non specificata' }}</p>
        </div>
      </section>

      <section v-if="activeTab === 'clienti'" class="section">
        <h2>Miei Clienti</h2>
        <div v-if="clients.length > 0" class="list">
          <div v-for="client in clients" :key="client.id" class="item">
            <div class="item-header">
              <div>
                <h3 class="client-name">{{ client.users.name }}</h3>
                <p class="client-email">{{ client.users.email }}</p>
              </div>
              <button
                @click="selectClientForExercises(client)"
                class="btn btn-action"
              >
                Gestisci Esercizi
              </button>
            </div>
            <p class="client-subscription"><strong>Abbonamento:</strong> {{ client.subscriptions?.name || 'Nessuno' }}</p>
          </div>
        </div>
        <div v-else class="empty-state">
          Nessun cliente assegnato
        </div>
      </section>

      <section v-if="activeTab === 'esercizi'" class="section">
        <h2>Esercizi</h2>

        <div class="subsection">
          <h3>Crea Nuovo Esercizio</h3>
          <form @submit.prevent="createNewExercise" class="form">
            <div class="form-group">
              <label for="exercise-name">Nome esercizio</label>
              <input id="exercise-name" v-model="newExerciseForm.name" name="exercise-name" type="text" required />
            </div>
            <div class="form-group">
              <label for="exercise-desc">Descrizione</label>
              <textarea
                id="exercise-desc"
                v-model="newExerciseForm.description"
                name="exercise-description"
                rows="3"
              ></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="exercise-sets">Serie</label>
                <input id="exercise-sets" v-model.number="newExerciseForm.sets" name="exercise-sets" type="number" min="1" />
              </div>
              <div class="form-group">
                <label for="exercise-reps">Ripetizioni</label>
                <input id="exercise-reps" v-model.number="newExerciseForm.reps" name="exercise-reps" type="number" min="1" />
              </div>
            </div>
            <button type="submit" class="btn">Crea Esercizio</button>
          </form>
        </div>

        <div class="subsection">
          <h3>I Miei Esercizi</h3>
          <div v-if="trainerExercises.length > 0" class="list">
            <div v-for="exercise in trainerExercises" :key="exercise.id" class="item">
              <div class="item-header">
                <div>
                  <h4 class="exercise-title">{{ exercise.name }}</h4>
                  <p v-if="exercise.description" class="exercise-desc">{{ exercise.description }}</p>
                  <p class="exercise-meta">
                    <strong>Serie:</strong> {{ exercise.sets || '-' }} |
                    <strong>Ripetizioni:</strong> {{ exercise.reps || '-' }}
                  </p>
                </div>
                <button @click="deleteExercise(exercise.id)" class="btn btn-action btn-danger">
                  Elimina
                </button>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            Nessun esercizio creato ancora
          </div>
        </div>
      </section>
    </main>

    <div v-if="selectedClient" class="modal-overlay" @click="selectedClient = null">
      <div class="modal" @click.stop>
        <h3>Assegna Esercizi a {{ selectedClient.users.name }}</h3>
        
        <form @submit.prevent="assignExercise" class="form">
          <div class="form-group">
            <label for="select-exercise">Seleziona esercizio</label>
            <select id="select-exercise" v-model="exerciseForm.exercise_id" name="exercise" required>
              <option value="">-- Seleziona --</option>
              <option v-for="ex in trainerExercises" :key="ex.id" :value="ex.id">
                {{ ex.name }} ({{ ex.sets }} x {{ ex.reps }})
              </option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn">Assegna</button>
            <button type="button" @click="selectedClient = null" class="btn btn-cancel">
              Chiudi
            </button>
          </div>
        </form>

        <h4 class="modal-section-title">Esercizi Assegnati</h4>
        <div v-if="clientExercises.length > 0" class="list">
          <div v-for="ex in clientExercises" :key="ex.id" class="item">
            <div class="item-header">
              <div>
                <p class="exercise-name">{{ ex.exercises.name }}</p>
                <p v-if="ex.exercises.description" class="exercise-desc">
                  {{ ex.exercises.description }}
                </p>
                <p class="exercise-meta">
                  <strong>Serie:</strong> {{ ex.exercises.sets || '-' }} |
                  <strong>Ripetizioni:</strong> {{ ex.exercises.reps || '-' }}
                </p>
              </div>
              <button @click="removeExercise(ex.id)" class="btn btn-action btn-warning">
                Rimuovi
              </button>
            </div>
          </div>
        </div>
        <div v-else class="empty-state empty-state-mt">
          Nessun esercizio assegnato
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="./styles.scss"></style>
