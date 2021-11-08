<script setup>
import {ref, toRefs, watch} from 'vue'
import axios from 'axios'

const props = defineProps({
  url: String
})

const { url } = toRefs(props);



const set_donations_flag = (direction) => {

  axios.get(`${url.value}/api/set_donations_flag`, {
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
  ilmoita pelaajalle että lahjoituksia on luettavana
  <button @click="set_donations_flag" type="submit" class="btn btn-primary">ilmoita</button>
</template>

<style scoped>
</style>
