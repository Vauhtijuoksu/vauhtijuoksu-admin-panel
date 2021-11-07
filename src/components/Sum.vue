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
  <div>
  Kerätty: {{ sum }} €
  </div>
</template>

<style scoped>
</style>
