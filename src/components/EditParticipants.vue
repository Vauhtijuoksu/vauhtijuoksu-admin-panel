<script setup>

import { ref, computed } from 'vue'
import axios from 'axios'

const url = 'https://api.dev.vauhtijuoksu.fi';

const participants = ref([]);
const selectedParticipant = ref({})
const changes = ref({
  patch: {},
  post: [],
  delete: [],
});

const mode = ref("list");

const getParticipants = () => {
  axios.get(`${url}/participants`)
      .then((response) => {
        participants.value = response.data;
      }).catch((err) => {
    console.log(err);
  });
}

const postParticipant = async (participant) => {
  return axios.post(`${url}/participants`, participant, {
    auth: {
      username: localStorage.getItem('username'),
      password: localStorage.getItem('password')
    }
  }).catch((err) => {
      console.log(err);
      alert("Something went wrong, refresh page and see damages")
    });
}

const deleteParticipant = async (id) => {
  return axios.delete(`${url}/participants/${id}`, {
    auth: {
      username: localStorage.getItem('username'),
      password: localStorage.getItem('password')
    }
  }).catch((err) => {
      console.log(err);
      alert("Something went wrong, refresh page and see damages")
    });
}

const patchParticipant = async (id, participant) => {
  return axios.patch(`${url}/participants/${id}`, participant, {
    auth: {
      username: localStorage.getItem('username'),
      password: localStorage.getItem('password')
    }
  }).catch((err) => {
    console.log(err);
    alert("Something went wrong, refresh page and see damages")
  });
}

const openEdit = (participant) => {
  if (participant.id in changes.value.patch) {
    selectedParticipant.value = changes.value.patch[participant.id]
    selectedParticipant.value.id = participant.id
  } else {
    selectedParticipant.value = JSON.parse(JSON.stringify(participant))
  }
  // Ensure social_medias array exists and has the expected structure
  if (!selectedParticipant.value.social_medias) {
    selectedParticipant.value.social_medias = []
  }
  if (!selectedParticipant.value.social_medias.find(s => s.platform === "TWITCH")) {
    selectedParticipant.value.social_medias.push({ platform: "TWITCH", username: "" })
  }
  if (!selectedParticipant.value.social_medias.find(s => s.platform === "DISCORD")) {
    selectedParticipant.value.social_medias.push({ platform: "DISCORD", username: "" })
  }
  mode.value = "form"
}

const openAdd = () => {
  selectedParticipant.value = {
    display_name: "Pelaajan nick",
    social_medias: [
      { platform: "TWITCH", username: "" },
      { platform: "DISCORD", username: "" }
    ]
  }
  mode.value = "form"
}

const remove = (participant) => {
  if (changes.value.delete.includes(participant.id)) {
    changes.value.delete = changes.value.delete.filter(item => item !== participant.id)
  } else {
    changes.value.delete.push(participant.id)
  }
}

const removeAdded = (participant) => {
  changes.value.post = changes.value.post.filter(item => item.display_name !== participant.display_name)
}


const saveChanges = () => {
  if ("id" in selectedParticipant.value) {
    changes.value.patch[selectedParticipant.value.id] = selectedParticipant.value
    changes.value.patch[selectedParticipant.value.id].id = undefined

    selectedParticipant.value = {}
  } else {
    changes.value.post.push(selectedParticipant.value)
  }
  mode.value = "list"
}

const changeView = (view) => {
  mode.value = view
}

// Computed properties for social media usernames
const twitchUsername = computed({
  get: () => {
    const twitch = selectedParticipant.value.social_medias?.find(s => s.platform === "TWITCH")
    return twitch ? twitch.username : ""
  },
  set: (value) => {
    const twitch = selectedParticipant.value.social_medias?.find(s => s.platform === "TWITCH")
    if (twitch) {
      twitch.username = value
    }
  }
})

const discordUsername = computed({
  get: () => {
    const discord = selectedParticipant.value.social_medias?.find(s => s.platform === "DISCORD")
    return discord ? discord.username : ""
  },
  set: (value) => {
    const discord = selectedParticipant.value.social_medias?.find(s => s.platform === "DISCORD")
    if (discord) {
      discord.username = value
    }
  }
})

const changesToProd = async () => {
  const conf = confirm('Do you want these changes to prod?');
  if (conf){

    for (const key in changes.value.patch) {
      await patchParticipant(key, changes.value.patch[key])
    }

    const posts = changes.value.post.map(participant => postParticipant(participant))
    const deletes = changes.value.delete.map(id => deleteParticipant(id))

    await Promise.all([...posts, ...deletes]);

    changes.value = {
      patch: {},
      post: [],
      delete: [],
    }
    getParticipants()
    changeView('list')
  }
}

getParticipants();
</script>

<template>
  <div v-if="mode === 'list'">
    <tr v-for="participant in participants" :key="participant.id">
          {{ participant.display_name }}
          <span @click="openEdit(participant)" title="editoi">🔧</span>
          <span @click="remove(participant)" title="poista">❌</span>
          <template v-if="participant.id in changes.patch">
            - edited
          </template>
          <template v-if="changes.delete.includes(participant.id)">
            - deleted
          </template>
    </tr>

    <span @click="openAdd()" title="lisää uusi">🆕</span>

    <tr v-for="participant in changes.post" :key="participant.display_name">
          {{ participant.display_name }}
          <span @click="removeAdded(participant)" title="poista lisättävä">❌</span>
    </tr>
    <div>
      <button @click="changeView('preview')" class="btn btn-primary">Preview changes</button>
    </div>
  </div>

  <div v-else-if="mode === 'form'">
    <form>
      <div class="mb-3">
          <label for="display_name" class="form-label">Display Name</label>
          <input type="text" class="form-control" id="display_name" name="display_name" v-model='selectedParticipant.display_name'>
      </div>
      <div class="mb-3">
          <label for="twitch_username" class="form-label">Twitch Username</label>
          <input type="text" class="form-control" id="twitch_username" name="twitch_username" v-model='twitchUsername'>
      </div>
      <div class="mb-3">
          <label for="discord_username" class="form-label">Discord Username</label>
          <input type="text" class="form-control" id="discord_username" name="discord_username" v-model='discordUsername'>
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
