<script setup>

import {computed, onMounted, ref, watchEffect} from 'vue'
import api from '@/utils/api'

import Donations from './Donations.vue'
import Authentication from './Authentication.vue'
import Sum from './Sum.vue'
import CharityTotals from './CharityTotals.vue'
import GameChanger from "./GameChanger.vue";
import StreamInfo from "./StreamInfo.vue";
import updateGoal from "./updateGoal.vue";
import ResetDeath from "./ResetDeath.vue"
import Incentives from "./Incentives.vue";
import DonationsFlag from "./DonationsFlag.vue";
import Timetable from "./Timetable.vue";


const donations = ref([]);
const unread = computed(() => donations.value.filter(d => !d.read).length);
// Visible also when the panel is in a background tab
watchEffect(() => {
  document.title = unread.value ? `(${unread.value}) VJ-admin-panel` : 'VJ-admin-panel';
});
const games = ref([]);
const streamMetaData = ref({});
const incentives = ref([]);
const participants = ref([]);

// Section widths (percentages) for horizontal layout
const donationsWidth = ref(50);
const incentivesWidth = ref(25);
const timetableWidth = ref(25);

// Section heights (percentages) for vertical layout
const donationsHeight = ref(33.33);
const incentivesHeight = ref(33.33);
const timetableHeight = ref(33.33);

// Layout toggle
const isVerticalLayout = ref(false);
const toggleLayout = () => {
  isVerticalLayout.value = !isVerticalLayout.value;
};

// Resize functionality
let resizingSection = null;
let startX = 0;
let startY = 0;
let startWidth = 0;
let nextWidth = 0;
let startHeight = 0;
let nextHeight = 0;

const startResize = (event, section) => {
  resizingSection = section;
  startX = event.clientX;
  startY = event.clientY;
  
  if (isVerticalLayout.value) {
    // Vertical layout - resizing heights
    if (section === 'donations') {
      startHeight = donationsHeight.value;
      nextHeight = incentivesHeight.value;
    } else if (section === 'incentives') {
      startHeight = incentivesHeight.value;
      nextHeight = timetableHeight.value;
    }
  } else {
    // Horizontal layout - resizing widths
    if (section === 'donations') {
      startWidth = donationsWidth.value;
      nextWidth = incentivesWidth.value;
    } else if (section === 'incentives') {
      startWidth = incentivesWidth.value;
      nextWidth = timetableWidth.value;
    }
  }
  
  document.addEventListener('mousemove', onResize);
  document.addEventListener('mouseup', stopResize);
  event.preventDefault();
};

const onResize = (event) => {
  if (!resizingSection) return;
  
  const container = document.querySelector('.info');
  
  if (isVerticalLayout.value) {
    // Vertical layout - resize heights
    const containerHeight = container.offsetHeight;
    const deltaY = event.clientY - startY;
    const deltaPercent = (deltaY / containerHeight) * 100;
    
    if (resizingSection === 'donations') {
      const newHeight = Math.max(10, Math.min(80, startHeight + deltaPercent));
      const newNextHeight = Math.max(10, nextHeight - deltaPercent);
      donationsHeight.value = newHeight;
      incentivesHeight.value = newNextHeight;
    } else if (resizingSection === 'incentives') {
      const newHeight = Math.max(10, Math.min(80, startHeight + deltaPercent));
      const newNextHeight = Math.max(10, nextHeight - deltaPercent);
      incentivesHeight.value = newHeight;
      timetableHeight.value = newNextHeight;
    }
  } else {
    // Horizontal layout - resize widths
    const containerWidth = container.offsetWidth;
    const deltaX = event.clientX - startX;
    const deltaPercent = (deltaX / containerWidth) * 100;
    
    if (resizingSection === 'donations') {
      const newWidth = Math.max(20, Math.min(70, startWidth + deltaPercent));
      const newNextWidth = Math.max(10, nextWidth - deltaPercent);
      donationsWidth.value = newWidth;
      incentivesWidth.value = newNextWidth;
    } else if (resizingSection === 'incentives') {
      const newWidth = Math.max(10, Math.min(50, startWidth + deltaPercent));
      const newNextWidth = Math.max(10, nextWidth - deltaPercent);
      incentivesWidth.value = newWidth;
      timetableWidth.value = newNextWidth;
    }
  }
};

const stopResize = () => {
  resizingSection = null;
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', stopResize);
};

const getStreamMetaData = async () => {
  const response = await api.get('/stream-metadata');
  if (response?.data) {
    streamMetaData.value = response.data;
  }
  setTimeout(getStreamMetaData, 3000);
}

const getDonations = async () => {
  const response = await api.get('/donations');
  if (response?.data) {
    donations.value = response.data;
  }
  setTimeout(getDonations, 3000);
}

const getIncentives = async () => {
  const response = await api.get('/incentives');
  if (response?.data) {
    incentives.value = response.data;
  }
  setTimeout(getIncentives, 6000);
}

