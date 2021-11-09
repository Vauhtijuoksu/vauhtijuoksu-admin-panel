<script setup>
import {onMounted, ref, toRefs, watch} from 'vue'
import axios from 'axios'

const props = defineProps({
  url: String,
  legacyurl: String,
  donations: Object
})

const { url, legacyurl, donations } = toRefs(props);

const incentiveinfo = ref({});

const username = ref(localStorage.getItem('username'));



let islogged = ref(false);
onMounted(()=> {
  if (username.value) {
    islogged.value = true
  }
})

const getIncentiveInfo = () => {
  axios.get(`${legacyurl.value}/api/incentive_code_info`)
      .then((response) => {
        incentiveinfo.value = response.data;
      }).catch((err) => {
    console.log(err);
  });
  setTimeout(getIncentiveInfo, 3000);
}
getIncentiveInfo()


const markDonation = (id, readValue) => {
  axios.patch(`${url.value}/donations/${id}`, {read: readValue}, {
              auth: {
                username: localStorage.getItem('username'),
                password: localStorage.getItem('password')
              }
            })
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
        <td>
          <div class="incentive_info">
            📄
            <div v-if="donation.message">
              <div v-for="code in Object.keys(incentiveinfo)">
                <div v-if="donation.message.includes(code)">
                  <div v-for="info in incentiveinfo[code]">
                    {{ info }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </td>
        <td>{{ donation.amount }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
</style>
