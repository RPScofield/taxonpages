<template>
  <div v-if="hasData" class="panel-container border-t border-gray-200 py-4">
    <h3 class="text-lg font-medium text-gray-900 mb-2">Etymology & Grammar</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-if="taxon.etymology">
        <span class="block text-sm font-semibold text-gray-500 uppercase">Etymology</span>
        <p class="text-sm" v-html="taxon.etymology"></p>
      </div>

      <div v-if="gender">
        <span class="block text-sm font-semibold text-gray-500 uppercase">Gender</span>
        <p class="text-sm capitalize">{{ gender }}</p>
      </div>

      <div v-if="partOfSpeech">
        <span class="block text-sm font-semibold text-gray-500 uppercase">Grammatical Form</span>
        <p class="text-sm capitalize">{{ partOfSpeech }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  taxon: {
    type: Object,
    required: true
  }
})

// FIX: Updated string matching to be more flexible for "Latinized" types
const gender = computed(() => {
  const g = props.taxon.taxon_name_classifications?.find(c => 
    c.taxon_name_classification_set?.includes('Gender') || 
    c.type?.includes('Gender')
  )
  return g ? (g.label || g.type.split('::').pop()) : null
})

const partOfSpeech = computed(() => {
  const p = props.taxon.taxon_name_classifications?.find(c => 
    c.taxon_name_classification_set?.includes('PartOfSpeech') || 
    c.type?.includes('PartOfSpeech')
  )
  return p ? (p.label || p.type.split('::').pop()) : null
})

const hasData = computed(() => 
  !!(props.taxon.etymology || gender.value || partOfSpeech.value)
)
</script>
