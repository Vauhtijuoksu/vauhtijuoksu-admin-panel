<script setup>
import {ref, toRefs, watch} from 'vue'
import axios from 'axios'

const props = defineProps({
  url: String,
  streamMetaData: Object
})

const { url, streamMetaData } = toRefs(props);
const goal = ref(0)

let og_text = false
watch(streamMetaData, () => {
  if (!og_text){
    goal.value = streamMetaData.value.donation_goal
    og_text = true
  }
})

const postStreamInfo = () => {
  axios.patch(`${url.value}/stream-metadata`, {donation_goal: goal.value}, {
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
    <input type="number" v-model="goal" class="form-control">
  </div>
  <button type="submit" class="btn btn-primary">Päivitä tavoite</button>
</form>
</template>

<style scoped>
</style>
