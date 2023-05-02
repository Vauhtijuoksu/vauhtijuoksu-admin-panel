<script setup>
import {ref, toRefs, watch} from 'vue'
import axios from 'axios'

const props = defineProps({
  url: String,
  streamMetaData: Object,
  player: Intl
})

const { url, streamMetaData, player } = toRefs(props);


let death = ref("-");

watch(streamMetaData, () => {
  death.value = streamMetaData.value.counters[player.value - 1];
  const id = `death${player.value}`;

  if (parseInt(death.value) < 0){
    death.value="OFF"
    document.getElementById(id).classList.add("death-off")
  } else {
    document.getElementById(id).classList.remove("death-off")
  }
})

const setCurrentDeaths = (direction) => {

  streamMetaData.value.counters[player.value - 1] = streamMetaData.value.counters[player.value - 1] + direction

  axios.patch(`${url.value}/stream-metadata`, { counters: streamMetaData.value.counters }, {
    auth: {
      username: localStorage.getItem('username'),
      password: localStorage.getItem('password')
    }
  })
    .then((response) => {
      if (death.value === "OFF") {
        death.value = 0;
        document.getElementById(player.value - 1).classList.remove("death-off");
      } else {
        death.value = streamMetaData.value.counters[player.value - 1];
      }
    }).catch((err) => {
      console.log(err);
    })
}
</script>

<template>
  <div class="deaths" :id="'death'+player">
  <div>
    P{{ player }} 💀
  </div>
  <div>
  <button @click="setCurrentDeaths(-1)" type="submit" class="btn btn-primary minus">-</button>
  <div class="deathcount">{{ death }}</div>
  <button @click="setCurrentDeaths(1)" type="submit" class="btn btn-primary">+</button>
  </div>
  </div>
</template>

<style scoped>
</style>
