<template>
  <VCard v-if="url || isLoading || hasError">
    <VCardHeader><GBIFLogo class="h-6" /></VCardHeader>
    <VCardContent>
      <VSpinner v-if="isLoading" legend="Loading GBIF data..." />
      <div v-else-if="hasError" class="text-sm text-red-600 dark:text-red-400">
        Failed to load GBIF data
      </div>
      <a
        v-else-if="url"
        class="text-sm"
        :href="url"
        target="_blank"
        rel="noopener noreferrer"
        v-html="taxon.full_name_tag"
      ></a>
    </VCardContent>
  </VCard>
</template>

<script setup>
import { computed, ref, onMounted, watch, onBeforeUnmount } from 'vue'
import axios from 'axios'
import GBIFLogo from './components/gbifLogo.vue'

const props = defineProps({
  taxon: {
    type: Object,
    required: true
  }
})

// ensure usageKey exists before using it in computed (avoid TDZ)
const usageKey = ref(null)
const isLoading = ref(false)
const hasError = ref(false)

const url = computed(() => {
  return usageKey.value
    ? `https://www.gbif.org/species/${usageKey.value}`
    : null
})

let controller = null

async function loadUsageKey() {
  if (!props.taxon?.expanded_name) {
    usageKey.value = null
    isLoading.value = false
    hasError.value = false
    return
  }

  isLoading.value = true
  hasError.value = false

  try {
    // cancel previous request (if any)
    if (controller) controller.abort()
    controller = new AbortController()

    const { data } = await axios.get('https://api.gbif.org/v1/species/match', {
      params: {
        name: props.taxon.expanded_name
      },
      signal: controller.signal
    })

    usageKey.value = data?.usageKey ?? null
  } catch (err) {
    // ignore aborts; handle other errors
    if (err?.name === 'CanceledError' || err?.message === 'canceled') {
      // request was aborted — no action needed
    } else {
      console.error('Failed to load GBIF usageKey:', err)
      usageKey.value = null
      hasError.value = true
    }
  } finally {
    isLoading.value = false
    controller = null
  }
}

onMounted(loadUsageKey)
watch(() => props.taxon?.expanded_name, loadUsageKey)

onBeforeUnmount(() => {
  if (controller) controller.abort()
})
</script>
