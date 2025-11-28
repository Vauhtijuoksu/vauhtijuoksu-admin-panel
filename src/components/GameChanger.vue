<script setup>
import { watch, ref, toRefs } from 'vue'
import axios from 'axios'
import TwitchJs from 'twitch-js'
import api from '@/utils/api'

const clientId = localStorage.getItem('twitch_client_id')
const token = localStorage.getItem('twitch_access_token')

let twitchApi;

if (clientId && token){
  twitchApi = new TwitchJs({ token, clientId }).api
}

const props = defineProps({
  games: Object,
  url: String,
  legacyurl: String,
  streamMetaData: Object
})

const { games, streamMetaData } = toRefs(props);

let game = ref("Loading...");
let previousGameId = ref(null);

watch(streamMetaData, () => {
  if (games.value.length){
    const newGame = games.value.find(x => x.id === streamMetaData.value.current_game_id);
    
    // Auto-trigger Twitch API call when game changes (not initial load)
    if (newGame && previousGameId.value !== null && 
        previousGameId.value !== newGame.id && 
        clientId && token && newGame.meta) {
      setCurrentGameTwitch(newGame.meta);
    }
    
    previousGameId.value = newGame?.id;
    game.value = newGame;
  }
})

const setCurrentGameTwitch = async (gameTwitchId) => {
  try {
    if (localStorage.getItem('twitch_user') === null) {
      const userData = await twitchApi.get('users')
      localStorage.setItem('twitch_user', userData.data[0].id)
    }
    const gameId = gameTwitchId;
    const response = await axios.patch(`https://api.twitch.tv/helix/channels?broadcaster_id=${localStorage.getItem('twitch_user')}`, { game_id: gameId }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('twitch_access_token')}`,
        'Client-Id': localStorage.getItem('twitch_client_id')
      }
    })
  } catch (error) {
    console.log(error)
    if (error.response.status === 401) {
      alert("Twitch authentication did not work, please re-auth at top right 'Connect with Twitch' link")
      localStorage.removeItem('twitch_client_id')
      localStorage.removeItem('twitch_access_token')
      localStorage.removeItem('twitch_user')
      location.reload();
    }

  }
}

const setCurrentGame = async (direction) => {

  const gameIndex = games.value.findIndex(x => x === game.value)
  game.value = games.value[gameIndex + direction]
  
  const response = await api.patch('/stream-metadata', {current_game_id: game.value.id});
  
  if (response && games.value.length && clientId && token) {
    setCurrentGameTwitch(game.value.meta);
  }
}
</script>

<template>
  <div class="flex-column">
    <div style="width: 15vw; height: 2.2em; line-height: 1.1" class="flex-column flex-center">
      {{ game.game }}
    </div>
    <div class="flex-row space-around">
      <button @click="setCurrentGame(-1)" type="submit" class="btn btn-primary">Edellinen</button>
      <button @click="setCurrentGame(1)" type="submit" class="btn btn-primary">Seuraava</button>
    </div>
  </div>
</template>

<style scoped>
</style>
