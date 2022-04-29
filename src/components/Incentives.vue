<script setup>
import {ref, toRefs, watch} from 'vue'
import axios from 'axios'

const props = defineProps({
  incentives: Object,
})

const { incentives } = toRefs(props);


</script>

<template>
  {{ incentives }}
</template>

<style scoped>
</style>
