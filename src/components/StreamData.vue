<script setup>
import { ref, toRefs } from 'vue'
import api from '@/utils/api'

const props = defineProps({
  url: String,
  streamMetaData: Object
})

const { streamMetaData } = toRefs(props);
const info = ref('')

const postStreamInfo = async () => {
  const response = await api.post('/api/info', {info: info.value});
  if (response) {
    console.log(response);
  }
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
