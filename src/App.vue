<script setup lang="ts"></script>

<template>
  <div class="app-shell">
    <Transition name="page-slide" mode="out-in">
      <RouterView />
    </Transition>
  </div>
</template>
