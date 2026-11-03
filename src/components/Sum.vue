<script setup>
import { computed, toRefs } from 'vue'
import { euros } from '@/utils/format'

const props = defineProps({
  donations: Object
})

const { donations } = toRefs(props);

const sum = computed(() => donations.value.reduce((sum, donation) => sum + donation.amount, 0));
</script>

<template>
  <div class="sum-container">
    <span class="sum-amount">{{ euros(sum) }}</span>
  </div>
</template>

<style scoped>
.sum-container {
  flex-shrink: 0;
  padding: 4px 16px;
}

.sum-amount {
  font-size: 24px;
  font-weight: bold;
  color: #4CAF50;
}
</style>
