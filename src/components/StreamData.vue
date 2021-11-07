<script setup>
import { ref } from 'vue'
import axios from 'axios'

const url = 'https://legacy.vauhtijuoksu.fi';
const streamMetadata = ref({});
const info = ref('')

const getStreamMetadata = () => {
  axios.get(`${url}/api/stream_metadata`)
    .then((response) => {
      streamMetadata.value = response.data;
    }).catch((err) => {
      console.log(err);
    });
    setTimeout(getStreamMetadata, 3000);
}

const postStreamInfo = () => {
  axios.post(`${url}/api/info`, {info: info.value}, {
              auth: {
                username: localStorage.getItem('username'),
                password: localStorage.getItem('password')
              }
            })
    .then((response) => {
      streamMetadata.value.info = info;
    }).catch((err) => {
      console.log(err);
    })
}

getStreamMetadata();
</script>

<template>
{{ streamMetadata }}
<form @submit.prevent="postStreamInfo">StreamData.vue
  <div class="mb-3">
    <label class="form-label">Stream Info</label>
    <textarea v-model="info"  class="form-control"  rows="3"></textarea>
  </div>
  <button type="submit" class="btn btn-primary">Submit</button>
</form>
</template>

<style scoped>
</style>
