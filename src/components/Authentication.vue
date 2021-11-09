<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const username = ref(localStorage.getItem('username'));
const password = ref(localStorage.getItem('password'));


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
</script>

<template>
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
