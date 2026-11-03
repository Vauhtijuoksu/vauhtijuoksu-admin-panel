<script setup>

import { ref } from 'vue'
import api from '@/utils/api'
import { useRoute, useRouter } from 'vue-router'
import { useCharities } from '@/composables/useCharities'

const donation = ref({})
const { charities } = useCharities()

const route = useRoute()
const router = useRouter()

const getDonation = async (id) => {
  const response = await api.get(`/donations/${id}`);
  if (response?.data) {
    donation.value = response.data;
  }
}

const saveChanges = async () => {
  if (confirm('Tallennetaanko muutokset?')) {
    const { name, message, charity } = donation.value
    if (await api.patch(`/donations/${route.params.id}`, { name, message, charity })) {
      router.push('/')
    }
  }
}

getDonation(route.params.id);
</script>

<template>
  <div class="edit-container form-view">
    <div class="form-header header-with-back">
      <button type="button" @click="router.push('/')" class="btn btn-back">← Takaisin</button>
      <h2>Muokkaa lahjoitusta</h2>
      <div></div>
    </div>

    <form class="edit-form" @submit.prevent="saveChanges()">
      <div class="form-section">
        <div class="form-row">
          <div class="form-group">
            <label for="name" class="form-label">Nimi</label>
            <input type="text" class="form-control" id="name" v-model="donation.name">
          </div>
          <div class="form-group" v-if="charities.length">
            <label for="charity" class="form-label">Kohde</label>
            <select class="form-select" id="charity" v-model="donation.charity">
              <option :value="null">Ei kohdetta</option>
              <option v-for="charity in charities" :key="charity.id" :value="charity.id">{{ charity.name }}</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="message" class="form-label">Viesti</label>
            <textarea class="form-control" id="message" v-model="donation.message" rows="3"></textarea>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-success">Tallenna</button>
        <button type="button" @click="router.push('/')" class="btn btn-secondary">Peruuta</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
@import '@/css/edit-styles.css';
</style>
