<script setup>
import { watch, ref, toRefs } from 'vue'
import axios from 'axios'

const props = defineProps({
  games: Object,
  url: String,
  streamMetaData: Object
})

const { games, url, streamMetaData } = toRefs(props);

let game = ref("Loading...");
watch(streamMetaData, () => {
  if (games.value.length){
    game.value = games.value[streamMetaData.value.game].game
  }
})

const setCurrentGameTwitch = () => {
  axios.get(`${url.value}/api/update_twitch_game`, {
              auth: {
                username: localStorage.getItem('username'),
                password: localStorage.getItem('password')
              }
    }).catch((err) => {
      console.log(err);
    })
}

const setCurrentGame = (direction) => {
  axios.post(`${url.value}/api/game`, {game: streamMetaData.value.game + direction}, {
              auth: {
                username: localStorage.getItem('username'),
                password: localStorage.getItem('password')
              }
            })
    .then(() => {
      if (games.value.length){
        streamMetaData.value.game += direction
        game.value = games.value[streamMetaData.value.game].game;
        setCurrentGameTwitch();
      }
    }).catch((err) => {
      console.log(err);
    })
}
</script>

<template>
<div>
  {{ game }}
</div>
<button @click="setCurrentGame(-1)" type="submit" class="btn btn-primary">Edellinen</button>
<button @click="setCurrentGame(1)" type="submit" class="btn btn-primary">Seuraava</button>
</template>

<style scoped>
</style>
