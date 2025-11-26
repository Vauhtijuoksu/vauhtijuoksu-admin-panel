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
    game.value = games.value.find(x => x.id === streamMetaData.value.current_game_id).game
  }
})
</script>

<template>
  <div class="game-container">
    {{ game }}
  </div>
</template>

<style scoped>
.game-container {
  padding: 4px 16px;
  font-size: 20px;
  font-weight: 600;
}
</style>
