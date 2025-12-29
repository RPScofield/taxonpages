<template>
  <VCard v-if="url">
    <VCardHeader><GBIFLogo class="h-6" /></VCardHeader>
    <VCardContent>
      <a
        class="text-sm"
        :href="url"
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
  },

  perPage: {
    type: Number,
    default: 60
  }
})

// ensure usageKey exists before using it in computed (avoid TDZ)
const usageKey = ref(null)

const url = computed(() => {
  return usageKey.value
    ? `https://www.gbif.org/species/${usageKey.value}`
    : null
})

let controller = null

async function loadUsageKey() {
  if (!props.taxon?.expanded_name) {
    usageKey.value = null
    return
  }

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
    }
  } finally {
    controller = null
  }
}

onMounted(loadUsageKey)
watch(() => props.taxon?.expanded_name, loadUsageKey)

onBeforeUnmount(() => {
  if (controller) controller.abort()
})
</script>
