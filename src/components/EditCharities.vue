<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCrud } from '@/composables/useCrud'

const router = useRouter()

const {
  items: charities,
  selectedItem: selectedCharity,
  changes,
  mode,
  getItems: getCharities,
  openEdit,
  openAdd,
  toggleDelete: remove,
  removeAdded,
  saveChanges,
  changeView,
  applyChanges,
  isMarkedForDeletion,
  isEdited,
} = useCrud('/charities');

const changeCount = computed(() => {
  return Object.keys(changes.value.patch).length +
         changes.value.post.length +
         changes.value.delete.length;
});

// Cleared inputs are empty strings, but the API wants null for missing optional fields
const emptyToNull = (charity) => {
  for (const field of ['url', 'goal', 'img_filename']) {
    if (charity[field] === '') {
      charity[field] = null;
    }
  }
};

const changesToProd = () => applyChanges((patchData, postData) => {
  Object.values(patchData).forEach(emptyToNull);
  postData.forEach(emptyToNull);
});

onMounted(() => {
  getCharities();
});
</script>

<template>
  <div class="edit-container">
    <!-- LIST VIEW -->
    <div v-if="mode === 'list'" class="list-view">
      <div class="header">
        <div>
          <button @click="router.push('/edit')" class="btn btn-back">← Takaisin</button>
        </div>
        <h2>Kohteet</h2>
        <div class="header-actions">
          <button @click="openAdd()" class="btn btn-success">
            Lisää kohde
          </button>
          <button
            v-if="changeCount > 0"
            @click="changeView('preview')"
            class="btn btn-warning"
          >
            Esikatsele muutokset ({{ changeCount }})
          </button>
        </div>
      </div>

      <div class="items-grid">
        <div
          v-for="charity in charities"
          :key="charity.id"
          class="item-card"
          :class="{ 'item-edited': isEdited(charity), 'item-deleted': isMarkedForDeletion(charity) }"
        >
          <div class="item-header">
            <h3>{{ charity.name }}</h3>
            <div class="item-badges">
              <span v-if="isEdited(charity)" class="badge badge-warning">Muokattu</span>
              <span v-if="isMarkedForDeletion(charity)" class="badge badge-danger">Poistettu</span>
            </div>
          </div>
          <div class="item-details">
            <div class="detail-row"><span class="label">Id:</span><span class="value">{{ charity.id }}</span></div>
            <div class="detail-row"><span class="label">Url:</span><span class="value">{{ charity.url || '-' }}</span></div>
            <div class="detail-row"><span class="label">Tavoite:</span><span class="value">{{ charity.goal ?? '-' }}</span></div>
            <div class="detail-row"><span class="label">Kuva:</span><span class="value">{{ charity.img_filename || '-' }}</span></div>
          </div>
          <div class="item-actions">
            <button @click="openEdit(charity)" class="btn btn-sm btn-primary">
              Muokkaa
            </button>
            <button
              @click="remove(charity)"
              :class="isMarkedForDeletion(charity) ? 'btn btn-sm btn-secondary' : 'btn btn-sm btn-danger'"
            >
              {{ isMarkedForDeletion(charity) ? 'Peru' : 'Poista' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="changes.post.length > 0" class="pending-section">
        <h3>Lisättävät kohteet</h3>
        <div class="items-grid">
          <div v-for="charity in changes.post" :key="charity.name" class="item-card item-new">
            <div class="item-header">
              <h3>{{ charity.name }}</h3>
              <div class="item-badges">
                <span class="badge badge-success">Uusi</span>
              </div>
            </div>
            <div class="item-actions">
              <button @click="removeAdded(charity, 'name')" class="btn btn-sm btn-danger">
                Poista
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
          ← Takaisin
        </button>
        <h2>{{ selectedCharity.id ? 'Muokkaa kohdetta' : 'Lisää kohde' }}</h2>
        <div></div>
      </div>

      <form class="edit-form" @submit.prevent="saveChanges()">
        <div class="form-section">
          <div class="form-row">
            <div class="form-group">
              <label for="name" class="form-label">Nimi *</label>
              <input type="text" class="form-control" id="name" v-model="selectedCharity.name" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="url" class="form-label">Url</label>
              <input type="url" class="form-control" id="url" v-model="selectedCharity.url" placeholder="https://...">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="goal" class="form-label">Tavoite (€)</label>
              <input type="number" min="0" step="1" class="form-control" id="goal" v-model.number="selectedCharity.goal">
            </div>
            <div class="form-group">
              <label for="img_filename" class="form-label">Kuvatiedosto</label>
              <input type="text" class="form-control" id="img_filename" v-model="selectedCharity.img_filename" placeholder="wwf.png">
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-success">
            Tallenna
          </button>
          <button type="button" @click="changeView('list')" class="btn btn-secondary">
            Peruuta
          </button>
        </div>
      </form>
    </div>

    <!-- PREVIEW VIEW -->
    <div v-else-if="mode === 'preview'" class="preview-view">
      <div class="preview-header">
        <h2>Muutosten esikatselu</h2>
        <p class="preview-subtitle">Tarkista muutokset ennen kuin viet ne tuotantoon. Kohdetta, jolla on lahjoituksia, ei voi poistaa</p>
      </div>

      <div class="preview-section" v-if="Object.keys(changes.patch).length > 0">
        <h3>Päivitykset ({{ Object.keys(changes.patch).length }})</h3>
        <pre class="preview-code">{{ JSON.stringify(changes.patch, null, 2) }}</pre>
      </div>

      <div class="preview-section" v-if="changes.post.length > 0">
        <h3>Uudet ({{ changes.post.length }})</h3>
        <pre class="preview-code">{{ JSON.stringify(changes.post, null, 2) }}</pre>
      </div>

      <div class="preview-section" v-if="changes.delete.length > 0">
        <h3>Poistot ({{ changes.delete.length }})</h3>
        <pre class="preview-code">{{ JSON.stringify(changes.delete, null, 2) }}</pre>
      </div>

      <div class="preview-actions">
        <button @click="changeView('list')" class="btn btn-secondary">
          ← Takaisin listaan
        </button>
        <button @click="changesToProd()" class="btn btn-danger">
          Vie muutokset
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/css/edit-styles.css';
</style>
