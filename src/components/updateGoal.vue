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
<form @submit.prevent="postStreamInfo" class="goal-form">
  <input type="number" v-model="goal" class="form-control" placeholder="Tavoite €">
  <button type="submit" class="btn btn-primary btn-compact">💾 Tallenna</button>
</form>
</template>

<style scoped>
.goal-form {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
}

.form-control {
  width: 120px;
  padding: 6px 10px;
  font-size: 14px;
}

.btn-compact {
  padding: 6px 16px;
  font-size: 14px;
  white-space: nowrap;
}
</style>