const getGames = async () => {
  const response = await api.get('/gamedata');
  if (response?.data) {
    games.value = response.data;
  }
  setTimeout(getGames, 20000);
}

const getParticipants = async () => {
  const response = await api.get('/participants');
  if (response?.data) {
    participants.value = response.data;
  }
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
getParticipants();
</script>

<template>
  <div class="content flex-column">
    <div class="statusbar flex-row">
      <Sum :donations="donations"/>
      <div class="statusbar-separator"></div>
      <GameChanger :games="games" :streamMetaData="streamMetaData"/>
      <div class="statusbar-separator"></div>
      <router-link v-if="username" to="/edit" class="btn btn-secondary">Muokkaa</router-link>
      <Authentication/>
    </div>
    <div id="admin" class="admin hidden">
      <div class="admin-section">
        <div class="admin-section-title">Stream-tiedot</div>
        <StreamInfo :streamMetaData="streamMetaData"/>
      </div>
      
      <div class="admin-separator"></div>
      
      <div class="admin-section">
        <div class="admin-section-title">Tavoite</div>
        <updateGoal :streamMetaData="streamMetaData"/>
      </div>
      
      <div class="admin-separator"></div>
      
      <div class="admin-section">
        <div class="admin-actions">
          <DonationsFlag/>
          <ResetDeath/>
        </div>
      </div>
    </div>
    <div class="info item" :class="isVerticalLayout ? 'flex-column' : 'flex-row'">
      <button @click="toggleLayout" class="layout-toggle" :title="isVerticalLayout ? 'Switch to horizontal layout' : 'Switch to vertical layout'">
        {{ isVerticalLayout ? '↔️' : '↕️' }}
      </button>
      <div class="section donations" :style="isVerticalLayout ? { height: donationsHeight + '%' } : { width: donationsWidth + '%' }">
        <div class="section-header donations-header">
          Lahjoitukset
          <span v-if="unread" class="unread-count">{{ unread }} lukematta</span>
          <CharityTotals :donations="donations"/>
        </div>
        <div class="scrollable">
          <Donations :games="games" :donations="donations" :incentives="incentives"/>
        </div>
      </div>
      <div class="resizer" :class="isVerticalLayout ? 'resizer-vertical' : 'resizer-horizontal'" @mousedown="startResize($event, 'donations')"></div>
      <div class="section incentives" :style="isVerticalLayout ? { height: incentivesHeight + '%' } : { width: incentivesWidth + '%' }">
        <div class="section-header">Kannustimet</div>
        <div class="scrollable">
          <Incentives :incentives="incentives" :gamedata="games" :participants="participants"/>
        </div>
      </div>
      <div class="resizer" :class="isVerticalLayout ? 'resizer-vertical' : 'resizer-horizontal'" @mousedown="startResize($event, 'incentives')"></div>
      <div class="section timetable" :style="isVerticalLayout ? { height: timetableHeight + '%' } : { width: timetableWidth + '%' }">
        <div class="section-header">Aikataulu</div>
        <div class="scrollable">
          <Timetable :gamedata="games" :participants="participants" :streamMetaData="streamMetaData"/>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.statusbar-separator {
  width: 2px;
  background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%);
  height: 40px;
  align-self: center;
}

.unread-count {
  padding: 1px 8px;
  border-radius: 10px;
  background: #5e2121;
  border: 1px solid #b71c1c;
  font-size: 12px;
}

.donations-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.statusbar > .btn {
  flex-shrink: 0;
}

.admin {
  display: flex;
  flex-direction: row;
  gap: 8px;
  padding: 6px 12px;
  align-items: center;
  flex-wrap: wrap;
}

.admin-section {
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
}

.admin-section-title {
  font-size: 13px;
  font-weight: 600;
  color: #aaa;
  white-space: nowrap;
  min-width: fit-content;
}

.admin-separator {
  width: 2px;
  height: 35px;
  background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.05) 100%);
}

.admin-actions {
  display: flex;
  flex-direction: row;
  gap: 12px;
}

.info {
  position: relative;
}

.layout-toggle {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  background-color: #1c2039;
  border: 2px solid #2a3a5a;
  color: #e0e0e0;
  padding: 8px 12px;
  font-size: 20px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.layout-toggle:hover {
  background-color: #2a3a5a;
  border-color: #3a4a6a;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.section {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-header {
  background-color: #1c2039;
  padding: 10px 15px;
  font-weight: bold;
  font-size: 18px;
  border-bottom: 2px solid #2a3a5a;
  color: #e0e0e0;
  flex-shrink: 0;
}

.section .scrollable {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  overflow-wrap: break-word;
  padding: 10px;
}

.resizer {
  background-color: #1c2039;
  flex-shrink: 0;
  transition: background-color 0.2s;
}

.resizer-horizontal {
  width: 8px;
  cursor: col-resize;
}

.resizer-vertical {
  height: 8px;
  cursor: row-resize;
}

.resizer:hover {
  background-color: #2a3a5a;
}

.resizer:active {
  background-color: #3a4a6a;
}
</style>
