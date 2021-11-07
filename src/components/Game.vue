<script setup>
import { ref, toRefs, watch } from 'vue'

const props = defineProps({
  games: Object,
  streamMetaData: Object
})

const { games, streamMetaData } = toRefs(props);

let game = ref("Loading...");
watch(streamMetaData, () => {
  if (games.value.length){
    game.value = games.value[streamMetaData.value.game].game
  }
})
</script>

<template>
  <div>
  {{ game }}
  </div>
</template>

<style scoped>
</style>
