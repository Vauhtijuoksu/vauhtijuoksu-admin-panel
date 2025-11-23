<script setup>

import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/api'
import { formatTimestamp, parseAndValidate, nowFormatted } from '@/utils/datetime'
import { useCrud } from '@/composables/useCrud'

const router = useRouter()

const {
  items: games,
  selectedItem: selectedGame,
  changes,
  mode,
  getItems: getGames,
  openEdit,
  openAdd: openAddBase,
  toggleDelete: remove,
  removeAdded,
  saveChanges,
  changeView,
  applyChanges,
  isMarkedForDeletion,
  isEdited,
} = useCrud('/gamedata', (game) => {
  // Transform response: format timestamps
  game.start_time = formatTimestamp(game.start_time)
  game.end_time = formatTimestamp(game.end_time)
  delete game.players;
  return game;
});

const participants = ref([]);

const getParticipants = async () => {
  const response = await api.get('/participants');
  if (response?.data) {
    participants.value = response.data;
  }
};

const openAdd = () => {
  openAddBase({
    game: "Example Game Name",
    start_time: nowFormatted(),
    end_time: nowFormatted(),
    category: "example%",
    device: "PC (for example)",
    published: "2022 (for example)",
    img_filename: "example.png",
    meta: "8676 (twitch game id for example)",
    participants: [],
  });
};

const changesToProd = async () => {
  await applyChanges(async (patchData, postData) => {
    // Transform timestamps before sending to API
    for (const key in patchData) {
      patchData[key].start_time = parseAndValidate(patchData[key].start_time);
      patchData[key].end_time = parseAndValidate(patchData[key].end_time);
    }
    postData.forEach(game => {
      game.start_time = parseAndValidate(game.start_time);
      game.end_time = parseAndValidate(game.end_time);
    });
  });
  await getParticipants();
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

onMounted(() => {
  getGames();
  getParticipants();
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
        <h2>Game Data Management</h2>
        <div class="header-actions">
          <button @click="openAdd()" class="btn btn-success">
            Add New Game
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
          v-for="game in games" 
          :key="game.id" 
          class="item-card"
          :class="{ 'item-edited': isEdited(game), 'item-deleted': isMarkedForDeletion(game) }"
        >
          <div class="item-header">
            <h3>{{ game.game }}</h3>
            <div class="item-badges">
              <span v-if="isEdited(game)" class="badge badge-warning">Edited</span>
              <span v-if="isMarkedForDeletion(game)" class="badge badge-danger">Deleted</span>
            </div>
          </div>
          <div class="item-details">
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">{{ game.start_time }} - {{ game.end_time }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Category:</span>
              <span class="value">{{ game.category }}</span>
            </div>
          </div>
          <div class="item-actions">
            <button @click="openEdit(game)" class="btn btn-sm btn-primary">
              Edit
            </button>
            <button 
              @click="remove(game)" 
              :class="isMarkedForDeletion(game) ? 'btn btn-sm btn-secondary' : 'btn btn-sm btn-danger'"
            >
              {{ isMarkedForDeletion(game) ? 'Undo' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="changes.post.length > 0" class="pending-section">
        <h3>Pending New Games</h3>
        <div class="items-grid">
          <div v-for="game in changes.post" :key="game.game" class="item-card item-new">
            <div class="item-header">
              <h3>{{ game.game }}</h3>
              <span class="badge badge-success">New</span>
            </div>
            <div class="item-details">
              <div class="detail-row">
                <span class="label">Time:</span>
                <span class="value">{{ game.start_time }} - {{ game.end_time }}</span>
              </div>
            </div>
            <div class="item-actions">
              <button @click="removeAdded(game)" class="btn btn-sm btn-danger">
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
        <h2>{{ selectedGame.id ? 'Edit Game' : 'Add New Game' }}</h2>
        <div></div>
      </div>
      
      <form class="edit-form">
        <div class="form-section">
          <h3>Basic Information</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="game" class="form-label">Game Name *</label>
              <input 
                type="text" 
                class="form-control" 
                id="game" 
                v-model='selectedGame.game'
                placeholder="Enter game name"
                required
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="start_time" class="form-label">Start Time *</label>
              <input 
                type="text" 
                class="form-control" 
                id="start_time" 
                v-model='selectedGame.start_time'
                placeholder="d.M.yyyy HH:mm:ss"
              >
              <small class="form-text">Format: d.M.yyyy HH:mm:ss</small>
            </div>
            <div class="form-group">
              <label for="end_time" class="form-label">End Time *</label>
              <input 
                type="text" 
                class="form-control" 
                id="end_time" 
                v-model='selectedGame.end_time'
                placeholder="d.M.yyyy HH:mm:ss"
              >
              <small class="form-text">Format: d.M.yyyy HH:mm:ss</small>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Game Details</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="category" class="form-label">Category</label>
              <input type="text" class="form-control" id="category" v-model='selectedGame.category'>
            </div>
            <div class="form-group">
              <label for="device" class="form-label">Device</label>
              <input type="text" class="form-control" id="device" v-model='selectedGame.device'>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="published" class="form-label">Published</label>
              <input type="text" class="form-control" id="published" v-model='selectedGame.published'>
            </div>
            <div class="form-group">
              <label for="img_filename" class="form-label">Image Filename</label>
              <input type="text" class="form-control" id="img_filename" v-model='selectedGame.img_filename'>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="meta" class="form-label">Meta (Twitch Game ID)</label>
              <input type="text" class="form-control" id="meta" v-model='selectedGame.meta'>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Participants</h3>
          <div class="participants-list">
            <div 
              v-for="(participant, index) in selectedGame.participants" 
              :key="index"
              class="participant-row"
            >
              <div class="participant-select">
                <label>Player</label>
                <select class="form-select" v-model="participant.participant_id">
                  <option v-for="p in participants" :key="p.id" :value="p.id">
                    {{ p.display_name }}
                  </option>
                </select>
              </div>
              <div class="participant-role">
                <label>Role</label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="participant.role" 
                  placeholder="PLAYER, COMMENTATOR, HOST..."
                >
              </div>
              <button 
                type="button"
                @click="selectedGame.participants.splice(index, 1)" 
                class="btn btn-sm btn-danger"
              >
                Remove
              </button>
            </div>
          </div>
          <button 
            type="button"
            @click="selectedGame.participants.push({ participant_id: participants[0]?.id, role: 'PLAYER' })" 
            class="btn btn-sm btn-secondary"
          >
            Add Participant
          </button>
        </div>

        <div class="form-actions">
          <button @click.prevent="saveChanges()" class="btn btn-success">
            Save Changes
          </button>
          <button @click="changeView('list')" class="btn btn-secondary">
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

/* Component-specific styles */
.participants-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.participant-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 10px;
  align-items: end;
  padding: 10px;
  background: #1a1a1a;
  border-radius: 4px;
  border: 1px solid #444;
}

.participant-select, .participant-role {
  display: flex;
  flex-direction: column;
}

.participant-select label, .participant-role label {
  font-size: 0.85em;
  color: #bbb;
  margin-bottom: 4px;
  font-weight: 600;
}

.participant-row .form-control,
.participant-row .form-select {
  background: #2a2a2a;
  border: 1px solid #555;
  color: #e0e0e0;
}

.participant-row .form-control:focus,
.participant-row .form-select:focus {
  background: #333;
  border-color: #007bff;
}

@media (max-width: 768px) {
  .participant-row {
    grid-template-columns: 1fr;
  }
}
</style>
