<script setup>
import { ref } from 'vue'
import axios from 'axios'

const url = 'https://api.dev.vauhtijuoksu.fi/donations';
const sum_txt = ref("");

const getDonations = () => {
  axios.get(url)
    .then((response) => {
      let donations = response.data;
      let sum = 0
      for (let donation of donations){
        sum += donation.amount
      }
      sum_txt.value = sum.toString()
    }).catch((err) => {
      console.log(err);
    });
    setTimeout(getDonations, 3000);
}


getDonations();
</script>

<template>
  <div>
  Kerätty: {{ sum_txt }} €
  </div>
</template>

<style scoped>
</style>
