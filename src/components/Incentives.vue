<script setup>
import {ref, toRefs, watch} from 'vue'
import axios from 'axios'

const props = defineProps({
  incentives: Object,
  gamedata: Object,
})

const { incentives, gamedata } = toRefs(props);


</script>

<template>
  <tr v-for="incentive in incentives" :key="incentive.id">
    <div v-if="new Date(incentive.end_time) >= new Date(new Date().getTime() - 60 * 60000)">
      <div v-if="new Date(incentive.end_time) >= new Date()">
        <h4>{{ incentive.title }}</h4>
      </div>
      <div v-else>
        <h4 class="text-danger">{{ incentive.title }}</h4>
      </div>
      <p>{{ incentive.info }}</p>

      <div v-if="gamedata.length">
        <p>Peli: {{gamedata.find(x => x.id === incentive.game_id).game}}</p>
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
    </div>
    <hr/>
  </tr>
</template>

<style scoped>
  #selector{
    color:lightgrey;
  }
</style>
