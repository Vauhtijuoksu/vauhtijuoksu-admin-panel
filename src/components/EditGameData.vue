<script setup>

import { ref } from 'vue'
import axios from 'axios'
import { DateTime } from 'luxon';

const url = 'https://api.dev.vauhtijuoksu.fi';

const games = ref([]);
const participants = ref([]);
const selectedGame = ref({})
const changes = ref({
  patch: {},
  post: [],
  delete: [],
});

const mode = ref("list");

const getGames = () => {
  axios.get(`${url}/gamedata`)
      .then((response) => {
        games.value = response.data;
        games.value.map(game => {
          game.start_time = new Date(game.start_time).toLocaleString("fi-FI")
          game.end_time = new Date(game.end_time).toLocaleString("fi-FI")
        })
      }).catch((err) => {
    console.log(err);
  });
}

const postGame = async (game) => {
  return axios.post(`${url}/gamedata`, game, {
    auth: {
      username: localStorage.getItem('username'),
      password: localStorage.getItem('password')
    }
  }).catch((err) => {
      console.log(err);
      alert("Something went wrong, refresh page and see damages")
    });
}

const deleteGame = async (id) => {
  return axios.delete(`${url}/gamedata/${id}`, {
    auth: {
      username: localStorage.getItem('username'),
      password: localStorage.getItem('password')
    }
  }).catch((err) => {
      console.log(err);
      alert("Something went wrong, refresh page and see damages")
    });
}

const patchGame = async (id, game) => {
  return axios.patch(`${url}/gamedata/${id}`, game, {
    auth: {
      username: localStorage.getItem('username'),
      password: localStorage.getItem('password')
    }
  }).catch((err) => {
    console.log(err);
    alert("Something went wrong, refresh page and see damages")
  });
}

const getParticipants = () => {
  axios.get(`${url}/participants`)
      .then((response) => {
        participants.value = response.data;
      }).catch((err) => {
    console.log(err);
  });
}

const openEdit = (game) => {
  if (game.id in changes.value.patch) {
    selectedGame.value = changes.value.patch[game.id]
    selectedGame.value.id = game.id
  } else {
    selectedGame.value = { ...game }
  }
  mode.value = "form"
}

const openAdd = () => {
  selectedGame.value = {
    game: "Example Game Name",
    start_time: new Date().toLocaleString("fi-FI"),
    end_time: new Date().toLocaleString("fi-FI"),
    category: "example%",
    device: "PC (for example)",
    published: "2022 (for example)",
    img_filename: "example.png",
    meta: "8676 (twitch game id for example)",
    participants: [],
  }
  mode.value = "form"
}

const remove = (game) => {
  if (changes.value.delete.includes(game.id)) {
    changes.value.delete = changes.value.delete.filter(item => item !== game.id)
  } else {
    changes.value.delete.push(game.id)
  }
}

const removeAdded = (game) => {
  changes.value.post = changes.value.post.filter(item => item.game !== game.game)
}


const saveChanges = () => {
  if ("id" in selectedGame.value) {
    changes.value.patch[selectedGame.value.id] = selectedGame.value
    changes.value.patch[selectedGame.value.id].id = undefined

    selectedGame.value = {}
  } else {
    changes.value.post.push(selectedGame.value)
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
      const start_time_temp = changes.value.patch[key].start_time;
      const end_time_temp = changes.value.patch[key].end_time;
      changes.value.patch[key].start_time = DateTime.fromFormat(start_time_temp.replace(' klo', ''), "d.M.yyyy HH.mm.ss", { locale: "fi" }).toISO();
      changes.value.patch[key].end_time = DateTime.fromFormat(end_time_temp.replace(' klo', ''), "d.M.yyyy HH.mm.ss", { locale: "fi" }).toISO();
      if (changes.value.patch[key].end_time == undefined || changes.value.patch[key].start_time == undefined) {
        alert("Timestamps where invalid, refresh page and try again, no changes where made to prod")
        throw Error("timestamps did not work out");
      }
    }
    changes.value.post.map(game => {
      game.start_time = DateTime.fromFormat(game.start_time.replace(' klo', ''), "d.M.yyyy HH.mm.ss", { locale: "fi" }).toISO();
      game.end_time = DateTime.fromFormat(game.end_time.replace(' klo', ''), "d.M.yyyy HH.mm.ss", { locale: "fi" }).toISO();
      if (game.end_time == undefined || game.start_time == undefined) {
        alert("Timestamps where invalid, refresh page and try again, no changes where made to prod")
        throw Error("timestamps did not work out");
      }
    })

    for (const key in changes.value.patch) {
      await patchGame(key, changes.value.patch[key])
    }

    const posts = changes.value.post.map(game => postGame(game))
    const deletes = changes.value.delete.map(id => deleteGame(id))

    await Promise.all([...posts, ...deletes]);

    changes.value = {
      patch: {},
      post: [],
      delete: [],
    }
    getParticipants()
    getGames()
    changeView('list')
  }
}


