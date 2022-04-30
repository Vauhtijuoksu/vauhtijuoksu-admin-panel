<script setup>
import {ref, toRefs, watch} from 'vue'
import axios from 'axios'

const props = defineProps({
  incentives: Object,
})

const { incentives } = toRefs(props);


</script>

<template>
  <tr v-for="incentive in incentives" :key="incentive.id">
    <div v-if="new Date(incentive.end_time) >= new Date()">
      <h4>{{ incentive.title }}</h4>
      <p>{{ incentive.info }}</p>
      <p>Sulkeutuu: {{new Date(incentive.end_time).toLocaleString("fi-FI")}}</p>
      <div v-if="incentive.type === 'milestone'">
          {{incentive.total_amount}}e / {{incentive.milestones[0]}}e
      </div>
      <div v-if="incentive.type === 'option'">
      <tr v-for="status in incentive.status" :key="status">
        {{status.option}}
        {{status.amount}}e
      </tr>
      </div>
      <div v-if="incentive.type === 'open'">
      <tr v-for="status in incentive.status" :key="status">
        {{status.option}}
        {{status.amount}}e
      </tr>
      </div>
    </div>
    <hr/>
  </tr>
</template>

<style scoped>
</style>
