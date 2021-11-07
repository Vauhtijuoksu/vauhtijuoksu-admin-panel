<script setup>
import { ref } from 'vue'
import axios from 'axios'

const username = ref(localStorage.getItem('username'));
const password = ref(localStorage.getItem('password'));

const onSubmit = () => {
  localStorage.setItem('username', username.value);
  localStorage.setItem('password', password.value);
}
</script>

<template>
<form @submit.prevent="onSubmit">
  <div class="mb-3">
    <label class="form-label">Username</label>
    <input v-model="username" type="text" class="form-control">
  </div>
  <div class="mb-3">
    <label class="form-label">Password</label>
    <input v-model="password" type="password" class="form-control">
  </div>
  <button type="submit" class="btn btn-primary">Submit</button>
</form>
</template>

<style scoped>
</style>
