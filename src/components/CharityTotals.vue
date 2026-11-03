<script setup>
import { computed, toRefs } from 'vue'
import { euros } from '@/utils/format'
import { useCharities } from '@/composables/useCharities'

const props = defineProps({
  donations: Object
})

const { donations } = toRefs(props);
const { charities, charityById } = useCharities();

// Charities without donations yet are left out to save space
const totals = computed(() => charities.value.map(charity => ({
  ...charityById.value[charity.id],
  goal: charity.goal,
  total: donations.value.filter(d => d.charity === charity.id).reduce((sum, d) => sum + d.amount, 0),
})).filter(charity => charity.total > 0));
</script>

<template>
  <span v-for="charity in totals" :key="charity.name" class="charity-total"
        :style="{ background: charity.color }" :title="charity.name">
    <span class="label">{{ charity.label }}</span> {{ euros(charity.total, 0) }}<template v-if="charity.goal"> / {{ euros(charity.goal, 0) }}</template>
  </span>
</template>

<style scoped>
.charity-total {
  display: inline-flex;
  gap: 4px;
  padding: 1px 8px;
  border-radius: 10px;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.label {
  max-width: 16ch;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
