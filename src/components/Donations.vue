<script setup>
import {ref, toRefs, watch} from 'vue'
import axios from 'axios'

const props = defineProps({
  url: String,
  donations: Object
})

const { url, donations } = toRefs(props);

const markDonationRead = (id) => {
  axios.patch(`${url.value}/donations/${id}`, {read: true}, {
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

const censorName = (id, name) => {
  let conf = confirm('Haluatko sensuroida käyttäjänimen ' + name + '?');
  if (conf){
    axios.patch(`${url.value}/donations/${id}`, {name: 'höpö'}, {
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
}

</script>

<template>
  <table class="table">
    <thead>
      <tr>
        <th scope="col">ID</th>
        <th scope="col">read</th>
        <th scope="col">timestamp</th>
        <th scope="col"></th>
        <th scope="col">name</th>
        <th scope="col">message</th>
        <th scope="col">amount</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="donation in donations" :key="donation.id">
        <td><span :title='donation.id'>🆔</span><span :title=' donation.external_id '>🐼</span></td>
        <td><button @click="markDonationRead(donation.id)" type="submit" class="btn btn-primary">Mark</button></td>
        <td>{{ donation.timestamp }}<br>
        glukoosi ^ -> d.m hh:mm</td>
        <td><span @click="censorName(donation.id, donation.name)" title="sensuroi">🔞</span></td>
        <td>{{ donation.name }}</td>
        <td>{{ donation.message }}</td>
        <td>{{ donation.amount }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
</style>
