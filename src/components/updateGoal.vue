<script setup>
import {ref, toRefs, watch} from 'vue'
import api from '@/utils/api'

const props = defineProps({
  url: String,
  streamMetaData: Object
})

const { streamMetaData } = toRefs(props);
const goal = ref(0)

let og_text = false
watch(streamMetaData, () => {
  if (!og_text){
    goal.value = streamMetaData.value.donation_goal
    og_text = true
  }
})

const postStreamInfo = async () => {
  const response = await api.patch('/stream-metadata', {donation_goal: goal.value});
  if (response) {
    console.log(response);
  }
}
</script>

<template>
<form @submit.prevent="postStreamInfo">
  <div class="mb-3">
    <input type="number" v-model="goal" class="form-control">
  </div>
  <button type="submit" class="btn btn-primary">Päivitä tavoite</button>
</form>
</template>

<style scoped>
</style>
