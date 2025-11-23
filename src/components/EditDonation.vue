<script setup>

import { ref } from 'vue'
import api from '@/utils/api'
import { useRoute, useRouter } from 'vue-router'

const donation = ref({})

const route = useRoute()
const router = useRouter()

const getDonation = async (id) => {
  const response = await api.get(`/donations/${id}`);
  if (response?.data) {
    donation.value = response.data;
  }
}

const patchDonation = async (id, donation) => {
  return api.patch(`/donations/${id}`, { name: donation.name, message: donation.message });
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
