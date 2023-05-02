<script setup>

import { ref } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'

const url = 'https://api.dev.vauhtijuoksu.fi';

const donation = ref({})

const route = useRoute()
const router = useRouter()

const getDonation = (id) => {
  axios.get(`${url}/donations/${id}`)
      .then((response) => {
        donation.value = response.data;
      }).catch((err) => {
    console.log(err);
  });
}

const patchDonation = async (id, donation) => {
  return axios.patch(`${url}/donations/${id}`, { name: donation.name, message: donation.message }, {
    auth: {
      username: localStorage.getItem('username'),
      password: localStorage.getItem('password')
    }
  }).catch((err) => {
    console.log(err);
    alert("Something went wrong, refresh page and see damages")
  });
}

const saveChanges = async () => {
  const conf = confirm('Do you want to save these changes?');
  if (conf){
    await patchDonation(route.params.id, donation.value)
    router.push('/')
  }
}


getDonation(route.params.id);
</script>

<template>
    <form>
      <div class="mb-3">
          <label for="name" class="form-label">Name</label>
          <input type="text" class="form-control" id="name" name="name" v-model='donation.name'>
      </div>
      <div class="mb-3">
          <label for="message" class="form-label">Message</label>
          <textarea class="form-control" id="message" name="message" v-model='donation.message' rows="3"></textarea>
      </div>
      <button @click.prevent="saveChanges()" class="btn btn-primary">Submit</button>
      <button @click="router.push('/')" class="btn btn-primary">Discard</button>
    </form>
</template>

<style>
</style>
