<script setup>
import {ref, toRefs, watch} from 'vue'
import axios from 'axios'

const props = defineProps({
  url: String
})

const { url } = toRefs(props);



const resetDeaths = (direction) => {

  axios.post(`${url.value}/api/death_reset`, {}, {
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
