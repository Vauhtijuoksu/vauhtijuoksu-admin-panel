<script setup>
import Donations from './components/Donations.vue'
import StreamData from './components/StreamData.vue'
import Authentication from './components/Authentication.vue'
import Sum from './components/Sum.vue'
</script>

<template>
  <div class="statusbar">

    <Sum />
  </div>
  <Authentication />
  <StreamData />
  <Donations />
  <Donations />
</template>

<style>
</style>
