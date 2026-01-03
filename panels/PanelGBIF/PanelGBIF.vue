<template>
  <VCard>
    <VCardHeader><GBIFLogo class="h-6" /></VCardHeader>
    <VCardContent>
      <VSpinner v-if="isLoading" />
      <div v-else-if="hasError" class="text-sm text-red-600 dark:text-red-400">
        Failed to load GBIF data
      </div>
      <div v-else-if="!url" class="text-sm text-gray-600 dark:text-gray-400">
        No GBIF data available
      </div>
      <a
        v-else
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
  // Try to get the scientific name from various possible fields
  const scientificName = props.taxon?.cached || props.taxon?.name || props.taxon?.cached_html?.replace(/<[^>]*>/g, '') || null
  
  if (!scientificName) {
    console.warn('No scientific name found for taxon:', props.taxon)
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
        name: scientificName
      },
      signal: controller.signal
    })

    usageKey.value = data?.usageKey ?? null
    
    if (!usageKey.value) {
      console.warn('No GBIF match found for:', scientificName)
    }
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
watch(() => [props.taxon?.cached, props.taxon?.name, props.taxon?.cached_html], loadUsageKey)

onBeforeUnmount(() => {
  if (controller) controller.abort()
})
</script>
