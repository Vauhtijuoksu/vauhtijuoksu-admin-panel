<script setup>

import { ref, watch } from 'vue'
import axios from 'axios'
import { DateTime } from 'luxon';

const url = 'https://api.dev.vauhtijuoksu.fi';

const games = ref([]);
const incentives = ref([]);
const selectedIncentive = ref({})
const changes = ref({
  patch: {},
  post: [],
  delete: [],
});

const mode = ref("list");


watch(selectedIncentive, (newValue) => {
  if (newValue.type === 'open') {
    console.log('sdf')
  }

});

const getIncentives = () => {
  axios.get(`${url}/incentives`)
      .then((response) => {
        incentives.value = response.data;
        incentives.value.map(incentive => {
          incentive.end_time = new Date(incentive.end_time).toLocaleString("fi-FI")
        })
      }).catch((err) => {
    console.log(err);
  });
}

const getGames = () => {
  axios.get(`${url}/gamedata`)
      .then((response) => {
        games.value = response.data;
      }).catch((err) => {
    console.log(err);
  });
}

const postIncentive = async (incentive) => {
  return axios.post(`${url}/incentives`, incentive, {
    auth: {
      username: localStorage.getItem('username'),
      password: localStorage.getItem('password')
    }
  }).catch((err) => {
      console.log(err);
      alert("Something went wrong, refresh page and see damages")
    });
}

const deleteIncentive = async (id) => {
  return axios.delete(`${url}/incentives/${id}`, {
    auth: {
      username: localStorage.getItem('username'),
      password: localStorage.getItem('password')
    }
  }).catch((err) => {
      console.log(err);
      alert("Something went wrong, refresh page and see damages")
    });
}

const patchIncentive = async (id, incentive) => {
  return axios.patch(`${url}/incentives/${id}`, incentive, {
    auth: {
      username: localStorage.getItem('username'),
      password: localStorage.getItem('password')
    }
  }).catch((err) => {
    console.log(err);
    alert("Something went wrong, refresh page and see damages")
  });
}

const openEdit = (incentive) => {
  if (incentive.id in changes.value.patch) {
    selectedIncentive.value = changes.value.patch[incentive.id]
    selectedIncentive.value.id = incentive.id
  } else {
    selectedIncentive.value = { ...incentive }
  }
  mode.value = "form"
}

const openAdd = () => {
  selectedIncentive.value = {
    game_id: "",
    title: "example title",
    info: "example info",
    end_time: new Date().toLocaleString("fi-FI"),
    type: "open",
  }
  mode.value = "form"
}

const remove = (incentive) => {
  if (changes.value.delete.includes(incentive.id)) {
    changes.value.delete = changes.value.delete.filter(item => item !== incentive.id)
  } else {
    changes.value.delete.push(incentive.id)
  }
}

const removeAdded = (incentive) => {
  changes.value.post = changes.value.post.filter(item => item.title !== incentive.title)
}

const addMilestone = (incentive) => {
  if (incentive.milestones?.length > 0) {
    incentive.milestones.push(0)
  } else {
    incentive.milestones = [0]
  }
}

const addOptionParameter = (incentive) => {
  if (incentive.option_parameters?.length > 0) {
    incentive.option_parameters.push('foo')
  } else {
    incentive.option_parameters = ['foo']
  }
}

const saveChanges = () => {
  if ("id" in selectedIncentive.value) {
    changes.value.patch[selectedIncentive.value.id] = selectedIncentive.value
    changes.value.patch[selectedIncentive.value.id].id = undefined

    selectedIncentive.value = {}
  } else {
    changes.value.post.push(selectedIncentive.value)
  }
  mode.value = "list"
}

const changeView = (view) => {
  mode.value = view
}

const changesToProd = async () => {
  const conf = confirm('Do you want these changes to prod?');
  if (conf) {

    for (const key in changes.value.patch) {
      const end_time_temp = changes.value.patch[key].end_time;
      changes.value.patch[key].end_time = DateTime.fromFormat(end_time_temp, "d.M.y H.m.s", { locale: "fi" }).toISO();
      if (changes.value.patch[key].end_time == undefined) {
        alert("Timestamps where invalid, refresh page and try again, no changes where made to prod")
        throw Error("timestamps did not work out");
      }
    }
    changes.value.post.map(incentive => {
      incentive.end_time = DateTime.fromFormat(incentive.end_time, "d.M.y H.m.s", { locale: "fi" }).toISO();
      if (incentive.end_time == undefined) {
        alert("Timestamps where invalid, refresh page and try again, no changes where made to prod")
        throw Error("timestamps did not work out");
      }
    })

    for (const key in changes.value.patch) {
      await patchIncentive(key, changes.value.patch[key])
    }

    const posts = changes.value.post.map(incentive => postIncentive(incentive))
    const deletes = changes.value.delete.map(id => deleteIncentive(id))

    await Promise.all([...posts, ...deletes]);

    changes.value = {
      patch: {},
      post: [],
      delete: [],
    }
    getIncentives()
    getGames()
    changeView('list')
  }
}