getGames();
getParticipants();
</script>

<template>
  <div v-if="mode === 'list'">
    <tr v-for="game in games" :key="game.id">
          {{ game.game }}
          {{ game.start_time }} -
          {{ game.end_time }}
          <span @click="openEdit(game)" title="editoi">🔧</span>
          <span @click="remove(game)" title="poista">❌</span>
          <template v-if="game.id in changes.patch">
            - edited
          </template>
          <template v-if="changes.delete.includes(game.id)">
            - deleted
          </template>
    </tr>

    <span @click="openAdd()" title="lisää uusi">🆕</span>  

    <tr v-for="game in changes.post" :key="game.game">
          {{ game.game }}
          {{ game.start_time }} -
          {{ game.end_time }}
          <span @click="removeAdded(game)" title="poista lisättävä">❌</span>
    </tr>
    <div>
      <button @click="changeView('preview')" class="btn btn-primary">Preview changes</button>
    </div>
  </div>

  <div v-else-if="mode === 'form'">
    <form>
      <div class="mb-3">
          <label for="game" class="form-label">Game</label>
          <input type="text" class="form-control" id="game" name="game" v-model='selectedGame.game'>
      </div>
      <div class="mb-3">
          <label for="start_time" class="form-label">Start Time</label>
          <input type="text" class="form-control" id="start_time" name="start_time" v-model='selectedGame.start_time'>
      </div>
      <div class="mb-3">
          <label for="end_time" class="form-label">End Time</label>
          <input type="text" class="form-control" id="end_time" name="end_time" v-model='selectedGame.end_time'>
      </div>
      <div class="mb-3">
          <label for="category" class="form-label">Category</label>
          <input type="text" class="form-control" id="category" name="category" v-model='selectedGame.category'>
      </div>
      <div class="mb-3">
          <label for="device" class="form-label">Device</label>
          <input type="text" class="form-control" id="device" name="device" v-model='selectedGame.device'>
      </div>
      <div class="mb-3">
          <label for="published" class="form-label">Published</label>
          <input type="text" class="form-control" id="published" name="published" v-model='selectedGame.published'>
      </div>
      <div class="mb-3">
          <label for="img_filename" class="form-label">Img Filename</label>
          <input type="text" class="form-control" id="img_filename" name="img_filename" v-model='selectedGame.img_filename'>
      </div>
      <div class="mb-3">
          <label for="meta" class="form-label">Meta</label>
          <input type="text" class="form-control" id="meta" name="meta" v-model='selectedGame.meta'>
      </div>
      <div class="mb-3">
        <label for="participants" class="form-label">Participants</label>
        <div v-for="(participant, index) in selectedGame.participants" :key="index">
          <select class="form-select" v-model="participant.participant_id">
            <option v-for="p in participants" :key="p.id" :value="p.id">
              {{ p.display_name }}
            </option>
          </select>
          <input type="text" class="form-control" v-model="participant.role" placeholder="Role (e.g., PLAYER, COMMENTATOR, HOST)">
          <span @click="selectedGame.participants.splice(index, 1)" title="poista osallistuja">❌</span>
        </div>
        <span @click="selectedGame.participants.push({ participant_id: participants[0]?.id, role: 'PLAYER' })" title="lisää uusi osallistuja">🆕</span>
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
