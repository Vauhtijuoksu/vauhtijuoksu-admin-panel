<script setup>
import { ref, toRefs } from 'vue'
import axios from 'axios'

const props = defineProps({
  url: String,
  streamMetaData: Object
})

const { url, streamMetaData } = toRefs(props);
const info = ref('')

const postStreamInfo = () => {
  axios.post(`${url}/api/info`, {info: info.value}, {
              auth: {
                username: localStorage.getItem('username'),
                password: localStorage.getItem('password')
              }
            })
    .then((response) => {
      console.log(response);
    }).catch((err) => {
      console.log(err);
    })
}
</script>

<template>
{{ streamMetaData }}
<form @submit.prevent="postStreamInfo">
  <div class="mb-3">
    <label class="form-label">Stream Info</label>
    <textarea v-model="info" class="form-control" rows="3"></textarea>
  </div>
  <button type="submit" class="btn btn-primary">Submit</button>
</form>
</template>

<style scoped>
</style>
