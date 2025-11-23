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
  ilmoita pelaajalle että lahjoituksia on luettavana
  <button @click="set_donations_flag" type="submit" class="btn btn-primary">ilmoita</button>
</template>

<style scoped>
</style>
