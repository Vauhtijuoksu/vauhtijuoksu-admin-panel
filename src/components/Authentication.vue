<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const username = ref(localStorage.getItem('username'));
const password = ref(localStorage.getItem('password'));
const twitchAccesssToken = ref(localStorage.getItem('twitch_access_token'))

const twitchClientId = 'fpp1oz1ndhiob1wzfr4f7dh6r7s9oe'
const twitchRedirectUri = 'https://admin-panel.vauhtijuoksu.fi'
const twitchScope = encodeURIComponent('channel:manage:broadcast channel:read:editors')
const twitchUrl = `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=${twitchClientId}&redirect_uri=${twitchRedirectUri}&scope=${twitchScope}`

const onSubmit = () => {
  if (username.value && password.value) {
    localStorage.setItem('username', username.value);
    localStorage.setItem('password', password.value);
    document.getElementById("login").classList.remove("no-login")
    document.getElementById("auth").style.display = "none";
    document.getElementById("login").style.display = "block";
    location.reload();
  }

};
const onLoginClick = () => {
  document.getElementById("auth").style.display = "block";
  document.getElementById("login").style.display = "none";

};

onMounted(()=> {
  document.getElementById("auth").style.display = "none";
  if (username.value) {
    document.getElementById("login").classList.remove("no-login")
  }
})

if (document.location.hash.split('&')[0].split('=')[0] === '#access_token'){
  const twitch_access_token = document.location.hash.split('&')[0].split('=')[1]
  localStorage.setItem('twitch_client_id', twitchClientId)
  localStorage.setItem('twitch_access_token', twitch_access_token)
  window.history.replaceState({}, document.title, "/")
  location.reload();
}

</script>

<template>
  <div id="twitch">
    <div v-if="!twitchAccesssToken">
      <a :href=twitchUrl>Connect with Twitch</a>
    </div>
  </div>
  <div id="login" class="no-login">
    <form @submit.prevent="onLoginClick">
      <div class="flex-row">

        <div class="user">Käyttäjä: {{ username }}</div>
      <button type="submit" class="btn btn-primary">Kirjaudu sisään</button>
      </div>
    </form>
  </div>
  <div id="auth" class="auth">
    <form @submit.prevent="onSubmit">
      <div class="flex-row">
        <label class="form-label">Username</label>
        <input v-model="username" type="text" class="form-control">
        <label class="form-label">Password</label>
        <input v-model="password" type="password" class="form-control">

        <button type="submit" class="btn btn-primary">Kirjaudu</button>
      </div>
    </form>
  </div>
</template>


<style scoped>
</style>
