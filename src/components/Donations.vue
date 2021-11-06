<script setup>
import { ref } from 'vue'
import axios from 'axios'

const url = 'https://api.dev.vauhtijuoksu.fi/donations';
const donations = ref([]);

const getDonations = () => {
  axios.get(url)
    .then((response) => {
      donations.value = response.data;
    }).catch((err) => {
      console.log(err);
    });
    setTimeout(getDonations, 3000);
}

const markDonationRead = (id) => {
  axios.patch(`${url}/01a141a8-263a-4ff7-80e8-faaec4d385f5`, {read: true}, {
              auth: {
                username: localStorage.getItem('username'),
                password: localStorage.getItem('password')
              }
            })
    .then((response) => {
      console.log(response)
    }).catch((err) => {
      console.log(err);
    });
}

getDonations();
</script>

<template>
<button @click="markDonationRead" type="submit" class="btn btn-primary">Mark donation read</button>

<ul id="array-rendering">
  <table class="table">
    <thead>
      <tr>
        <th scope="col">id</th>
        <th scope="col">timestamp</th>
        <th scope="col">name</th>
        <th scope="col">message</th>
        <th scope="col">amount</th>
        <th scope="col">read</th>
        <th scope="col">external_id</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="donation in donations" :key="donation.id">
        <td>{{ donation.id }}</td>
        <td>{{ donation.timestamp }}</td>
        <td>{{ donation.name }}</td>
        <td>{{ donation.message }}</td>
        <td>{{ donation.amount }}</td>
        <td>{{ donation.read }}</td>
        <td>{{ donation.external_id }}</td>
      </tr>
    </tbody>
  </table>
</ul>
</template>

<style scoped>
</style>
