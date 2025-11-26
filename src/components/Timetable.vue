<script setup>
import {ref, toRefs, watch} from 'vue'

const props = defineProps({
  gamedata: Object,
  participants: Array,
  streamMetaData: Object,
})

const { gamedata, participants, streamMetaData } = toRefs(props);

const getParticipantName = (participantId) => {
  const participant = participants.value.find(p => p.id === participantId);
  return participant?.display_name || 'Unknown';
};

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString("fi-FI", {
    day: 'numeric',
    month: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const isCurrentGame = (game) => {
  // Use stream metadata as source of truth for current game
  return streamMetaData.value?.current_game_id === game.id;
};

const isPastGame = (game) => {
  // Don't hide the current game even if it's past its scheduled time
  if (isCurrentGame(game)) {
    return false;
  }
  const now = new Date();
  const end = new Date(game.end_time);
  return now > end;
};

</script>

<template>
  <div v-for="game in gamedata" :key="game.id">
    <div v-if="!isPastGame(game)">
      <div v-if="isCurrentGame(game)">
        <h4 class="text-current">{{ game.game }}</h4>
      </div>
      <div v-else>
        <h4>{{ game.game }}</h4>
      </div>
      
      <p v-if="game.category">{{ game.category }}</p>
      
      <div v-if="game.participants && game.participants.length > 0">
        <p v-if="game.participants.filter(p => p.role === 'PLAYER').length > 0">
          Pelaajat: {{ game.participants.filter(p => p.role === 'PLAYER').map(p => getParticipantName(p.participant_id)).join(', ') }}
        </p>
        <p v-if="game.participants.filter(p => p.role === 'COUCH').length > 0">
          Sohvalla: {{ game.participants.filter(p => p.role === 'COUCH').map(p => getParticipantName(p.participant_id)).join(', ') }}
        </p>
      </div>
      
      <p class="time-info">{{ formatTime(game.start_time) }} - {{ formatTime(game.end_time) }}</p>
      
      <hr/>
    </div>
  </div>
</template>

<style scoped>
  .text-current {
    color: #28a745;
    font-weight: bold;
  }
  
  .time-info {
    color: #999;
    font-size: 0.9em;
  }
  
  hr {
    border-color: #444;
    margin: 1em 0;
  }
</style>

