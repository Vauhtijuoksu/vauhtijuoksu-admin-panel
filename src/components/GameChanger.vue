<script setup>
import { ref, toRefs } from 'vue'
import axios from 'axios'

const props = defineProps({
  url: String,
  streamMetaData: Object
})

const { url, streamMetaData } = toRefs(props);


const setCurrentGame = (direction) => {
  console.log({game: streamMetaData.value.game + direction})
  axios.post(`${url.value}/api/game`, {game: streamMetaData.value.game + direction}, {
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
<button @click="setCurrentGame(-1)" type="submit" class="btn btn-primary">Edellinen</button>
<button @click="setCurrentGame(1)" type="submit" class="btn btn-primary">Seuraava</button>
</template>

<style scoped>
</style>
