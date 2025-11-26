<script setup>

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCrud } from '@/composables/useCrud'

const router = useRouter()

const {
  items: participants,
  selectedItem: selectedParticipant,
  changes,
  mode,
  getItems: getParticipants,
  openEdit: openEditBase,
  openAdd: openAddBase,
  toggleDelete: remove,
  removeAdded,
  saveChanges,
  changeView,
  applyChanges: changesToProd,
  isMarkedForDeletion,
  isEdited,
} = useCrud('/participants');

const openEdit = (participant) => {
  openEditBase(participant);
  
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
};

const openAdd = () => {
  openAddBase({
    display_name: "Player Name",
    social_medias: [
      { platform: "TWITCH", username: "" },
      { platform: "DISCORD", username: "" }
    ]
  });
};

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

const getTwitchHandle = (participant) => {
  const twitch = participant.social_medias?.find(s => s.platform === "TWITCH");
  return twitch?.username || '-';
};

const getDiscordHandle = (participant) => {
  const discord = participant.social_medias?.find(s => s.platform === "DISCORD");
  return discord?.username || '-';
};

onMounted(() => {
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
        <h2>Participants Management</h2>
        <div class="header-actions">
          <button @click="openAdd()" class="btn btn-success">
            Add New Participant
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

      <div class="participants-list-compact">
        <div 
          v-for="participant in participants" 
          :key="participant.id" 
          class="participant-row-compact"
          :class="{ 'row-edited': isEdited(participant), 'row-deleted': isMarkedForDeletion(participant) }"
        >
          <div class="participant-info">
            <div class="participant-header-compact">
              <span class="participant-name">{{ participant.display_name }}</span>
              <span v-if="isEdited(participant)" class="badge badge-warning">Edited</span>
              <span v-if="isMarkedForDeletion(participant)" class="badge badge-danger">Deleted</span>
            </div>
            <div class="participant-details-compact">
              <span v-if="getTwitchHandle(participant) !== '-'" class="participant-meta">🎮 {{ getTwitchHandle(participant) }}</span>
              <span v-if="getDiscordHandle(participant) !== '-'" class="participant-meta">💬 {{ getDiscordHandle(participant) }}</span>
              <span v-if="getTwitchHandle(participant) === '-' && getDiscordHandle(participant) === '-'" class="text-muted-small">No socials</span>
            </div>
          </div>
          <div class="participant-actions">
            <button @click="openEdit(participant)" class="btn btn-sm btn-primary">
              Edit
            </button>
            <button 
              @click="remove(participant)" 
              :class="isMarkedForDeletion(participant) ? 'btn btn-sm btn-secondary' : 'btn btn-sm btn-danger'"
            >
              {{ isMarkedForDeletion(participant) ? 'Undo' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="changes.post.length > 0" class="pending-section">
        <h3>Pending New Participants</h3>
        <div class="participants-list-compact">
          <div v-for="participant in changes.post" :key="participant.display_name" class="participant-row-compact row-new">
            <div class="participant-info">
              <div class="participant-header-compact">
                <span class="participant-name">{{ participant.display_name }}</span>
                <span class="badge badge-success">New</span>
              </div>
              <div class="participant-details-compact">
                <span v-if="getTwitchHandle(participant) !== '-'" class="participant-meta">🎮 {{ getTwitchHandle(participant) }}</span>
                <span v-if="getDiscordHandle(participant) !== '-'" class="participant-meta">💬 {{ getDiscordHandle(participant) }}</span>
              </div>
            </div>
            <div class="participant-actions">
              <button @click="removeAdded(participant)" class="btn btn-sm btn-danger">
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
        <h2>{{ selectedParticipant.id ? 'Edit Participant' : 'Add New Participant' }}</h2>
        <div></div>
      </div>
      
      <form class="edit-form">
        <div class="form-section">
          <h3>Basic Information</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="display_name" class="form-label">Display Name *</label>
              <input 
                type="text" 
                class="form-control" 
                id="display_name" 
                v-model='selectedParticipant.display_name'
                placeholder="Enter participant's display name"
                required
              >
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Social Media</h3>
          <div class="social-form">
            <div class="social-field">
              <label for="twitch_username" class="form-label">Twitch Username</label>
              <input 
                type="text" 
                class="form-control" 
                id="twitch_username" 
                v-model='twitchUsername'
                placeholder="username"
              >
            </div>

            <div class="social-field">
              <label for="discord_username" class="form-label">Discord Username</label>
              <input 
                type="text" 
                class="form-control" 
                id="discord_username" 
                v-model='discordUsername'
                placeholder="username"
              >
            </div>
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

/* Compact list layout */
.participants-list-compact {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 30px;
}

.participant-row-compact {
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

.participant-row-compact:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  border-color: #555;
}

.participant-row-compact.row-edited {
  border-left: 4px solid #ffc107;
}

.participant-row-compact.row-deleted {
  border-left: 4px solid #dc3545;
  opacity: 0.7;
}

.participant-row-compact.row-new {
  border-left: 4px solid #28a745;
}

.participant-info {
  flex: 1;
  min-width: 0;
}

.participant-header-compact {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.participant-name {
  font-size: 1.1em;
  font-weight: 600;
  color: #fff;
}

.participant-details-compact {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.85em;
  color: #bbb;
}

.participant-meta {
  color: #999;
}

.text-muted-small {
  color: #777;
  font-style: italic;
  font-size: 0.9em;
}

.participant-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* Form styles */
.social-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.social-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .participant-row-compact {
    flex-direction: column;
    align-items: stretch;
  }
  
  .participant-actions {
    justify-content: stretch;
  }
  
  .participant-actions button {
    flex: 1;
  }
  
  .social-form {
    grid-template-columns: 1fr;
  }
}
</style>