getIncentives();
getGames();
</script>

<template>
  <div v-if="mode === 'list'">
    <tr v-for="incentive in incentives" :key="incentive.id">
          {{ incentive.title }} - 
          {{ incentive.end_time }}
          <span @click="openEdit(incentive)" title="editoi">🔧</span>
          <span @click="remove(incentive)" title="poista">❌</span>
          <template v-if="incentive.id in changes.patch">
            - edited
          </template>
          <template v-if="changes.delete.includes(incentive.id)">
            - deleted
          </template>
    </tr>

    <span @click="openAdd()" title="lisää uusi">🆕</span>  

    <tr v-for="incentive in changes.post" :key="incentive.title">
          {{ incentive.title }} - 
          {{ incentive.end_time }}
          <span @click="removeAdded(incentive)" title="poista lisättävä">❌</span>
    </tr>
    <div>
      <button @click="changeView('preview')" class="btn btn-primary">Preview changes</button>
    </div>
  </div>

  <div v-else-if="mode === 'form'">
    <form>
      <div class="mb-3">
          <label for="game" class="form-label">Game</label>
          <select class="form-select" v-model="selectedIncentive.game_id">
            <option value="">Nothing (game is not linked to this incentive)</option>
            <option v-for="game in games" :key="game.id" :value="game.id">
              {{ game.game }}
            </option>
          </select>
      </div>
      <div class="mb-3">
          <label for="title" class="form-label">Title</label>
          <input type="text" class="form-control" id="title" name="title" v-model='selectedIncentive.title'>
      </div>
      <div class="mb-3">
          <label for="info" class="form-label">Info</label>
          <input type="text" class="form-control" id="info" name="info" v-model='selectedIncentive.info'>
      </div>
      <div class="mb-3">
          <label for="end_time" class="form-label">End Time</label>
          <input type="text" class="form-control" id="end_time" name="end_time" v-model='selectedIncentive.end_time'>
      </div>
      <div v-if="selectedIncentive.id === undefined">
        <label for="type" class="form-label">Type</label>
        <div class="mb-3">
          <select id="type" name="type" class="form-select" v-model="selectedIncentive.type">
            <option value="milestone">milestone</option>
            <option value="option">option</option>
            <option value="open">open</option>
          </select>
        </div>
        <div v-if="selectedIncentive.type === 'open'" class="mb-3">
          <label for="open_char_limit" class="form-label">Open Char Limit</label>
          <input type="number" class="form-control" id="open_char_limit" name="open_char_limit" v-model='selectedIncentive.open_char_limit'>
        </div>
        <div v-if="selectedIncentive.type === 'milestone'" class="mb-3">
          <label for="milestones" class="form-label">Milestones</label>
          <div v-for="(_, index) in selectedIncentive.milestones">
            <input
              type="number" class="form-control" id="milestone"
              name="milestone" v-model='selectedIncentive.milestones[index]'
            >
            <span @click="selectedIncentive.milestones.splice(index, 1)" title="poista milestone">❌</span>
          </div>
          <span @click="addMilestone(selectedIncentive)" title="lisää uusi milestone">🆕</span>
        </div>
        <div v-if="selectedIncentive.type === 'option'" class="mb-3">
          <label for="option_parameters" class="form-label">Option Parameters</label>
          <div v-for="(_, index) in selectedIncentive.option_parameters">
            <input
              type="text" class="form-control" id="option_parameter"
              name="option_parameter" v-model='selectedIncentive.option_parameters[index]'
            >
            <span @click="selectedIncentive.option_parameters.splice(index, 1)" title="poista option parameter">❌</span>
          </div>
          <span @click="addOptionParameter(selectedIncentive)" title="lisää uusi option parameter">🆕</span>
        </div>
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
