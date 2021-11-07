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
  let id
  switch (player.value){
    case 1:
      death.value = streamMetaData.value.death1;
      id = "death1";
      break
    case 2:
      death.value = streamMetaData.value.death2;
      id = "death2";
      break
    case 3:
      death.value = streamMetaData.value.death3;
      id = "death3";
      break
    case 4:
      death.value = streamMetaData.value.death4;
      id = "death4"
      break
  }
  if (parseInt(death.value) < 0){
    death.value="OFF"
    document.getElementById(id).classList.add("death-off")
  } else {
    document.getElementById(id).classList.remove("death-off")
  }
})

const setCurrentDeaths = (direction) => {

  axios.post(`${url.value}/api/death`, {player: player.value -1, death_add: direction}, {
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
  <div class="deaths" :id="'death'+player">
  <div>
    P{{ player }} 💀
  </div>
  <div>
  <button @click="setCurrentDeaths(-1)" type="submit" class="btn btn-primary minus">-</button>
  {{ death }}
  <button @click="setCurrentDeaths(1)" type="submit" class="btn btn-primary">+</button>
  </div>
  </div>
</template>

<style scoped>
</style>
