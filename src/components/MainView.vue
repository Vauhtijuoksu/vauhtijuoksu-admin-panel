<script setup>

import {onMounted, ref} from 'vue'
import axios from 'axios'

import Donations from './Donations.vue'
import Authentication from './Authentication.vue'
import Sum from './Sum.vue'
import Game from './Game.vue'
import GameChanger from "./GameChanger.vue";
import Death from "./Death.vue";
import StreamInfo from "./StreamInfo.vue";
import updateGoal from "./updateGoal.vue";
import ResetDeath from "./ResetDeath.vue"
import Heartrate from "./Heartrate.vue";
import Incentives from "./Incentives.vue";
import DonationsFlag from "./DonationsFlag.vue";

const url = 'https://api.dev.vauhtijuoksu.fi';

const donations = ref([]);
const games = ref([]);
const streamMetaData = ref({});
const incentives = ref({});

const showEightCounters = ref(false);

const getStreamMetaData = () => {
  axios.get(`${url}/stream-metadata`)
      .then((response) => {
        streamMetaData.value = response.data;
      }).catch((err) => {
    console.log(err);
  });
  setTimeout(getStreamMetaData, 3000);
}

const getDonations = () => {
  axios.get(`${url}/donations`)
      .then((response) => {
        donations.value = response.data;
      }).catch((err) => {
    console.log(err);
  });
  setTimeout(getDonations, 3000);
}

const getIncentives = () => {
  axios.get(`${url}/incentives`)
      .then((response) => {
        incentives.value = response.data;
      }).catch((err) => {
    console.log(err);
  });
  setTimeout(getIncentives, 6000);
}

const getGames = () => {
  axios.get(`${url}/gamedata`)
      .then((response) => {
        games.value = response.data;
      }).catch((err) => {
    console.log(err);
  });
  setTimeout(getIncentives, 20000);
}

const username = ref(localStorage.getItem('username'));
onMounted(()=> {
  if (username.value) {
    document.getElementById("admin").classList.remove("hidden")
  }
})

getStreamMetaData();
getDonations();
getGames();
getIncentives();
</script>

<template>
  <div class="content flex-column">
    <div class="statusbar flex-row">
      <Sum :donations="donations"/>
      <Game :games="games" :streamMetaData="streamMetaData"/>
      <div class="flex-row">
        <Heartrate :sensor="1"/>
        <Heartrate :sensor="2"/>
        <Heartrate :sensor="3"/>
        <Heartrate :sensor="4"/>
        <Heartrate :sensor="5"/>
      </div>
      <Authentication/>
    </div>
    <div id="admin" class="admin flex-row hidden">
      <div class="games">
        <GameChanger :games="games" :url="url" :streamMetaData="streamMetaData"/>
      </div>
      <div>
        <div class="flex-row">
          <Death :url="url" :streamMetaData="streamMetaData" :player="1"/>
          <Death :url="url" :streamMetaData="streamMetaData" :player="2"/>
          <Death :url="url" :streamMetaData="streamMetaData" :player="3"/>
          <Death :url="url" :streamMetaData="streamMetaData" :player="4"/>
        </div>
        <div v-if="showEightCounters" class="flex-row">
          <Death :url="url" :streamMetaData="streamMetaData" :player="5"/>
          <Death :url="url" :streamMetaData="streamMetaData" :player="6"/>
          <Death :url="url" :streamMetaData="streamMetaData" :player="7"/>
          <Death :url="url" :streamMetaData="streamMetaData" :player="8"/>
        </div>
        <ResetDeath :url="url"/>
        <span v-if="!showEightCounters" @click="showEightCounters = true" title="näytä lisää laskureita">⬇️</span>
        <span v-if="showEightCounters" @click="showEightCounters = false" title="piilota laskurit">⬆️️</span>
      </div>
      <div class="stream-info">
        <StreamInfo :url="url" :streamMetaData="streamMetaData"/>
      </div>
      <div class="donflag">
        <DonationsFlag :url="url"/>
      </div>
      <div>
        <updateGoal :url="url" :streamMetaData="streamMetaData"/>
      </div>
    </div>
    <div class="info flex-row item">
      <div class="scrollable donations">
        <Donations :url="url" :games="games" :donations="donations" :incentives="incentives"/>
      </div>
      <div class="scrollable incentives">
        <Incentives :incentives="incentives" :gamedata="games"/>
      </div>
    </div>
  </div>
</template>

<style>
</style>
