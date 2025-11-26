<script setup>
import api from '@/utils/api'

const set_donations_flag = async () => {
  const timestamp = new Date();
  const response = await api.patch('/player-info', {message: timestamp.toISOString() + " Lahjoituksia luettavana!"});
  if (response) {
    console.log(response);
  }
}
</script>

<template>
  <button @click="set_donations_flag" type="submit" class="btn btn-warning btn-compact">
    📢 Ilmoita lahjoituksista pelaajalle
  </button>
</template>

<style scoped>
.btn-compact {
  padding: 6px 16px;
  font-size: 14px;
  white-space: nowrap;
  font-weight: 600;
}
</style>
