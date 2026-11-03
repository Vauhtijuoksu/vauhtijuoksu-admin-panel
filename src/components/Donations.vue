<script setup>
import {computed, nextTick, onMounted, ref, toRefs, watch} from 'vue'
import api from '@/utils/api'
import { useRouter } from 'vue-router'
import { config } from '@/config'
import { euros } from '@/utils/format'
import { useCharities } from '@/composables/useCharities'

const props = defineProps({
  games: Object,
  donations: Object,
  incentives: Object
})

const router = useRouter()

const { games, donations, incentives } = toRefs(props);


const username = ref(localStorage.getItem('username'));



let islogged = ref(false);
onMounted(()=> {
  if (username.value) {
    islogged.value = true
  }
})

const { charityById } = useCharities()
const incentiveById = computed(() => Object.fromEntries(incentives.value.map(i => [i.id, i])))
// Not every incentive is tied to a game
const gameName = (incentive) => games.value.find(x => x.id === incentive?.game_id)?.game

// Hovering or clicking an incentive line opens its details, so the announcer can read the situation. Keeping the id instead
// of the object shows the newest numbers while the popup is open
const detailsPopup = ref(null)
const shownIncentiveId = ref(null)
const shownIncentive = computed(() => incentiveById.value[shownIncentiveId.value])
const sortedStatus = (incentive) => [...incentive.status].sort((a, b) => b.amount - a.amount)

let hideTimer = null

const showDetails = async (event, incentiveId) => {
  clearTimeout(hideTimer)
  const line = event.currentTarget.getBoundingClientRect()
  const cell = event.currentTarget.closest('td').getBoundingClientRect()
  shownIncentiveId.value = incentiveId
  const popup = detailsPopup.value
  if (!popup.matches(':popover-open')) {
    popup.showPopover()
  }
  // Measure only after the new content is rendered
  await nextTick()
  // Beside the message column, so it never covers the other incentive lines: on the side with more room,
  // narrowed to fit it (down to 200px), and always inside the window
  const roomRight = innerWidth - cell.right - 12
  const roomLeft = cell.left - 12
  const onRight = roomRight >= roomLeft
  popup.style.width = `${Math.min(320, Math.max(200, onRight ? roomRight : roomLeft))}px`
  popup.style.left = `${onRight ? Math.min(cell.right + 8, innerWidth - popup.offsetWidth - 4) : Math.max(4, cell.left - popup.offsetWidth - 8)}px`
  popup.style.top = `${Math.max(4, Math.min(line.top, innerHeight - popup.offsetHeight - 4))}px`
}

// Hiding waits a moment, so the pointer can move from the line onto the popup
const hideDetailsSoon = () => {
  hideTimer = setTimeout(() => {
    if (detailsPopup.value?.matches(':popover-open')) {
      detailsPopup.value.hidePopover()
    }
  }, 150)
}

const keepDetails = () => clearTimeout(hideTimer)

const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' })
const formatDate = (timestamp) => new Date(timestamp).toLocaleDateString('fi-FI', { day: 'numeric', month: 'numeric' })

// Every incentive choice in a donation, with its share of the amount when the donation is split between several
const chosenIncentives = (donation) => {
  const chosen = donation.incentives.flatMap(incentive => incentive.chosen_incentives.map(choice => ({
    ...choice,
    code: incentive.code,
    amount: donation.amount / donation.incentives.length / incentive.chosen_incentives.length,
  })))
  return chosen.map(choice => ({ ...choice, split: chosen.length > 1 }))
}

// Donations that arrive after the page loaded light up for a moment. The animation runs once, when the row is added
const knownIds = ref(null)
const isNew = (donation) => knownIds.value !== null && !knownIds.value.has(donation.id)
watch(donations, (list) => {
  if (knownIds.value === null && list.length) {
    knownIds.value = new Set(list.map(d => d.id))
  }
}, { immediate: true })

const isToday = (timestamp) => new Date(timestamp).toDateString() === new Date().toDateString()



const markDonation = async (donation) => {
  const response = await api.patch(`/donations/${donation.id}`, {read: !donation.read});
  if (response) {
    donation.read = !donation.read;
  }
}

const censorName = async (donation) => {
  if (confirm('Haluatko sensuroida käyttäjänimen ' + donation.name + '?')) {
    const response = await api.patch(`/donations/${donation.id}`, {name: 'höpö'});
    if (response) {
      donation.name = 'höpö';
    }
  }
}

</script>

