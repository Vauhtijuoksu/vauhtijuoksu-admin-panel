<script setup>
import { ref } from 'vue'

// The user the page was loaded with. Logging in or out reloads the page
const loggedInAs = localStorage.getItem('username');
const username = ref(loggedInAs ?? '');
const password = ref('');
const twitchConnected = !!localStorage.getItem('twitch_access_token');

const twitchClientId = 'fpp1oz1ndhiob1wzfr4f7dh6r7s9oe'
const twitchRedirectUri = window.location.origin
const twitchScope = encodeURIComponent('channel:manage:broadcast channel:read:editors')
const twitchUrl = `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=${twitchClientId}&redirect_uri=${twitchRedirectUri}&scope=${twitchScope}`

const login = () => {
  if (username.value && password.value) {
    localStorage.setItem('username', username.value);
    localStorage.setItem('password', password.value);
    location.reload();
  }
};

const logout = () => {
  localStorage.removeItem('username');
  localStorage.removeItem('password');
  location.reload();
};

if (document.location.hash.split('&')[0].split('=')[0] === '#access_token'){
  const twitch_access_token = document.location.hash.split('&')[0].split('=')[1]
  localStorage.setItem('twitch_client_id', twitchClientId)
  localStorage.setItem('twitch_access_token', twitch_access_token)
  window.history.replaceState({}, document.title, "/")
  location.reload();
}
</script>

<template>
  <button type="button" popovertarget="login-popup" class="btn user-button"
          :class="loggedInAs ? 'btn-secondary' : 'btn-danger'" :title="loggedInAs">
    {{ loggedInAs ? '👤 ' + loggedInAs : 'Kirjaudu sisään' }}
  </button>
  <!-- A native popover: closes on Esc and on a click outside it -->
  <div id="login-popup" popover class="login-popup">
    <form @submit.prevent="login">
      <label class="form-label" for="login-username">Käyttäjä</label>
      <input id="login-username" v-model="username" class="form-control" autocomplete="username">
      <label class="form-label" for="login-password">Salasana</label>
      <input id="login-password" v-model="password" type="password" class="form-control" autocomplete="current-password">
      <button type="submit" class="btn btn-primary">{{ loggedInAs ? 'Vaihda käyttäjä' : 'Kirjaudu' }}</button>
    </form>
    <button v-if="loggedInAs" type="button" class="btn btn-secondary" @click="logout">Kirjaudu ulos</button>
    <a v-if="!twitchConnected" :href="twitchUrl">Yhdistä Twitchiin</a>
  </div>
</template>

<style scoped>
.user-button {
  flex-shrink: 0;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.login-popup {
  /* Below the top bar's right end, instead of the middle of the screen */
  position: fixed;
  inset: 64px 16px auto auto;
  margin: 0;
  width: 260px;
  padding: 16px;
  border: 1px solid #2a3a5a;
  border-radius: 8px;
  background: #081536;
  color: #e0e0e0;
  font-size: 16px;
}

.login-popup form {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.login-popup .btn, .login-popup a {
  display: block;
  width: 100%;
  margin: 8px 0 0;
}
</style>
