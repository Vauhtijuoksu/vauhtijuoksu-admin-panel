<script setup>

import {onMounted, ref} from 'vue'
import axios from 'axios'

import Donations from './components/Donations.vue'
import StreamData from './components/StreamData.vue'
import Authentication from './components/Authentication.vue'
import Sum from './components/Sum.vue'
import Game from './components/Game.vue'
import GameChanger from "./components/GameChanger.vue";
import Death from "./components/Death.vue";
import StreamInfo from "./components/StreamInfo.vue";
import updateGoal from "./components/updateGoal.vue";
import ResetDeath from "./components/ResetDeath.vue"
import Heartrate from "./components/Heartrate.vue";
import Incentives from "./components/Incentives.vue";
import DonationsFlag from "./components/DonationsFlag.vue";

const url = 'https://api.dev.vauhtijuoksu.fi';
const urlLegacy = 'https://legacy.vauhtijuoksu.fi';

const donations = ref([]);
const games = ref([]);
const streamMetaData = ref({});

const getStreamMetaData = () => {
  axios.get(`${urlLegacy}/api/stream_metadata`)
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

const getGames = () => {
  axios.get(`${url}/gamedata`)
      .then((response) => {
        games.value = response.data;
      }).catch((err) => {
    console.log(err);
  });
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
        <Game :games="games" :streamMetaData="streamMetaData"/>
        <GameChanger :url="urlLegacy" :streamMetaData="streamMetaData"/>
      </div>
      <div>
        <div class="flex-row">
          <Death :url="urlLegacy" :streamMetaData="streamMetaData" :player="1"/>
          <Death :url="urlLegacy" :streamMetaData="streamMetaData" :player="2"/>
          <Death :url="urlLegacy" :streamMetaData="streamMetaData" :player="3"/>
          <Death :url="urlLegacy" :streamMetaData="streamMetaData" :player="4"/>
        </div>
        <ResetDeath :url="urlLegacy"/>
      </div>
      <div class="stream-info">
        <StreamInfo :url="urlLegacy" :streamMetaData="streamMetaData"/>
      </div>
      <div class="donflag">
        <DonationsFlag :url="urlLegacy"/>
      </div>
      <div>
        <updateGoal :url="urlLegacy" :streamMetaData="streamMetaData"/>
      </div>
    </div>
    <div class="info flex-row item">
      <div class="scrollable donations">
        <Donations :url="url" :legacyurl="urlLegacy" :donations="donations"/>
      </div>
      <div class="scrollable incentives">
        <Incentives/>
      </div>
    </div>
  </div>
</template>

<style>
</style>
