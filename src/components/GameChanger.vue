<script setup>
import { watch, ref, toRefs } from 'vue'
import axios from 'axios'
import TwitchJs from 'twitch-js'

const clientId = localStorage.getItem('twitch_client_id')
const token = localStorage.getItem('twitch_access_token')

if (clientId && token){
  const { api } = new TwitchJs({ token, clientId })
}

const props = defineProps({
  games: Object,
  url: String,
  legacyurl: String,
  streamMetaData: Object
})

const { games, url, streamMetaData } = toRefs(props);

let game = ref("Loading...");
watch(streamMetaData, () => {
  if (games.value.length){
    game.value = games.value.find(x => x.id === streamMetaData.value.current_game_id)
  }
})

const setCurrentGameTwitch = async (gameName) => {
  try {
    const userData = await api.get('users')
    const userId = userData.data[0].id
    const gameData = await api.get('games', {'search': {'name': gameName}})
    let gameId = '509658'
    if(gameData.data.length){
      gameId = gameData.data[0].id
    }
    console.log(gameId)
    const response = await axios.patch(`https://api.twitch.tv/helix/channels?broadcaster_id=${userId}`, {game_id: gameId}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('twitch_access_token')}`,
          'Client-Id': localStorage.getItem('twitch_client_id')
        }
      })
  } catch (error) {
    console.log(error)
    if (error.response.status === '401') {
      localStorage.removeItem('twitch_client_id')
      localStorage.removeItem('twitch_access_token')
      location.reload();
    }

  }
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
        if (clientId && token){
          setCurrentGameTwitch(game.value.game);
        }
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
