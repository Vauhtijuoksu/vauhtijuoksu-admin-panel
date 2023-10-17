<script setup>
import {onMounted, ref, toRefs, watch} from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const props = defineProps({
  url: String,
  games: Object,
  donations: Object,
  incentives: Object
})

const router = useRouter()

const { url, games, donations, incentives } = toRefs(props);


const username = ref(localStorage.getItem('username'));



let islogged = ref(false);
onMounted(()=> {
  if (username.value) {
    islogged.value = true
  }
})



const markDonation = (id, readValue) => {
  axios.patch(`${url.value}/donations/${id}`, {read: readValue}, { withCredentials: true })
    .then(() => {
      let obj = donations.value.find(x => x.id === id);
      let index = donations.value.indexOf(obj);
      donations.value.fill(obj.read=readValue, index, index++);
    }).catch((err) => {
      console.log(err);
    });
}

const censorName = (id, name) => {
  let conf = confirm('Haluatko sensuroida käyttäjänimen ' + name + '?');
  if (conf){
    axios.patch(`${url.value}/donations/${id}`, {name: 'höpö'}, {
                auth: {
                  username: localStorage.getItem('username'),
                  password: localStorage.getItem('password')
                }
              })
      .then((response) => {
        console.log(response)
      }).catch((err) => {
        console.log(err);
      });
  }
}

</script>

<template>
  <table class="table">
    <thead>
      <tr>
        <th scope="col">ID</th>
        <th v-if="islogged" scope="col">read</th>
        <th scope="col">timestamp</th>
        <th v-if="islogged"  scope="col"></th>
        <th scope="col">name</th>
        <th scope="col">message</th>
        <th scope="col">edit</th>
        <th scope="col">codeinfo</th>
        <th scope="col">amount</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="donation in donations.slice().reverse()" :key="donation.id" :class="(donation.read || 'notread')">
        <td><span :title='donation.id'>🆔</span><span :title=' donation.external_id '>🐼</span></td>
        <td v-if="islogged"><button @click="markDonation(donation.id, !donation.read)" type="submit" class="btn btn-primary"><template v-if="donation.read">Unmark</template><template v-else>Mark</template></button></td>
        <td>{{ new Date(donation.timestamp).toLocaleString("fi-FI") }}</td>
        <td v-if="islogged"><span @click="censorName(donation.id, donation.name)" title="sensuroi">🔞</span></td>
        <td>{{ donation.name }}</td>
        <td>{{ donation.message }}</td>
        <td><span @click="router.push(`/edit/donation/${donation.id}`)" title='Edit donation message'>✏️</span></td>
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
        <td>{{ donation.amount }}e</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
</style>