<template>
  <table class="table">
    <thead>
      <tr>
        <th v-if="islogged" scope="col"></th>
        <th scope="col">Aika</th>
        <th scope="col">Nimi / kohde</th>
        <th scope="col">Viesti</th>
        <th scope="col" class="amount-cell">Summa</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="donation in donations.slice().reverse()" :key="donation.id" :class="{ notread: !donation.read, 'new-donation': isNew(donation) }">
        <td v-if="islogged" class="read-cell">
          <button type="button" class="btn btn-sm read-btn" :class="donation.read ? 'btn-outline-light' : 'btn-primary'"
                  @click="markDonation(donation)">{{ donation.read ? 'Palauta' : 'Kuittaa' }}</button>
        </td>
        <td class="timestamp-cell">
          <div v-if="!isToday(donation.timestamp)">{{ formatDate(donation.timestamp) }}</div>
          <div>{{ formatTime(donation.timestamp) }}</div>
        </td>
        <td class="name-cell">
          {{ donation.name }}
          <span v-if="islogged" class="action-icon" @click="router.push(`/edit/donation/${donation.id}`)" title="Muokkaa lahjoitusta">✏️</span>
          <span v-if="islogged" class="censor" @click="censorName(donation)" title="Sensuroi nimi">🔞</span>
          <div v-if="charityById[donation.charity]" class="charity-tag"
               :style="{ background: charityById[donation.charity].color }"
               :title="charityById[donation.charity].name">{{ charityById[donation.charity].label }}</div>
        </td>
        <td class="message-cell">
          <div class="message-inner">
            <span class="waiting-for-content" v-if="(!donation.message && config.emptyDonationLoadSeconds && new Date(donation.timestamp).getTime() > (Date.now() - 1000 * config.emptyDonationLoadSeconds))">
              * Odottaa viestiä *
            </span>
            {{ donation.message }}
          </div>
          <div v-for="chosen in chosenIncentives(donation)" :key="chosen.code + chosen.incentive_id" class="incentive-line"
               @mouseenter="showDetails($event, chosen.incentive_id)" @mouseleave="hideDetailsSoon"
               @click="showDetails($event, chosen.incentive_id)">
            🎯 <span v-if="gameName(incentiveById[chosen.incentive_id])" class="incentive-game">{{ gameName(incentiveById[chosen.incentive_id]) }} –</span>
            {{ incentiveById[chosen.incentive_id]?.title }}<template v-if="chosen.parameter">: {{ chosen.parameter }}</template>
            <template v-if="chosen.split"> ({{ euros(chosen.amount) }})</template>
            <span class="incentive-more">ⓘ</span>
          </div>
        </td>
        <td class="amount-cell">{{ euros(donation.amount) }}</td>
      </tr>
    </tbody>
  </table>
  <!-- A native popover: also closes on Esc and on a click outside it, and is never cut off by the panel -->
  <div ref="detailsPopup" popover class="incentive-popup" @mouseenter="keepDetails" @mouseleave="hideDetailsSoon">
    <template v-if="shownIncentive">
      <div v-if="gameName(shownIncentive)" class="popup-game">{{ gameName(shownIncentive) }}</div>
      <div class="popup-title">{{ shownIncentive.title }}</div>
      <div v-if="shownIncentive.info" class="popup-info">{{ shownIncentive.info }}</div>
      <div class="popup-time">Sulkeutuu {{ formatDate(shownIncentive.end_time) }} klo {{ formatTime(shownIncentive.end_time) }}</div>
      <div v-if="shownIncentive.type === 'milestone'">Kerätty {{ euros(shownIncentive.total_amount) }} / {{ euros(shownIncentive.milestones[0]) }}</div>
      <ol v-else-if="shownIncentive.status.length">
        <li v-for="status in sortedStatus(shownIncentive)" :key="status.option">{{ status.option }}: {{ euros(status.amount) }}</li>
      </ol>
    </template>
  </div>
</template>

<style scoped>
.name-cell {
  /* Only as wide as needed, the message gets the rest of the row */
  min-width: 13ch;
  overflow-wrap: anywhere;
  word-break: break-word;
}
.name-cell .censor {
  cursor: pointer;
  margin-left: 4px;
  opacity: 0.4;
}
.name-cell:hover .censor {
  opacity: 1;
}
.timestamp-cell {
  font-size: 0.75em;
  white-space: nowrap;
}
.message-cell {
  /* Takes all the width the other columns don't need */
  width: 100%;
}
.message-inner {
  overflow-wrap: anywhere;
}
.amount-cell {
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.action-icon {
  cursor: pointer;
}
.incentive-line {
  margin-top: 2px;
  font-size: 0.85em;
  color: #ffd166;
}
.incentive-line {
  cursor: pointer;
}
.incentive-popup {
  /* Placed next to the line by showDetails */
  position: fixed;
  inset: auto;
  margin: 0;
  width: 320px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 12px 14px;
  border: 1px solid #2a3a5a;
  border-radius: 8px;
  background: #081536;
  color: #e0e0e0;
  overflow-wrap: break-word;
}
.incentive-popup .popup-game {
  color: #e0c890;
  font-size: 0.85em;
}
.incentive-popup .popup-title {
  font-weight: 700;
  color: #ffd166;
}
.incentive-popup .popup-info {
  margin: 4px 0;
  font-size: 0.9em;
}
.incentive-popup .popup-time {
  font-size: 0.85em;
  color: #aaa;
}
.incentive-popup ol {
  margin: 6px 0 0;
  padding-left: 20px;
}
.incentive-more {
  margin-left: 4px;
  opacity: 0.7;
}
.incentive-game {
  color: #e0c890;
  opacity: 0.8;
}
.new-donation > td {
  animation: new-donation 6s ease-out;
}
@keyframes new-donation {
  from {
    background-color: rgba(255, 209, 102, 0.45);
  }
  to {
    background-color: transparent;
  }
}
.read-btn {
  padding: 2px 6px;
  font-size: 13px;
}
.read-cell {
  padding-left: 4px;
  padding-right: 4px;
}
.charity-tag {
  width: fit-content;
  /* A fixed width, since a table sizes its columns by the full text */
  max-width: 18ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
  padding: 0 6px;
  border-radius: 8px;
  color: #fff;
  font-size: 0.7em;
  font-weight: 600;
}
</style>
