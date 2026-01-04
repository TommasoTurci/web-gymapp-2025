<template>
  <div class="auth-page">
    <div class="auth-container">
      <h1>Login</h1>
      <form @submit.prevent="handleLogin" class="form">
        <div class="form-group">
          <label for="login-email">Email</label>
          <input id="login-email" v-model="form.email" name="email" type="email" placeholder="Inserisci la tua email" autocomplete="email" required />
        </div>
        <div class="form-group">
          <label for="login-password">Password</label>
          <input id="login-password" v-model="form.password" name="password" type="password" placeholder="Inserisci la tua password" autocomplete="current-password" required />
        </div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <button type="submit" class="btn">Accedi</button>
        <p class="link-text">Non hai un account? <router-link to="/register">Registrati qui</router-link></p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { useLoginLogic } from './services.js';

const { form, error, handleLogin } = useLoginLogic();
</script>

<style scoped src="./styles.scss"></style>
