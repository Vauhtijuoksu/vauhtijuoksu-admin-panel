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
<form @submit.prevent="postStreamInfo" class="stream-form">
  <textarea v-model="info" class="form-control" rows="2" placeholder="Stream-infoteksti..."></textarea>
  <button type="submit" class="btn btn-primary btn-compact">💾 Tallenna</button>
</form>
</template>

<style scoped>
.stream-form {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
}

.form-control {
  width: 300px;
  resize: vertical;
  padding: 6px 10px;
  font-size: 14px;
}

.btn-compact {
  padding: 6px 16px;
  font-size: 14px;
  white-space: nowrap;
  align-self: stretch;
}
</style>
