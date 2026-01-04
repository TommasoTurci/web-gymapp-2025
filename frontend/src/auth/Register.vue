<template>
  <div class="auth-page">
    <div class="auth-container">
      <h1>Registrazione</h1>
      <form @submit.prevent="handleRegister" class="form">
        <div class="form-group">
          <label for="register-name">Nome completo</label>
          <input id="register-name" v-model="form.name" name="name" type="text" placeholder="Inserisci il tuo nome" required />
        </div>
        <div class="form-group">
          <label for="register-email">Email</label>
          <input id="register-email" v-model="form.email" name="email" type="email" placeholder="Inserisci la tua email" autocomplete="email" required />
        </div>
        <div class="form-group">
          <label for="register-password">Password</label>
          <input id="register-password" v-model="form.password" name="password" type="password" placeholder="Inserisci una password" autocomplete="new-password" required />
        </div>
        <div class="form-group">
          <label for="register-role">Ruolo</label>
          <select id="register-role" v-model="form.role" name="role" required>
            <option value="">Seleziona un ruolo</option>
            <option value="owner">Proprietario</option>
            <option value="trainer">Personal Trainer</option>
            <option value="client">Cliente</option>
          </select>
        </div>
        <button type="submit" class="btn">Registrati</button>
        <p class="link-text">Hai già un account? <router-link to="/login">Accedi qui</router-link></p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { useRegisterLogic } from './services.js';

const { form, handleRegister } = useRegisterLogic();
</script>

<style scoped src="./styles.scss"></style>
