<script setup>
import {ref, toRefs, watch} from 'vue'
import axios from 'axios'

const props = defineProps({
  url: String
})

const { url, streamMetaData } = toRefs(props);



const resetDeaths = (direction) => {

  axios.patch(`${url.value}/stream-metadata`, {counters: [-1, -1, -1, -1]}, {
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

  <button @click="resetDeaths" type="submit" class="btn btn-primary">Nollaa kuolemalaskurit</button>
</template>

<style scoped>
</style>
