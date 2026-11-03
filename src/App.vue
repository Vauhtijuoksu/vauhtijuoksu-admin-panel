<script setup>
import { apiError } from '@/utils/api'
</script>

<template>
  <div v-if="apiError" class="api-error">⚠️ API ei vastaa, tiedot voivat olla vanhentuneita</div>
  <router-view />
</template>

<style scoped>
.api-error {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 4px;
  background: #b71c1c;
  color: #fff;
  font-weight: 600;
  text-align: center;
}
</style>
