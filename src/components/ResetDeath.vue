<script setup>
import api from '@/utils/api'

const resetDeaths = async () => {
  const response = await api.patch('/stream-metadata', {counters: [-1, -1, -1, -1, -1, -1, -1, -1]});
  if (response) {
    console.log(response);
  }
}
</script>

<template>
  <button @click="resetDeaths" type="submit" class="btn btn-primary btn-compact">
    🔄 Nollaa kuolemalaskurit
  </button>
</template>

<style scoped>
.btn-compact {
  padding: 6px 16px;
  font-size: 14px;
  white-space: nowrap;
}
</style>
