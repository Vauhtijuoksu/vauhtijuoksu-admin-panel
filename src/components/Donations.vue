<script setup>
import {onMounted, ref, toRefs, watch} from 'vue'
import api from '@/utils/api'
import { useRouter } from 'vue-router'
import { config } from '@/config'

const props = defineProps({
  url: String,
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



const markDonation = async (id, readValue) => {
  const response = await api.patch(`/donations/${id}`, {read: readValue});
  if (response) {
    let obj = donations.value.find(x => x.id === id);
    let index = donations.value.indexOf(obj);
    donations.value.fill(obj.read=readValue, index, index++);
  }
}

const censorName = async (id, name) => {
  let conf = confirm('Haluatko sensuroida käyttäjänimen ' + name + '?');
  if (conf){
    const response = await api.patch(`/donations/${id}`, {name: 'höpö'});
    if (response) {
      console.log(response)
    }
  }
}

</script>

<template>
  <table class="table">
    <thead>
      <tr>
        <th v-if="islogged" scope="col"></th>
        <th scope="col">timestamp</th>
        <th scope="col">name</th>
        <th scope="col">message</th>
        <th scope="col"></th>
        <th scope="col"></th>
        <th scope="col">amount</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="donation in donations.slice().reverse()" :key="donation.id" :class="(donation.read || 'notread')">
        <td v-if="islogged" class="read-cell"><button @click="markDonation(donation.id, !donation.read)" type="submit" class="btn btn-primary read-btn"><template v-if="donation.read">Unmark</template><template v-else>Mark</template></button></td>
        <td class="timestamp-cell">
          <div>{{ new Date(donation.timestamp).toLocaleDateString("fi-FI") }}</div>
          <div>{{ new Date(donation.timestamp).toLocaleTimeString("fi-FI") }}</div>
        </td>
        <td class="name-cell">
          {{ donation.name }}
          <span v-if="islogged" class="censor" @click="censorName(donation.id, donation.name)" title="sensuroi">🔞</span>
        </td>
        <td class="message-cell">
          <div class="message-inner">
            <span class="waiting-for-content" v-if="(!donation.message && config.emptyDonationLoadSeconds && new Date(donation.timestamp).getTime() > (Date.now() - 1000 * config.emptyDonationLoadSeconds))">
              * Odottaa viestiä *
            </span>
            {{ donation.message }}
          </div>
        </td>
        <td><span class="action-icon" @click="router.push(`/edit/donation/${donation.id}`)" title='Edit donation message'>✏️</span></td>
        <td>
          <div class="incentive_info">
            📄
            <div v-if="donation.incentives.length">
              <div v-for="incentive in donation.incentives" :key="incentive.code">
                <div v-for="chosen_incentive in incentive.chosen_incentives" :key="chosen_incentive.incentive_id">
                  <div v-if="incentives.length && games.length">
                    <h5>{{games.find(x => x.id === incentives.find(x => x.id === chosen_incentive.incentive_id).game_id).game}}</h5>
                    <h5>{{incentives.find(x => x.id === chosen_incentive.incentive_id).title}}:</h5>
                    <p>{{chosen_incentive.parameter}}
                    {{(donation.amount / donation.incentives.length /
                    incentive.chosen_incentives.length).toFixed(2)
                    }}e</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </td>
        <td class="amount-cell">{{ donation.amount }}e</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.name-cell {
  min-width: 18ch;
  max-width: 24ch;
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
.message-inner {
  max-height: 6em;
  overflow-y: auto;
  overflow-wrap: anywhere;
}
.amount-cell {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.action-icon {
  cursor: pointer;
}
</style>
