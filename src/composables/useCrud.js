import { ref } from 'vue';
import api from '@/utils/api';

/**
 * Composable for CRUD operations with change tracking
 * @param {string} endpoint - API endpoint (e.g., '/gamedata', '/participants')
 * @param {Function} transformResponse - Optional function to transform response data
 */
export function useCrud(endpoint, transformResponse = null) {
  const items = ref([]);
  const selectedItem = ref({});
  const changes = ref({
    patch: {},
    post: [],
    delete: [],
  });
  const mode = ref("list");

  /**
   * Fetch all items
   */
  const getItems = async () => {
    const response = await api.get(endpoint);
    if (response?.data) {
      items.value = response.data;
      if (transformResponse) {
        items.value = items.value.map(transformResponse);
      }
    }
  };

  /**
   * Create a new item
   */
  const postItem = async (item) => {
    return api.post(endpoint, item);
  };

  /**
   * Update an existing item
   */
  const patchItem = async (id, item) => {
    return api.patch(`${endpoint}/${id}`, item);
  };

  /**
   * Delete an item
   */
  const deleteItem = async (id) => {
    return api.delete(`${endpoint}/${id}`);
  };

  /**
   * Open edit form for an item
   */
  const openEdit = (item) => {
    if (item.id in changes.value.patch) {
      selectedItem.value = changes.value.patch[item.id];
      selectedItem.value.id = item.id;
    } else {
      selectedItem.value = { ...item };
    }
    mode.value = "form";
  };

  /**
   * Open form to add new item
   */
  const openAdd = (defaultValues = {}) => {
    selectedItem.value = { ...defaultValues };
    mode.value = "form";
  };

  /**
   * Toggle item for deletion
   */
  const toggleDelete = (item) => {
    if (changes.value.delete.includes(item.id)) {
      changes.value.delete = changes.value.delete.filter(id => id !== item.id);
    } else {
      changes.value.delete.push(item.id);
    }
  };

  /**
   * Remove an item from the "to be added" list
   */
  const removeAdded = (item, compareField = 'id') => {
    changes.value.post = changes.value.post.filter(
      i => i[compareField] !== item[compareField]
    );
  };

  /**
   * Save changes to local state
   */
  const saveChanges = () => {
    if ("id" in selectedItem.value) {
      changes.value.patch[selectedItem.value.id] = { ...selectedItem.value };
      delete changes.value.patch[selectedItem.value.id].id;
    } else {
      changes.value.post.push({ ...selectedItem.value });
    }
    selectedItem.value = {};
    mode.value = "list";
  };

  /**
   * Change view mode
   */
  const changeView = (view) => {
    mode.value = view;
  };

  /**
   * Apply all changes to production
   * @param {Function} beforeSubmit - Optional function to transform data before submission
   */
  const applyChanges = async (beforeSubmit = null) => {
    const conf = confirm('Do you want these changes to prod?');
    if (!conf) return;

    try {
      // Clone changes to avoid mutation during processing
      const patchData = { ...changes.value.patch };
      const postData = [...changes.value.post];
      const deleteData = [...changes.value.delete];

      // Apply beforeSubmit transformation if provided
      if (beforeSubmit) {
        await beforeSubmit(patchData, postData);
      }

      // Apply patches
      for (const key in patchData) {
        await patchItem(key, patchData[key]);
      }

      // Apply posts and deletes in parallel
      const posts = postData.map(item => postItem(item));
      const deletes = deleteData.map(id => deleteItem(id));
      await Promise.all([...posts, ...deletes]);

      // Reset changes
      changes.value = {
        patch: {},
        post: [],
        delete: [],
      };

      // Refresh items
      await getItems();
      changeView('list');
    } catch (error) {
      console.error('Error applying changes:', error);
      alert("Timestamps were invalid, refresh page and try again, no changes were made to prod");
    }
  };

  /**
   * Check if item is marked for deletion
   */
  const isMarkedForDeletion = (item) => {
    return changes.value.delete.includes(item.id);
  };

  /**
   * Check if item has been edited
   */
  const isEdited = (item) => {
    return item.id in changes.value.patch;
  };

  return {
    // State
    items,
    selectedItem,
    changes,
    mode,
    
    // Actions
    getItems,
    postItem,
    patchItem,
    deleteItem,
    openEdit,
    openAdd,
    toggleDelete,
    removeAdded,
    saveChanges,
    changeView,
    applyChanges,
    
    // Helpers
    isMarkedForDeletion,
    isEdited,
  };
}

