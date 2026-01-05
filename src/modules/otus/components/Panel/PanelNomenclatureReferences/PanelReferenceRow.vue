<template>
  <li class="border-b border-base-muted p-3 px-5">
    <div class="flex items-start gap-2">
      <span
        class="[&>a]:break-all block flex-1"
        :title="stripHTML(displayText)"
        v-html="displayText"
      />
      <div class="flex gap-2 items-center flex-shrink-0">
        <a
          v-if="doiUrl"
          :href="doiUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary-500 hover:text-primary-700 underline text-sm whitespace-nowrap"
          title="View DOI"
        >
          DOI
        </a>
        <a
          v-if="hasDocument"
          :href="reference.document"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary-500 hover:text-primary-700 flex items-center"
          title="Download PDF"
        >
          <IconDocument class="w-5 h-5" />
        </a>
      </div>
    </div>
  </li>
</template>

<script setup>
import { computed } from 'vue'
import { stripHTML } from '../../../utils'

const props = defineProps({
  reference: {
    type: [String, Object],
    required: true
  }
})

const isObject = computed(() => typeof props.reference === 'object' && props.reference !== null)

const displayText = computed(() => {
  return typeof props.reference === 'string' 
    ? props.reference 
    : props.reference.cached_with_links || props.reference.cached
})

const doiUrl = computed(() => {
  if (!isObject.value || !props.reference.doi) return null
  const doi = props.reference.doi
  // Ensure doi is a string
  if (typeof doi !== 'string') return null
  // If DOI is already a full URL, use it as-is
  if (doi.startsWith('http')) {
    return doi
  }
  // Otherwise, prepend the DOI resolver URL
  const cleanDoi = doi.replace(/^doi:\s*/i, '')
  return `https://doi.org/${cleanDoi}`
})

const hasDocument = computed(() => {
  return isObject.value && props.reference.document
})
</script>
