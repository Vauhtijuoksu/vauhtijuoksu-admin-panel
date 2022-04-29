<script setup>
import { watch, ref, toRefs } from 'vue'
import axios from 'axios'

const props = defineProps({
  games: Object,
  url: String,
  legacyurl: String,
  streamMetaData: Object
})

const { games, url, legacyurl, streamMetaData } = toRefs(props);

let game = ref("Loading...");
watch(streamMetaData, () => {
  if (games.value.length){
    game.value = games.value.find(x => x.id === streamMetaData.value.current_game_id)
  }
})

const setCurrentGameTwitch = () => {
  axios.get(`${legacyurl.value}/api/update_twitch_game`, {
              auth: {
                username: localStorage.getItem('username'),
                password: localStorage.getItem('password')
              }
    }).catch((err) => {
      console.log(err);
    })
}

const setCurrentGame = (direction) => {

  const gameIndex = games.value.findIndex(x => x === game.value)
  game.value = games.value[gameIndex + direction]
  
  axios.patch(`${url.value}/stream-metadata`, {current_game_id: game.value.id}, {
              auth: {
                username: localStorage.getItem('username'),
                password: localStorage.getItem('password')
              }
            })
    .then(() => {
      if (games.value.length){
        setCurrentGameTwitch();
      }
    }).catch((err) => {
      console.log(err);
    })
}
</script>

<template>
<div>
  {{ game.game }}
</div>
<button @click="setCurrentGame(-1)" type="submit" class="btn btn-primary">Edellinen</button>
<button @click="setCurrentGame(1)" type="submit" class="btn btn-primary">Seuraava</button>
</template>

<style scoped>
</style>
