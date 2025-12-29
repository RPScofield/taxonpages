<template>
  <VCard>
    <VCardHeader>Test Panel</VCardHeader>
    <VCardContent>
      <p>This is a test panel component.</p>
    </VCardContent>
  </VCard>
</template>

<script setup>
defineProps({
  taxon: {
    type: Object,
    required: true
  }
})
</script>
