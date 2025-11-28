<script setup>
import {ref, toRefs, watch} from 'vue'
import axios from 'axios'
import { config } from '@/config'

const props = defineProps({
  incentives: Object,
  gamedata: Object,
  participants: Array,
})

const { incentives, gamedata, participants } = toRefs(props);

const getParticipantName = (participantId) => {
  const participant = participants.value.find(p => p.id === participantId);
  return participant?.display_name || 'Unknown';
};

</script>

<template>
  <tr v-for="incentive in incentives" :key="incentive.id">
    <div v-if="new Date(incentive.end_time) >= new Date(new Date().getTime() - 60 * 60000)">
      <div v-if="new Date(incentive.end_time) >= new Date() && (!config.incentiveLockedBeforeHours || new Date(incentive.end_time).getTime() < Date.now() + config.incentiveLockedBeforeHours * 1000 * 60 * 60)">
        <h4>{{ incentive.title }}</h4>
      </div>
      <div v-else>
        <h4 class="text-danger">{{ incentive.title }}</h4>
      </div>
      <p>{{ incentive.info }}</p>

      <div v-if="gamedata.length && incentive.game_id">
        <p>Peli: {{gamedata.find(x => x.id === incentive.game_id).game}}</p>
        <div v-if="gamedata.find(x => x.id === incentive.game_id).participants && gamedata.find(x => x.id === incentive.game_id).participants.length > 0">
          <p v-if="gamedata.find(x => x.id === incentive.game_id).participants.filter(p => p.role === 'PLAYER').length > 0">
            Pelaajat: {{ gamedata.find(x => x.id === incentive.game_id).participants.filter(p => p.role === 'PLAYER').map(p => getParticipantName(p.participant_id)).join(', ') }}
          </p>
          <p v-if="gamedata.find(x => x.id === incentive.game_id).participants.filter(p => p.role === 'COUCH').length > 0">
            Sohvalla: {{ gamedata.find(x => x.id === incentive.game_id).participants.filter(p => p.role === 'COUCH').map(p => getParticipantName(p.participant_id)).join(', ') }}
          </p>
        </div>
      </div>
      <p>Sulkeutuu: {{new Date(incentive.end_time).toLocaleString("fi-FI")}}</p>
      <div v-if="incentive.type === 'milestone'">
          Tilanne/Tavoite: <br>
          {{incentive.total_amount.toFixed(2)}}e / {{incentive.milestones[0]}}e
      </div>
      <div v-if="incentive.type === 'option'">
      Vaihtoehdot: <br>
      <tr v-for="status in incentive.status" :key="status">
        {{status.option}}
        {{status.amount.toFixed(2)}}e
      </tr>
      </div>
      <div v-if="incentive.type === 'open'">
      Ehdotukset: <br>
      <tr v-for="status in incentive.status" :key="status">
        {{status.option}}
        {{status.amount.toFixed(2)}}e
      </tr>
      </div>
      <hr/>
    </div>
  </tr>
</template>

<style scoped>
  #selector{
    color:lightgrey;
  }
</style>
