<script setup>

import { ref, watch, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/api'
import { formatTimestamp, parseAndValidate, nowFormatted } from '@/utils/datetime'
import { useCrud } from '@/composables/useCrud'

const router = useRouter()

const {
  items: incentives,
  selectedItem: selectedIncentive,
  changes,
  mode,
  getItems: getIncentives,
  openEdit,
  openAdd: openAddBase,
  toggleDelete: remove,
  removeAdded,
  saveChanges: saveChangesBase,
  changeView,
  applyChanges,
  isMarkedForDeletion,
  isEdited,
} = useCrud('/incentives', (incentive) => {
  // Transform response: format timestamps
  incentive.end_time = formatTimestamp(incentive.end_time)
  return incentive;
});

const games = ref([]);

const getGames = async () => {
  const response = await api.get('/gamedata');
  if (response?.data) {
    games.value = response.data;
  }
};

const openAdd = () => {
  openAddBase({
    game_id: games.value[0]?.id,
    title: "Example Title",
    info: "Example info text",
    end_time: nowFormatted(),
    type: "open",
  });
};

const addMilestone = (incentive) => {
  if (incentive.milestones?.length > 0) {
    incentive.milestones.push(0)
  } else {
    incentive.milestones = [0]
  }
};

const addOptionParameter = (incentive) => {
  if (incentive.option_parameters?.length > 0) {
    incentive.option_parameters.push('New Option')
  } else {
    incentive.option_parameters = ['New Option']
  }
};

const saveChanges = () => {
  if ("id" in selectedIncentive.value) {
    changes.value.patch[selectedIncentive.value.id] = {
      game_id: selectedIncentive.value.game_id,
      title: selectedIncentive.value.title,
      info: selectedIncentive.value.info,
      end_time: selectedIncentive.value.end_time,
    }
    selectedIncentive.value = {}
  } else {
    changes.value.post.push(selectedIncentive.value)
  }
  mode.value = "list"
};

const changesToProd = async () => {
  await applyChanges(async (patchData, postData) => {
    // Transform timestamps before sending to API
    for (const key in patchData) {
      patchData[key].end_time = parseAndValidate(patchData[key].end_time);
    }
    postData.forEach(incentive => {
      incentive.end_time = parseAndValidate(incentive.end_time);
    });
  });
  await getGames();
};

const hasChanges = computed(() => {
  return Object.keys(changes.value.patch).length > 0 || 
         changes.value.post.length > 0 || 
         changes.value.delete.length > 0;
});

const changeCount = computed(() => {
  return Object.keys(changes.value.patch).length + 
         changes.value.post.length + 
         changes.value.delete.length;
});

const getGameName = (gameId) => {
  return games.value.find(g => g.id === gameId)?.game || 'Unknown Game';
};

onMounted(() => {
  getIncentives();
  getGames();
});
</script>

<template>
  <div class="edit-container">
    <!-- LIST VIEW -->
    <div v-if="mode === 'list'" class="list-view">
      <div class="header">
        <div>
          <button @click="router.push('/edit')" class="btn btn-back">← Back to Main</button>
        </div>
        <h2>Incentives Management</h2>
        <div class="header-actions">
          <button @click="openAdd()" class="btn btn-success">
            Add New Incentive
          </button>
          <button 
            v-if="hasChanges" 
            @click="changeView('preview')" 
            class="btn btn-warning"
          >
            Preview Changes ({{ changeCount }})
          </button>
        </div>
      </div>

      <div class="items-grid">
        <div 
          v-for="incentive in incentives" 
          :key="incentive.id" 
          class="item-card"
          :class="{ 'item-edited': isEdited(incentive), 'item-deleted': isMarkedForDeletion(incentive) }"
        >
          <div class="item-header">
            <h3>{{ incentive.title }}</h3>
            <div class="item-badges">
              <span v-if="isEdited(incentive)" class="badge badge-warning">Edited</span>
              <span v-if="isMarkedForDeletion(incentive)" class="badge badge-danger">Deleted</span>
              <span v-if="incentive.type" class="badge badge-info">{{ incentive.type }}</span>
            </div>
          </div>
          <div class="item-details">
            <div class="detail-row" v-if="incentive.game_id">
              <span class="label">Game:</span>
              <span class="value">{{ getGameName(incentive.game_id) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Ends:</span>
              <span class="value">{{ incentive.end_time }}</span>
            </div>
            <div class="detail-row" v-if="incentive.info">
              <span class="label">Info:</span>
              <span class="value">{{ incentive.info }}</span>
            </div>
          </div>
          <div class="item-actions">
            <button @click="openEdit(incentive)" class="btn btn-sm btn-primary">
              Edit
            </button>
            <button 
              @click="remove(incentive)" 
              :class="isMarkedForDeletion(incentive) ? 'btn btn-sm btn-secondary' : 'btn btn-sm btn-danger'"
            >
              {{ isMarkedForDeletion(incentive) ? 'Undo' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="changes.post.length > 0" class="pending-section">
        <h3>Pending New Incentives</h3>
        <div class="items-grid">
          <div v-for="incentive in changes.post" :key="incentive.title" class="item-card item-new">
            <div class="item-header">
              <h3>{{ incentive.title }}</h3>
              <div class="item-badges">
                <span class="badge badge-success">New</span>
                <span v-if="incentive.type" class="badge badge-info">{{ incentive.type }}</span>
              </div>
            </div>
            <div class="item-details">
              <div class="detail-row">
                <span class="label">Ends:</span>
                <span class="value">{{ incentive.end_time }}</span>
              </div>
            </div>
            <div class="item-actions">
              <button @click="removeAdded(incentive)" class="btn btn-sm btn-danger">
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FORM VIEW -->
    <div v-else-if="mode === 'form'" class="form-view">
      <div class="form-header header-with-back">
        <button @click="changeView('list')" class="btn btn-back">
          ← Back
        </button>
        <h2>{{ selectedIncentive.id ? 'Edit Incentive' : 'Add New Incentive' }}</h2>
        <div></div>
      </div>
      
      <form class="edit-form">
        <div class="form-section">
          <h3>Basic Information</h3>
          
          <div class="form-row" v-if="'game_id' in selectedIncentive || !selectedIncentive.id">
            <div class="form-group" style="grid-column: 1 / -1;">
              <label for="game" class="form-label">Associated Game</label>
              <div class="game-selector">
                <select 
                  v-if="'game_id' in selectedIncentive" 
                  class="form-select" 
                  v-model="selectedIncentive.game_id"
                >
                  <option v-for="game in games" :key="game.id" :value="game.id">
                    {{ game.game }}
                  </option>
                </select>
                <button 
                  v-if="'game_id' in selectedIncentive"
                  type="button"
                  @click="delete selectedIncentive.game_id" 
                  class="btn btn-sm btn-danger"
                >
                  Remove Game Link
                </button>
                <button 
                  v-if="!('game_id' in selectedIncentive)"
                  type="button"
                  @click="selectedIncentive.game_id = games[0]?.id" 
                  class="btn btn-sm btn-success"
                >
                  Link to Game
                </button>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="title" class="form-label">Title *</label>
              <input 
                type="text" 
                class="form-control" 
                id="title" 
                v-model='selectedIncentive.title'
                placeholder="Enter incentive title"
                required
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="info" class="form-label">Info/Description</label>
              <textarea 
                class="form-control" 
                id="info" 
                v-model='selectedIncentive.info'
                rows="3"
                placeholder="Additional information about this incentive"
              ></textarea>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="end_time" class="form-label">End Time *</label>
              <input 
                type="text" 
                class="form-control" 
                id="end_time" 
                v-model='selectedIncentive.end_time'
                placeholder="d.M.yyyy HH:mm:ss"
              >
              <small class="form-text">Format: d.M.yyyy HH:mm:ss</small>
            </div>
          </div>
        </div>

        <!-- TYPE SPECIFIC FIELDS (only for new incentives) -->
        <div v-if="selectedIncentive.id === undefined" class="form-section">
          <h3>Incentive Type Configuration</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="type" class="form-label">Type *</label>
              <select id="type" class="form-select" v-model="selectedIncentive.type">
                <option value="open">Open (Free text)</option>
                <option value="milestone">Milestone (Goals)</option>
                <option value="option">Option (Multiple choice)</option>
              </select>
            </div>
          </div>

          <!-- OPEN TYPE -->
          <div v-if="selectedIncentive.type === 'open'" class="type-config">
            <div class="form-row">
              <div class="form-group">
                <label for="open_char_limit" class="form-label">Character Limit</label>
                <input 
                  type="number" 
                  class="form-control" 
                  id="open_char_limit" 
                  v-model='selectedIncentive.open_char_limit'
                  placeholder="e.g., 100"
                >
                <small class="form-text">Maximum number of characters allowed</small>
              </div>
            </div>
          </div>

          <!-- MILESTONE TYPE -->
          <div v-if="selectedIncentive.type === 'milestone'" class="type-config">
            <label class="form-label">Milestone Amounts (€)</label>
            <div class="milestone-list">
              <div 
                v-for="(milestone, index) in selectedIncentive.milestones" 
                :key="index"
                class="milestone-item"
              >
                <input
                  type="number" 
                  class="form-control" 
                  v-model='selectedIncentive.milestones[index]'
                  placeholder="Amount in €"
                  step="0.01"
                >
                <button 
                  type="button"
                  @click="selectedIncentive.milestones.splice(index, 1)" 
                  class="btn btn-sm btn-danger"
                >
                  Remove
                </button>
              </div>
            </div>
            <button 
              type="button"
              @click="addMilestone(selectedIncentive)" 
              class="btn btn-sm btn-secondary"
            >
              Add Milestone
            </button>
          </div>

          <!-- OPTION TYPE -->
          <div v-if="selectedIncentive.type === 'option'" class="type-config">
            <label class="form-label">Options</label>
            <div class="option-list">
              <div 
                v-for="(option, index) in selectedIncentive.option_parameters" 
                :key="index"
                class="option-item"
              >
                <input
                  type="text" 
                  class="form-control" 
                  v-model='selectedIncentive.option_parameters[index]'
                  placeholder="Option text"
                >
                <button 
                  type="button"
                  @click="selectedIncentive.option_parameters.splice(index, 1)" 
                  class="btn btn-sm btn-danger"
                >
                  Remove
                </button>
              </div>
            </div>
            <button 
              type="button"
              @click="addOptionParameter(selectedIncentive)" 
              class="btn btn-sm btn-secondary"
            >
              Add Option
            </button>
          </div>
        </div>

        <div class="form-actions">
          <button @click.prevent="saveChanges()" class="btn btn-success">
            Save Changes
          </button>
          <button type="button" @click="changeView('list')" class="btn btn-secondary">
            Discard
          </button>
        </div>
      </form>
    </div>

    <!-- PREVIEW VIEW -->
    <div v-else-if="mode === 'preview'" class="preview-view">
      <div class="preview-header">
        <h2>Preview Changes</h2>
        <p class="text-muted">Review your changes before applying them to production</p>
      </div>

      <div class="preview-section" v-if="Object.keys(changes.patch).length > 0">
        <h3>Updates ({{ Object.keys(changes.patch).length }})</h3>
        <pre class="preview-code">{{ JSON.stringify(changes.patch, null, 2) }}</pre>
      </div>

      <div class="preview-section" v-if="changes.post.length > 0">
        <h3>New Items ({{ changes.post.length }})</h3>
        <pre class="preview-code">{{ JSON.stringify(changes.post, null, 2) }}</pre>
      </div>

      <div class="preview-section" v-if="changes.delete.length > 0">
        <h3>Deletions ({{ changes.delete.length }})</h3>
        <pre class="preview-code">{{ JSON.stringify(changes.delete, null, 2) }}</pre>
      </div>

      <div class="preview-actions">
        <button @click="changeView('list')" class="btn btn-secondary">
          ← Back to List
        </button>
        <button @click="changesToProd()" class="btn btn-danger">
          Apply Changes
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/css/edit-styles.css';

.game-selector {
  display: flex;
  gap: 10px;
  align-items: center;
}

.game-selector .form-select {
  flex: 1;
}

.type-config {
  margin-top: 20px;
  padding: 15px;
  background: #1a1a1a;
  border-radius: 6px;
  border: 2px dashed #555;
}

.milestone-list,
.option-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
  margin-top: 10px;
}

.milestone-item,
.option-item {
  display: flex;
  gap: 10px;
  align-items: center;
}

.milestone-item .form-control,
.option-item .form-control {
  flex: 1;
}

.badge-info {
  background: #17a2b8;
  color: white;
}

textarea.form-control {
  resize: vertical;
  min-height: 80px;
}
</style>
