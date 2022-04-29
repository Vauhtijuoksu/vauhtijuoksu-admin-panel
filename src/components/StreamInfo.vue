<script setup>
import {ref, toRefs, watch} from 'vue'
import axios from 'axios'

const props = defineProps({
  url: String,
  streamMetaData: Object
})

const { url, streamMetaData } = toRefs(props);
const info = ref('Loading...')

let og_text = false
watch(streamMetaData, () => {
  if (!og_text){
    info.value = streamMetaData.value.donatebar_info.join("\n")
    og_text = true
  }
})

const postStreamInfo = () => {
  axios.patch(`${url.value}/stream-metadata`, {donatebar_info: info.value}, {
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
<form @submit.prevent="postStreamInfo">
  <div class="mb-3">
    <textarea v-model="info" class="form-control" rows="3"></textarea>
  </div>
  <button type="submit" class="btn btn-primary">Päivitä stream-info</button>
</form>
</template>

<style scoped>
</style>
