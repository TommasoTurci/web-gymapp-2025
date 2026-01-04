<script setup>
import { useClientDashboardLogic } from './services.js';

const {
  activeTab, profile, trainer, myExercises, products, cartOrders, confirmedOrders,
  searchQuery, selectedCategory, showCart, productQuantities, addToCart, confirmOrder, 
  buyProduct, updateOrderQuantity, deleteCartItem, purchaseCart, cartTotal, formatDate, logout
} = useClientDashboardLogic();
</script>

<template>
  <div class="dashboard">
    <header class="navbar">
      <h1>Dashboard Cliente</h1>
      <button @click="logout" class="btn-logout">Logout</button>
    </header>
    <main class="content">

      <nav class="tabs-top">
        <button
          @click="activeTab = 'profile'"
          :class="['tab', { active: activeTab === 'profile' }]"
        >
          Profilo
        </button>
        <button
          @click="activeTab = 'exercises'"
          :class="['tab', { active: activeTab === 'exercises' }]"
        >
          Scheda Esercizi
        </button>
        <button
          @click="activeTab = 'shop'"
          :class="['tab', { active: activeTab === 'shop' }]"
        >
          Negozio
        </button>
        <button
          @click="activeTab = 'orders'"
          :class="['tab', { active: activeTab === 'orders' }]"
        >
          I Miei Ordini
        </button>
      </nav>

      <section v-if="activeTab === 'profile'" class="section">
        <h2>Il Mio Profilo</h2>
        <div v-if="profile" class="profile-info">
          <p><strong>Nome:</strong> {{ profile.users?.name || 'N/A' }}</p>
          <p><strong>Email:</strong> {{ profile.users?.email || 'N/A' }}</p>
          <p><strong>Abbonamento:</strong> {{ profile.subscriptions?.name || 'Nessuno' }}</p>
          <p v-if="profile.subscriptions"><strong>Durata:</strong> {{ profile.subscriptions.duration_months }} mesi</p>
        </div>

        <div v-if="profile" class="section section-mt">
          <h3>Palestra Iscritta</h3>
          <div class="profile-info">
            <p><strong>Palestra:</strong> {{ profile.subscriptions?.gyms?.name || 'N/A' }}</p>
            <p><strong>Indirizzo:</strong> {{ profile.subscriptions?.gyms?.address || 'N/A' }}</p>
            <p><strong>Telefono:</strong> {{ profile.subscriptions?.gyms?.phone || 'N/A' }}</p>
          </div>
        </div>

        <div v-if="profile" class="section section-mt">
          <h3>Personal Trainer Assegnato</h3>
          <div v-if="trainer" class="trainer-info">
            <p><strong>Nome:</strong> {{ trainer.users?.name }}</p>
            <p><strong>Email:</strong> {{ trainer.users?.email }}</p>
            <p><strong>Specializzazione:</strong> {{ trainer.specialization }}</p>
          </div>
          <div v-else class="empty-state">
            <p>Nessun trainer assegnato ancora</p>
          </div>
        </div>
      </section>

      <section v-if="activeTab === 'exercises'" class="section">
        <h2>La Mia Scheda Esercizi</h2>
        <div v-if="myExercises.length > 0" class="list">
          <div v-for="exercise in myExercises" :key="exercise.id" class="exercise-card">
            <h3>{{ exercise.exercises?.name }}</h3>
            <p>{{ exercise.exercises?.description }}</p>
            <p><strong>Serie:</strong> {{ exercise.exercises?.sets }} | <strong>Ripetizioni:</strong> {{ exercise.exercises?.reps }}</p>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>Nessun esercizio assegnato ancora</p>
        </div>
      </section>

      <section v-if="activeTab === 'shop'" class="section">
        <div class="shop-header">
          <h2>Negozio</h2>
          <button @click="showCart = true" class="btn btn-cart" :title="`${cartOrders.length} elementi nel carrello`">
            Carrello <span class="cart-badge" v-if="cartOrders.length > 0">{{ cartOrders.length }}</span>
          </button>
        </div>

        <div class="shop-filters">
          <div class="search-box">
            <label for="search-products" class="sr-only">Cerca prodotti</label>
            <input 
              id="search-products"
              v-model="searchQuery" 
              name="search"
              type="text" 
              placeholder="Cerca prodotti..."
              class="search-input"
              aria-label="Cerca prodotti"
            />
          </div>
          
          <div class="category-filter">
            <label for="select-category" class="sr-only">Categoria</label>
            <select id="select-category" v-model="selectedCategory" name="category" class="category-select">
              <option value="">Tutte le categorie</option>
              <option value="integratori">Integratori</option>
              <option value="attrezzatura">Attrezzatura</option>
              <option value="abbigliamento">Abbigliamento</option>
              <option value="altro">Altro</option>
            </select>
          </div>
        </div>

        <div v-if="products.length > 0" class="shop-grid">
          <div v-for="product in products" :key="product.id" class="product-card">
            <div class="product-header">
              <h3>{{ product.name }}</h3>
              <span class="category-badge">{{ product.category }}</span>
            </div>
            <p v-if="product.description" class="product-description">{{ product.description }}</p>
            <div class="product-footer">
              <p class="product-price">{{ product.price }}€</p>
              <div class="product-actions">
                <label :for="'qty-' + product.id" class="sr-only">Quantità</label>
                <input 
                  :id="'qty-' + product.id"
                  v-model.number="productQuantities[product.id]" 
                  name="quantity"
                  type="number" 
                  min="1" 
                  class="quantity-input"
                />
                <button @click="buyProduct(product.id)" class="btn btn-action">Aggiungi al carrello</button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p v-if="products.length === 0">Nessun prodotto disponibile</p>
          <p v-else>Nessun prodotto corrisponde ai tuoi filtri</p>
        </div>
      </section>

      <section v-if="activeTab === 'orders'" class="section">
        <h2>I Miei Ordini</h2>
        <div v-if="confirmedOrders.length > 0" class="list">
          <div v-for="order in confirmedOrders" :key="order.id" class="order-card">
            <p><strong>{{ order.products?.name || 'Prodotto sconosciuto' }}</strong></p>
            <p class="order-date">{{ formatDate(order.created_at) }}</p>
            <p>Quantità: {{ order.quantity }}</p>
            <p>Totale: {{ order.total_price }}€</p>
            <p>Status: <span :class="['status', order.status]">{{ order.status }}</span></p>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>Nessun ordine ancora</p>
        </div>
      </section>
    </main>

    <div v-if="showCart" class="modal-overlay" @click.self="showCart = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Il Mio Carrello</h2>
          <button @click="showCart = false" class="btn-close">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="cartOrders.length > 0" class="orders-list">
            <div v-for="order in cartOrders" :key="order.id" class="order-item">
              <div class="order-info">
                <p class="order-product"><strong>{{ order.products?.name || 'Prodotto sconosciuto' }}</strong></p>
                <p class="order-date">{{ formatDate(order.created_at) }}</p>
                <div class="order-quantity-control">
                  <label :for="'cart-qty-' + order.id" class="qty-label">Quantità:</label>
                  <div class="quantity-buttons">
                    <button @click="updateOrderQuantity(order.id, order.quantity - 1)" class="qty-btn">−</button>
                    <input 
                      :id="'cart-qty-' + order.id"
                      v-model.number="order.quantity" 
                      name="quantity"
                      type="number" 
                      min="1" 
                      @change="updateOrderQuantity(order.id, order.quantity)"
                      class="qty-input"
                    />
                    <button @click="updateOrderQuantity(order.id, order.quantity + 1)" class="qty-btn">+</button>
                  </div>
                </div>
                <p class="order-price">{{ (order.products?.price * order.quantity).toFixed(2) }}€</p>
              </div>
              <button @click="deleteCartItem(order.id)" class="btn-delete">🗑</button>
            </div>
            <div class="cart-footer">
              <p class="cart-total">Totale: {{ cartTotal }}€</p>
              <button @click="purchaseCart" class="btn btn-primary">Acquista Tutto</button>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>Il carrello è vuoto</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="./styles.scss"></style>
