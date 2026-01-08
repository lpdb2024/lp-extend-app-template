<template>
  <q-layout view="lHh Lpr lFf" class="ff-inter">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts"></script>

<style lang="scss">
.q-page-container {
  height: 100vh;
  min-height: 100vh;
  max-height: 100vh;
}
</style>
