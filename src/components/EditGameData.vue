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

const getParticipantName = (participantId) => {
  const participant = participants.value.find(p => p.id === participantId);
  return participant?.display_name || 'Unknown';
};

// Get unique values for autocomplete
const uniqueDevices = computed(() => {
  const devices = games.value.map(g => g.device).filter(d => d);
  return [...new Set(devices)].sort();
});

const uniqueImageFilenames = computed(() => {
  const filenames = games.value.map(g => g.img_filename).filter(f => f);
  return [...new Set(filenames)].sort();
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

      <div class="games-list-compact">
        <div 
          v-for="game in games" 
          :key="game.id" 
          class="game-row-compact"
          :class="{ 'row-edited': isEdited(game), 'row-deleted': isMarkedForDeletion(game) }"
        >
          <div class="game-info">
            <div class="game-header-compact">
              <span class="game-title">{{ game.game }}</span>
              <span v-if="isEdited(game)" class="badge badge-warning">Edited</span>
              <span v-if="isMarkedForDeletion(game)" class="badge badge-danger">Deleted</span>
            </div>
            <div class="game-details-compact">
              <span class="game-meta">{{ game.start_time }} - {{ game.end_time }}</span>
              <span class="game-meta">{{ game.category }}</span>
            </div>
            <div v-if="game.participants && game.participants.length > 0" class="game-players">
              <span 
                v-for="(participant, idx) in game.participants" 
                :key="idx"
                class="player-tag"
                :class="{'player-couch': participant.role === 'COUCH'}"
              >
                {{ getParticipantName(participant.participant_id) }}<span v-if="participant.role === 'COUCH'"> (C)</span>
              </span>
            </div>
          </div>
          <div class="game-actions">
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
        <div class="games-list-compact">
          <div v-for="game in changes.post" :key="game.game" class="game-row-compact row-new">
            <div class="game-info">
              <div class="game-header-compact">
                <span class="game-title">{{ game.game }}</span>
                <span class="badge badge-success">New</span>
              </div>
              <div class="game-details-compact">
                <span class="game-meta">{{ game.start_time }} - {{ game.end_time }}</span>
              </div>
            </div>
            <div class="game-actions">
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
              <input 
                type="text" 
                class="form-control" 
                id="device" 
                v-model='selectedGame.device'
                list="device-list"
                placeholder="Select or type new device"
              >
              <datalist id="device-list">
                <option v-for="device in uniqueDevices" :key="device" :value="device"></option>
              </datalist>
              <small class="form-text">Select from existing or type new</small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="published" class="form-label">Published</label>
              <input type="text" class="form-control" id="published" v-model='selectedGame.published'>
            </div>
            <div class="form-group">
              <label for="img_filename" class="form-label">Image Filename</label>
              <input 
                type="text" 
                class="form-control" 
                id="img_filename" 
                v-model='selectedGame.img_filename'
                list="image-list"
                placeholder="Select or type new filename"
              >
              <datalist id="image-list">
                <option v-for="filename in uniqueImageFilenames" :key="filename" :value="filename"></option>
              </datalist>
              <small class="form-text">Select from existing or type new</small>
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
                <select 
                  class="form-select" 
                  v-model="participant.role"
                >
                  <option value="PLAYER">PLAYER</option>
                  <option value="COUCH">COUCH</option>
                </select>
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

/* Compact list layout */
.games-list-compact {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 30px;
}

.game-row-compact {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  padding: 10px 15px;
  transition: all 0.2s;
  color: #e0e0e0;
}

.game-row-compact:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  border-color: #555;
}

.game-row-compact.row-edited {
  border-left: 4px solid #ffc107;
}

.game-row-compact.row-deleted {
  border-left: 4px solid #dc3545;
  opacity: 0.7;
}

.game-row-compact.row-new {
  border-left: 4px solid #28a745;
}

.game-info {
  flex: 1;
  min-width: 0;
}

.game-header-compact {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.game-title {
  font-size: 1.1em;
  font-weight: 600;
  color: #fff;
}

.game-details-compact {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.85em;
  color: #bbb;
  margin-bottom: 6px;
}

.game-meta {
  color: #999;
}

.game-players {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
}

.player-tag {
  background: #1a4d7a;
  color: #fff;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.9em;
  font-weight: 500;
  white-space: nowrap;
}

.player-tag.player-couch {
  background: #6a4d1a;
}

.game-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* Form participant styles */
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

/* Mobile responsive - keep it great! */
@media (max-width: 768px) {
  .game-row-compact {
    flex-direction: column;
    align-items: stretch;
  }
  
  .game-actions {
    justify-content: stretch;
  }
  
  .game-actions button {
    flex: 1;
  }
  
  .participant-row {
    grid-template-columns: 1fr;
  }
}
</style>
