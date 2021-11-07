<script setup>

import { ref } from 'vue'
import axios from 'axios'

import Donations from './components/Donations.vue'
import StreamData from './components/StreamData.vue'
import Authentication from './components/Authentication.vue'
import Sum from './components/Sum.vue'

const url = 'https://api.dev.vauhtijuoksu.fi';
const urlLegacy = 'https://legacy.vauhtijuoksu.fi';

const donations = ref([]);
const streamMetaData = ref({});

const getStreamMetaData = () => {
  axios.get(`${urlLegacy}/api/stream_metadata`)
    .then((response) => {
      streamMetaData.value = response.data;
    }).catch((err) => {
      console.log(err);
    });
    setTimeout(getStreamMetaData, 3000);
}

const getDonations = () => {
  axios.get(`${url}/donations`)
    .then((response) => {
      donations.value = response.data;
    }).catch((err) => {
      console.log(err);
    });
    setTimeout(getDonations, 3000);
}

getStreamMetaData();
getDonations();
</script>

<template>
  <div class="statusbar">
    <Sum :donations="donations" />
  </div>
  <Authentication />
  <StreamData :url="urlLegacy" :streamMetaData="streamMetaData" />
  <Donations :url="url" :donations="donations" />
</template>

<style>
</style>
