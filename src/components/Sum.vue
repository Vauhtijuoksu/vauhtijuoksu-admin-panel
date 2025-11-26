<script setup>
import { ref, toRefs, watch } from 'vue'

const props = defineProps({
  donations: Object
})

const { donations } = toRefs(props);

let sum = ref(0);

watch(donations, () => {
  sum.value = 0;
  for (let donation of donations.value){
    sum.value += donation.amount
  }
})
</script>

<template>
  <div class="sum-container">
    <span class="sum-amount">{{ sum.toFixed(2) }} €</span>
  </div>
</template>

<style scoped>
.sum-container {
  padding: 4px 16px;
}

.sum-amount {
  font-size: 24px;
  font-weight: bold;
  color: #4CAF50;
}
</style>
