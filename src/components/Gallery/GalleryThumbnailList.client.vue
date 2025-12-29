<template>
  <component
    :is="GalleryThumbnailListComponent"
    v-if="GalleryThumbnailListComponent"
    v-bind="$attrs"
  />
</template>

<script setup>
import { defineAsyncComponent, ref, onMounted } from 'vue'

// Client-only wrapper for GalleryThumbnailList to prevent SSR issues with Leaflet/browser APIs
const GalleryThumbnailListComponent = ref(null)

onMounted(async () => {
  // Dynamically import the actual component only on the client side
  const module = await import('./GalleryThumbnailList.vue')
  GalleryThumbnailListComponent.value = module.default
})
</script>
