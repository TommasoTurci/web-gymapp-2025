<script setup>
import { useOwnerDashboardLogic } from './services.js';

const {
  gyms, selectedGym, trainers, availableTrainers, availableGymTrainers, clients,
  subscriptions, products, activeTab, showCreateGymForm, editingGym, selectedClientModal,
  trainerSelection, editingTrainer, editingSpecialization, gymForm, subForm, productForm,
  selectGym, loadTrainers, loadAvailableTrainers, recruitTrainer, loadClients,
  loadSubscriptions, createGym, updateGym, createSubscription, createProduct, loadProducts,
  deleteProduct, confirmDeleteProduct, cancelDeleteProduct, selectClientForTrainer, loadAvailableGymTrainers, assignTrainerToClient,
  revokeTrainerFromClient, startEditingTrainer, saveTrainerSpecialization, cancelEditingTrainer, removeTrainer, removeSubscription, showDeleteProductModal, 
  showConfirmModal, confirmMessage, confirmAction, cancelConfirm, logout
} = useOwnerDashboardLogic();
</script>

<template>
  <div class="dashboard">
    <header class="navbar">
      <h1>Dashboard Proprietario</h1>
      <button @click="logout" class="btn-logout">Logout</button>
    </header>

    <main class="content">
      <section class="gym-selection">
        <h2>Le Mie Palestre</h2>
        <div class="gym-list">
          <button
            v-for="gym in gyms"
            :key="gym.id"
            @click="selectGym(gym)"
            :class="['btn btn-secondary', { active: selectedGym?.id === gym.id }]"
          >
            {{ gym.name }}
          </button>
          <button @click="showCreateGymForm = true" class="btn">
            + Nuova Palestra
          </button>
        </div>

        <div v-if="showCreateGymForm" class="modal-overlay" @click="showCreateGymForm = false">
          <div class="modal" @click.stop>
            <h3>Crea Nuova Palestra</h3>
            <form @submit.prevent="createGym" class="form">
              <div class="form-group">
                <label for="create-gym-name">Nome palestra</label>
                <input id="create-gym-name" v-model="gymForm.name" name="gym-name" type="text" required />
              </div>
              <div class="form-group">
                <label for="create-gym-address">Indirizzo</label>
                <input id="create-gym-address" v-model="gymForm.address" name="gym-address" type="text" />
              </div>
              <div class="form-group">
                <label for="create-gym-phone">Telefono</label>
                <input id="create-gym-phone" v-model="gymForm.phone" name="gym-phone" type="text" />
              </div>
              <div class="form-actions">
                <button type="submit" class="btn">Crea</button>
                <button type="button" @click="showCreateGymForm = false" class="btn btn-cancel">
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section v-if="selectedGym" class="gym-management">

        <nav class="tabs-top">
          <button
            @click="activeTab = 'info'"
            :class="['tab', { active: activeTab === 'info' }]"
          >
            Informazioni
          </button>
          <button
            @click="activeTab = 'recruit'"
            :class="['tab', { active: activeTab === 'recruit' }]"
          >
            Recluta Trainer
          </button>
          <button
            @click="activeTab = 'trainers'"
            :class="['tab', { active: activeTab === 'trainers' }]"
          >
            Trainer
          </button>
          <button
            @click="activeTab = 'clients'"
            :class="['tab', { active: activeTab === 'clients' }]"
          >
            Clienti
          </button>
          <button
            @click="activeTab = 'subscriptions'"
            :class="['tab', { active: activeTab === 'subscriptions' }]"
          >
            Abbonamenti
          </button>
          <button
            @click="activeTab = 'products'"
            :class="['tab', { active: activeTab === 'products' }]"
          >
            Prodotti
          </button>
        </nav>

        <section v-if="activeTab === 'info'" class="section">
          <h2>{{ selectedGym.name }}</h2>
          <div class="gym-info">
            <p><strong>Indirizzo:</strong> {{ selectedGym.address }}</p>
            <p><strong>Telefono:</strong> {{ selectedGym.phone }}</p>
            <button @click="editingGym = true" class="btn">Modifica</button>
          </div>

          <div v-if="editingGym" class="modal-overlay" @click="editingGym = false">
            <div class="modal" @click.stop>
              <h3>Modifica Palestra</h3>
              <form @submit.prevent="updateGym" class="form">
                <div class="form-group">
                  <label for="edit-gym-name">Nome palestra</label>
                  <input id="edit-gym-name" v-model="gymForm.name" name="gym-name" type="text" required />
                </div>
                <div class="form-group">
                  <label for="edit-gym-address">Indirizzo</label>
                  <input id="edit-gym-address" v-model="gymForm.address" name="gym-address" type="text" />
                </div>
                <div class="form-group">
                  <label for="edit-gym-phone">Telefono</label>
                  <input id="edit-gym-phone" v-model="gymForm.phone" name="gym-phone" type="text" />
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn">Salva</button>
                  <button type="button" @click="editingGym = false" class="btn btn-cancel">
                    Annulla
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <section v-if="activeTab === 'recruit'" class="section">
          <h2>Recluta Personal Trainer</h2>
          <div v-if="availableTrainers.length > 0" class="list">
            <div v-for="trainer in availableTrainers" :key="trainer.id" class="item">
              <p><strong>{{ trainer.name }}</strong></p>
              <p>Email: {{ trainer.email }}</p>
              <button @click="recruitTrainer(trainer)" class="btn">
                Recluta
              </button>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>Nessun trainer disponibile al momento</p>
          </div>
        </section>

        <section v-if="activeTab === 'trainers'" class="section">
          <h2>Trainer della Palestra</h2>
          <div class="list">
            <div v-for="trainer in trainers" :key="trainer.id" class="item">
              <p><strong>{{ trainer.users.name }}</strong></p>
              <p>Email: {{ trainer.users.email }}</p>
              <div v-if="editingTrainer === trainer.id" class="edit-specialization">
                <label for="trainer-spec">Specializzazione</label>
                <input
                  id="trainer-spec"
                  v-model="editingSpecialization"
                  name="specialization"
                  placeholder="Specializzazione"
                  class="input-spec"
                />
                <button @click="saveTrainerSpecialization" class="btn btn-action">Salva</button>
                <button @click="cancelEditingTrainer" class="btn btn-action btn-cancel">Annulla</button>
              </div>
              <div v-else>
                <p>Specializzazione: {{ trainer.specialization || 'Non specificata' }}</p>
                <div class="button-group">
                  <button @click="startEditingTrainer(trainer)" class="btn btn-action">
                    Modifica
                  </button>
                  <button @click="removeTrainer(trainer.id)" class="btn btn-action btn-danger">
                    Rimuovi
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-if="trainers.length === 0" class="empty-state">
            <p>Nessun trainer assegnato</p>
          </div>
        </section>

        <section v-if="activeTab === 'clients'" class="section">
          <h2>Clienti della Palestra</h2>
          <div class="list">
            <div v-for="client in clients" :key="client.id" class="item">
              <p>
                <strong>{{ client.users.name }}</strong>
                <span v-if="client.trainers" class="trainer-badge">
                   - {{ client.trainers.users?.name }}
                </span>
              </p>
              <p>Email: {{ client.users.email }}</p>
              <p>Abbonamento: {{ client.subscriptions?.name || 'Nessuno' }}</p>
              <div class="actions">
                <button
                  v-if="!client.trainer_id"
                  @click="selectClientForTrainer(client)"
                  class="btn btn-action"
                >
                  Assegna Trainer
                </button>
                <button
                  v-else
                  @click="revokeTrainerFromClient(client)"
                  class="btn btn-action btn-warning"
                >
                  Revoca Trainer
                </button>
              </div>
            </div>
          </div>
          <div v-if="clients.length === 0" class="empty-state">
            <p>Nessun cliente</p>
          </div>

          <div v-if="selectedClientModal" class="modal-overlay" @click="selectedClientModal = null">
            <div class="modal" @click.stop>
              <h3>Assegna Trainer a {{ selectedClientModal.users.name }}</h3>
              <div class="form-group">
                <label for="select-trainer">Seleziona Trainer</label>
                <select id="select-trainer" v-model="trainerSelection" name="trainer" class="select">
                  <option value="">Seleziona Trainer</option>
                  <option v-for="trainer in availableGymTrainers" :key="trainer.id" :value="trainer.id">
                    {{ trainer.users.name }} - {{ trainer.specialization || 'Senza specializzazione' }}
                  </option>
                </select>
              </div>
              <div v-if="availableGymTrainers.length === 0" class="empty-state">
                <p>Nessun trainer disponibile al momento</p>
              </div>
              <div class="form-actions">
                <button @click="assignTrainerToClient" class="btn" :disabled="!trainerSelection">Assegna</button>
                <button @click="selectedClientModal = null" class="btn btn-cancel">Annulla</button>
              </div>
            </div>
          </div>
        </section>

        <section v-if="activeTab === 'subscriptions'" class="section">
          <h2>Abbonamenti</h2>
          <form @submit.prevent="createSubscription" class="form">
            <div class="form-group">
              <label for="sub-name">Nome abbonamento</label>
              <input id="sub-name" v-model="subForm.name" name="sub-name" type="text" required />
            </div>
            <div class="form-group">
              <label for="sub-price">Prezzo (EUR)</label>
              <input id="sub-price" v-model.number="subForm.price" name="sub-price" type="number" step="0.01" min="0.01" required />
            </div>
            <div class="form-group">
              <label for="sub-duration">Durata (mesi)</label>
              <input id="sub-duration" v-model.number="subForm.duration_months" name="sub-duration" type="number" min="1" required />
            </div>
            <button type="submit" class="btn">Crea Abbonamento</button>
          </form>
          <div class="list">
            <div v-for="sub in subscriptions" :key="sub.id" class="item">
              <p><strong>{{ sub.name }}</strong></p>
              <p>Prezzo: €{{ sub.price }}</p>
              <p>Durata: {{ sub.duration_months }} mesi</p>
              <button @click="removeSubscription(sub.id)" class="btn btn-action btn-danger">
                Rimuovi
              </button>
            </div>
          </div>
          <div v-if="subscriptions.length === 0" class="empty-state">
            <p>Nessun abbonamento creato</p>
          </div>
        </section>

        <section v-if="activeTab === 'products'" class="section">
          <h2>Prodotti Negozio</h2>
          <form @submit.prevent="createProduct" class="form">
            <div class="form-group">
              <label for="product-name">Nome prodotto</label>
              <input id="product-name" v-model="productForm.name" name="product-name" type="text" required />
            </div>
            <div class="form-group">
              <label for="product-desc">Descrizione</label>
              <textarea id="product-desc" v-model="productForm.description" name="product-description" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label for="product-price">Prezzo (EUR)</label>
              <input id="product-price" v-model.number="productForm.price" name="product-price" type="number" step="0.01" min="0.01" required />
            </div>
            <div class="form-group">
              <label for="product-category">Categoria</label>
              <select id="product-category" v-model="productForm.category" name="product-category" required>
                <option value="">Seleziona categoria</option>
                <option value="integratori">Integratori</option>
                <option value="attrezzatura">Attrezzatura</option>
                <option value="abbigliamento">Abbigliamento</option>
                <option value="altro">Altro</option>
              </select>
            </div>
            <button type="submit" class="btn">Crea Prodotto</button>
          </form>
          <div class="list">
            <div v-for="product in products" :key="product.id" class="item">
              <div class="item-header">
                <div>
                  <p class="product-name">{{ product.name }}</p>
                  <p v-if="product.description" class="product-desc">{{ product.description }}</p>
                </div>
              </div>
              <p class="product-meta">
                <strong>Prezzo:</strong> €{{ product.price }} | <strong>Categoria:</strong> {{ product.category }}
              </p>
              <p class="product-actions-mt">
                <button @click="deleteProduct(product.id)" class="btn btn-action btn-danger">Elimina</button>
              </p>
            </div>
          </div>
          <div v-if="products.length === 0" class="empty-state">
            <p>Nessun prodotto creato</p>
          </div>
        </section>
      </section>

      <div v-else class="empty-state">
        <p>Seleziona una palestra per gestirne i dati</p>
      </div>
    </main>

    <div v-if="showDeleteProductModal" class="modal-overlay" @click="cancelDeleteProduct">
      <div class="modal" @click.stop>
        <h3>Conferma Eliminazione</h3>
        <p>Sei sicuro di voler eliminare questo prodotto?</p>
        <div class="modal-footer">
          <button @click="cancelDeleteProduct" class="btn btn-cancel">Annulla</button>
          <button @click="confirmDeleteProduct" class="btn btn-danger">Elimina</button>
        </div>
      </div>
    </div>

    <div v-if="showConfirmModal" class="modal-overlay" @click="cancelConfirm">
      <div class="modal" @click.stop>
        <h3>Conferma Azione</h3>
        <p>{{ confirmMessage }}</p>
        <div class="modal-footer">
          <button @click="cancelConfirm" class="btn btn-cancel">Annulla</button>
          <button @click="confirmAction" class="btn btn-danger">Conferma</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="./styles.scss"></style>
