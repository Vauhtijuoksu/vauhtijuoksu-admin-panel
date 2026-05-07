<script setup>
import {ref, toRefs, watch} from 'vue'
import axios from 'axios'
import { config } from '@/config'
import api from '@/utils/api'

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

const isTopOption = (status, allStatuses) => {
  const max = Math.max(...allStatuses.map(s => s.amount));
  return max > 0 && status.amount === max;
};

const sortMap = ref({});

const toggleSort = (id) => {
  sortMap.value[id] = !sortMap.value[id];
};

const sortedStatus = (incentive) => {
  if (!sortMap.value[incentive.id]) return incentive.status;
  return [...incentive.status].sort((a, b) => b.amount - a.amount);
};

const extending = ref({});

const extendEndTime = async (incentive) => {
  const current = new Date(incentive.end_time);
  const next = new Date(current.getTime() + 5 * 60 * 1000);
  const msg = `Lisää 5 minuuttia kohteeseen "${incentive.title}"?\n\n` +
              `${current.toLocaleString("fi-FI")}\n  →\n${next.toLocaleString("fi-FI")}`;
  if (!window.confirm(msg)) return;

  extending.value[incentive.id] = true;
  const res = await api.patch(`/incentives/${incentive.id}`, {
    end_time: next.toISOString(),
  });
  extending.value[incentive.id] = false;
  if (res?.data) {
    incentive.end_time = res.data.end_time ?? next.toISOString();
  }
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
        <p><span class="label">🎮 Peli:</span> {{gamedata.find(x => x.id === incentive.game_id).game}}</p>
        <div v-if="gamedata.find(x => x.id === incentive.game_id).participants && gamedata.find(x => x.id === incentive.game_id).participants.length > 0">
          <p v-if="gamedata.find(x => x.id === incentive.game_id).participants.filter(p => p.role === 'PLAYER').length > 0">
            <span class="label">🕹️ Pelaajat:</span> {{ gamedata.find(x => x.id === incentive.game_id).participants.filter(p => p.role === 'PLAYER').map(p => getParticipantName(p.participant_id)).join(', ') }}
          </p>
          <p v-if="gamedata.find(x => x.id === incentive.game_id).participants.filter(p => p.role === 'COUCH').length > 0">
            <span class="label">🛋️ Sohvalla:</span> {{ gamedata.find(x => x.id === incentive.game_id).participants.filter(p => p.role === 'COUCH').map(p => getParticipantName(p.participant_id)).join(', ') }}
          </p>
        </div>
      </div>
      <p>
        <span class="label">⏰ Sulkeutuu:</span> {{new Date(incentive.end_time).toLocaleString("fi-FI")}}
        <button type="button" class="btn btn-sm btn-outline-light ms-2" :disabled="extending[incentive.id]" @click="extendEndTime(incentive)">
          {{ extending[incentive.id] ? '…' : '+5 min' }}
        </button>
      </p>
      <div v-if="incentive.type === 'milestone'">
          <h5 class="subheader">🎯 Tilanne / Tavoite</h5>
          <div class="milestone-progress">
            <div class="milestone-numbers">
              <span class="milestone-current">{{incentive.total_amount.toFixed(2)}}€</span>
              <span class="milestone-sep">/</span>
              <span class="milestone-goal">{{incentive.milestones[0]}}€</span>
              <span class="milestone-percent">({{ Math.min(100, (incentive.total_amount / incentive.milestones[0]) * 100).toFixed(0) }}%)</span>
            </div>
            <div class="milestone-bar">
              <div class="milestone-bar-fill" :style="{ width: Math.min(100, (incentive.total_amount / incentive.milestones[0]) * 100) + '%' }"></div>
            </div>
          </div>
      </div>
      <div v-if="incentive.type === 'option'">
      <div class="subheader-row">
        <h5 class="subheader">🗳️ Vaihtoehdot</h5>
        <button type="button" class="btn btn-sm btn-outline-light" @click="toggleSort(incentive.id)">
          {{ sortMap[incentive.id] ? '↕️ Alkuperäinen' : '💰 Järjestä summan mukaan' }}
        </button>
      </div>
      <tr v-for="status in sortedStatus(incentive)" :key="status.option" :class="{ 'top-option': isTopOption(status, incentive.status) }">
        <span v-if="isTopOption(status, incentive.status)">👑 </span>{{status.option}}
        {{status.amount.toFixed(2)}}e
      </tr>
      </div>
      <div v-if="incentive.type === 'open'">
      <div class="subheader-row">
        <h5 class="subheader">💡 Ehdotukset</h5>
        <button type="button" class="btn btn-sm btn-outline-light" @click="toggleSort(incentive.id)">
          {{ sortMap[incentive.id] ? '↕️ Alkuperäinen' : '💰 Järjestä summan mukaan' }}
        </button>
      </div>
      <tr v-for="status in sortedStatus(incentive)" :key="status.option" :class="{ 'top-option': isTopOption(status, incentive.status) }">
        <span v-if="isTopOption(status, incentive.status)">👑 </span>{{status.option}}
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
  .top-option {
    font-weight: bold;
    color: #4ade80;
  }
  .label {
    font-weight: 600;
    color: #ffd166;
  }
  .subheader {
    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #f8f9fa;
    margin-top: 0.75rem;
    margin-bottom: 0.5rem;
  }
  .milestone-progress {
    margin-bottom: 0.5rem;
  }
  .milestone-numbers {
    font-size: 1.05rem;
    margin-bottom: 0.35rem;
  }
  .milestone-current {
    font-weight: 700;
    color: #4ade80;
  }
  .milestone-sep {
    margin: 0 0.35rem;
    color: #adb5bd;
  }
  .milestone-goal {
    color: #ffd166;
  }
  .milestone-percent {
    margin-left: 0.5rem;
    color: #adb5bd;
    font-size: 0.9rem;
  }
  .milestone-bar {
    width: 100%;
    height: 8px;
    background: #343a40;
    border-radius: 4px;
    overflow: hidden;
  }
  .milestone-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #4ade80, #22c55e);
    transition: width 0.3s ease;
  }
  .subheader-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-top: 0.75rem;
    margin-bottom: 0.5rem;
  }
  .subheader-row .subheader {
    margin: 0;
    flex: 1;
    border-bottom: none;
    padding-bottom: 0;
  }
</style>
