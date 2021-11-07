<script setup>

import { ref } from 'vue'
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
import ResetDeath from "./components/ResetDeath.vue";

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


getStreamMetaData();
getDonations();
getGames();
</script>

<template>
  <div class="statusbar flex-row">
    <Sum :donations="donations" />
    <Game :games="games" :streamMetaData="streamMetaData"/>
    <div class="flex-row">
      <div>
        ❤️88
      </div>
      <div>
        ❤️188
      </div>
      <div>
        ❤️69
      </div>
      <div>
        ❤️74
      </div>
      <div>
        ❤️111
      </div>
    </div>
    <Authentication />
  </div>
  <div class="admin flex-row">
    <div>
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
      <ResetDeath :url="urlLegacy" />
      </div>
    <div>
      <StreamInfo :url="urlLegacy" :streamMetaData="streamMetaData" />
    </div>
    <div>
      <updateGoal :url="urlLegacy" :streamMetaData="streamMetaData" />
    </div>
  </div>
  <Donations :url="url" :donations="donations" />
</template>

<style>
</style>
