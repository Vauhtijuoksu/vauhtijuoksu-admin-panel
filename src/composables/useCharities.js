import { computed, ref } from 'vue';
import api from '@/utils/api';

// Each charity gets a color and a short label, e.g. "WWF - itämeri" -> "WWF"
const charityColors = ['#1565c0', '#2e7d32', '#6a1b9a', '#ef6c00', '#00838f', '#6d4c41'];

// Loaded once and shared, so every view uses the same colors
const charities = ref([]);
let loading = null;

export function useCharities() {
  loading ??= api.get('/charities').then(response => {
    if (response?.data) {
      charities.value = response.data;
    }
  });

  const charityById = computed(() => Object.fromEntries(charities.value.map((c, i) => [c.id, {
    name: c.name,
    label: c.name.split(' - ')[0],
    color: charityColors[i % charityColors.length],
  }])));

  return { charities, charityById };
}
