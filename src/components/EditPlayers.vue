<script setup>

import { ref } from 'vue'
import axios from 'axios'

const url = 'https://api.dev.vauhtijuoksu.fi';

const players = ref([]);
const selectedPlayer = ref({})
const changes = ref({
  patch: {},
  post: [],
  delete: [],
});

const mode = ref("list");

const getPlayers = () => {
  axios.get(`${url}/players`)
      .then((response) => {
        players.value = response.data;
      }).catch((err) => {
    console.log(err);
  });
}

const postPlayer = async (player) => {
  return axios.post(`${url}/players`, player, {
    auth: {
      username: localStorage.getItem('username'),
      password: localStorage.getItem('password')
    }
  }).catch((err) => {
      console.log(err);
      alert("Something went wrong, refresh page and see damages")
    });
}

const deletePlayer = async (id) => {
  return axios.delete(`${url}/players/${id}`, {
    auth: {
      username: localStorage.getItem('username'),
      password: localStorage.getItem('password')
    }
  }).catch((err) => {
      console.log(err);
      alert("Something went wrong, refresh page and see damages")
    });
}

const patchPlayer = async (id, player) => {
  return axios.patch(`${url}/players/${id}`, player, {
    auth: {
      username: localStorage.getItem('username'),
      password: localStorage.getItem('password')
    }
  }).catch((err) => {
    console.log(err);
    alert("Something went wrong, refresh page and see damages")
  });
}

const openEdit = (player) => {
  if (player.id in changes.value.patch) {
    selectedPlayer.value = changes.value.patch[player.id]
    selectedPlayer.value.id = player.id
  } else {
    selectedPlayer.value = { ...player }
  }
  mode.value = "form"
}

const openAdd = () => {
  selectedPlayer.value = {
    display_name: "Pelaajan nick",
  }
  mode.value = "form"
}

const remove = (player) => {
  if (changes.value.delete.includes(player.id)) {
    changes.value.delete = changes.value.delete.filter(item => item !== player.id)
  } else {
    changes.value.delete.push(player.id)
  }
}

const removeAdded = (player) => {
  changes.value.post = changes.value.post.filter(item => item.display_name !== player.display_name)
}


const saveChanges = () => {
  if ("id" in selectedPlayer.value) {
    changes.value.patch[selectedPlayer.value.id] = selectedPlayer.value
    changes.value.patch[selectedPlayer.value.id].id = undefined

    selectedPlayer.value = {}
  } else {
    changes.value.post.push(selectedPlayer.value)
  }
  mode.value = "list"
}

const changeView = (view) => {
  mode.value = view
}

const changesToProd = async () => {
  const conf = confirm('Do you want these changes to prod?');
  if (conf){

    for (const key in changes.value.patch) {
      await patchPlayer(key, changes.value.patch[key])
    }

    const posts = changes.value.post.map(player => postPlayer(player))
    const deletes = changes.value.delete.map(id => deletePlayer(id))

    await Promise.all([...posts, ...deletes]);

    changes.value = {
      patch: {},
      post: [],
      delete: [],
    }
    getPlayers()
    changeView('list')
  }
}

getPlayers();
</script>

<template>
  <div v-if="mode === 'list'">
    <tr v-for="player in players" :key="player.id">
          {{ player.display_name }}
          <span @click="openEdit(player)" title="editoi">🔧</span>
          <span @click="remove(player)" title="poista">❌</span>
          <template v-if="player.id in changes.patch">
            - edited
          </template>
          <template v-if="changes.delete.includes(player.id)">
            - deleted
          </template>
    </tr>

    <span @click="openAdd()" title="lisää uusi">🆕</span>  

    <tr v-for="player in changes.post" :key="player.display_name">
          {{ player.display_name }}
          <span @click="removeAdded(player)" title="poista lisättävä">❌</span>
    </tr>
    <div>
      <button @click="changeView('preview')" class="btn btn-primary">Preview changes</button>
    </div>
  </div>

  <div v-else-if="mode === 'form'">
    <form>
      <div class="mb-3">
          <label for="display_name" class="form-label">Display Name</label>
          <input type="text" class="form-control" id="display_name" name="display_name" v-model='selectedPlayer.display_name'>
      </div>
      <div class="mb-3">
          <label for="twitch_channel" class="form-label">Twitch Channel</label>
          <input type="text" class="form-control" id="twitch_channel" name="twitch_channel" v-model='selectedPlayer.twitch_channel'>
      </div>
      <div class="mb-3">
          <label for="discord_nick" class="form-label">Discord Nick</label>
          <input type="text" class="form-control" id="discord_nick" name="discord_nick" v-model='selectedPlayer.discord_nick'>
      </div>
      <button @click.prevent="saveChanges()" class="btn btn-primary">Submit</button>
      <button @click="changeView('list')" class="btn btn-primary">Discard</button>
    </form>
  </div>

  <div v-else-if="mode === 'preview'">
    <h3>PATCH</h3>
    <pre>{{ JSON.stringify(changes.patch, null, 2) }}</pre>
    <h3>POST</h3>
    <pre>{{ JSON.stringify(changes.post, null, 2) }}</pre>
    <h3>DELETE</h3>
    <pre>{{ JSON.stringify(changes.delete, null, 2) }}</pre>
    <button @click="changeView('list')" class="btn btn-primary">Back to list</button>
    <button @click="changesToProd()" class="btn btn-danger">Make changes to prod</button>
  </div>
</template>

<style>
</style>
