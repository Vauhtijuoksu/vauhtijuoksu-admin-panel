<script setup>
import {ref, toRefs, watch} from 'vue'
import api from '@/utils/api'

const props = defineProps({
  url: String,
  streamMetaData: Object
})

const { streamMetaData } = toRefs(props);
const info = ref('Loading...')

let og_text = false
watch(streamMetaData, () => {
  if (!og_text){
    info.value = streamMetaData.value.donatebar_info.join("\n")
    og_text = true
  }
})

const postStreamInfo = async () => {
  const response = await api.patch('/stream-metadata', {donatebar_info: info.value.split(/\r?\n/)});
  if (response) {
    console.log(response);
  }
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
