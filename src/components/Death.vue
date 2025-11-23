<script setup>
import {ref, toRefs, watch} from 'vue'
import api from '@/utils/api'

const props = defineProps({
  url: String,
  streamMetaData: Object,
  player: Intl
})

const { streamMetaData, player } = toRefs(props);


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

const setCurrentDeaths = async (direction) => {

  streamMetaData.value.counters[player.value - 1] = streamMetaData.value.counters[player.value - 1] + direction

  const response = await api.patch('/stream-metadata', { counters: streamMetaData.value.counters });
  
  if (response) {
    if (death.value === "OFF") {
      death.value = 0;
      document.getElementById(player.value - 1).classList.remove("death-off");
    } else {
      death.value = streamMetaData.value.counters[player.value - 1];
    }
  }
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
