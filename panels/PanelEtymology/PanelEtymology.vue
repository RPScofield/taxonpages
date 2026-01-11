<template>
  <!-- Only show the card if we have etymology, name forms, or classifications -->
  <VCard v-if="taxon.etymology || adjective || classifications.length">
    <VCardHeader>Gender, form, and etymology</VCardHeader>
    
    <VCardContent class="text-sm space-y-4">
      <!-- Gender/Part of Speech List -->
      <div v-if="humanTypeList">
        <b class="text-gray-700 dark:text-gray-200">
          {{ humanTypeList }}
        </b>
      </div>

      <!-- Adjective/Participle forms for Species Groups -->
      <div
        v-if="inSpeciesGroup && adjectiveOrParticiple && adjective"
        class="flex flex-col gap-1 p-2 bg-gray-50 dark:bg-gray-800 rounded"
      >
        <span class="text-xs uppercase tracking-wide text-gray-500 font-semibold">
          Inflected forms
        </span>
        <i class="text-primary">{{ adjective }}</i>
      </div>

      <!-- Etymology Section -->
      <template v-if="taxon.etymology">
        <hr class="border-gray-200 dark:border-gray-700" />
        <div class="prose prose-sm dark:prose-invert max-w-none">
          <span class="font-semibold text-gray-600 dark:text-gray-400">Etymology: </span>
          <span v-html="md.render(taxon.etymology)" class="inline-markdown" />
        </div>
      </template>
    </VCardContent>
  </VCard>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { makeAPIRequest } from '@/utils'
import MarkdownIt from 'markdown-it'

const SPECIES_GROUP = 'SpeciesGroup'
const SPECIES_AND_INFRASPECIES = 'SpeciesAndInfraspecies'
const NAMES_PROP = ['masculine_name', 'feminine_name', 'neuter_name']

const TYPE_LIST = {
  'TaxonNameClassification::Latinized::Gender::Masculine': 'Masculine',
  'TaxonNameClassification::Latinized::Gender::Feminine': 'Feminine',
  'TaxonNameClassification::Latinized::Gender::Neuter': 'Neuter',
  'TaxonNameClassification::Latinized::PartOfSpeech::Adjective': 'Adjective',
  'TaxonNameClassification::Latinized::PartOfSpeech::Participle': 'Participle',
  'TaxonNameClassification::Latinized::PartOfSpeech::NounInApposition': 'Noun in apposition',
  'TaxonNameClassification::Latinized::PartOfSpeech::NounInGenitiveCase': 'Noun in genitive case'
}

const props = defineProps({
  taxon: {
    type: Object,
    required: true
  }
})

const md = new MarkdownIt({ 
  html: true,
  breaks: true,
  linkify: true 
})

const classifications = ref([])

// Concatenates the different gendered name strings
const adjective = computed(() =>
  NAMES_PROP.map((key) => props.taxon[key])
    .filter(Boolean)
    .join(', ')
)

// Checks if any classification indicates it's an adjective or participle
const adjectiveOrParticiple = computed(() =>
  classifications.value.some(
    (item) =>
      item.type.includes('::PartOfSpeech::Adjective') ||
      item.type.includes('::PartOfSpeech::Participle')
  )
)

// Maps technical classification types to human-readable strings
const humanTypeList = computed(() => {
  return classifications.value
    .map((item) => TYPE_LIST[item.type])
    .filter(Boolean)
    .join(', ')
})

// Determines if the taxon belongs to the species rank group
const inSpeciesGroup = computed(() => {
  const rank = props.taxon.rank_string || ''
  return rank.includes(SPECIES_GROUP) || rank.includes(SPECIES_AND_INFRASPECIES)
})

/**
 * Fetches classification data based on the current taxon ID
 */
async function loadClassifications() {
  if (!props.taxon?.id) return
  
  try {
    const params = {
      taxon_name_id: [props.taxon.id]
    }
    const { data } = await makeAPIRequest.get('/taxon_name_classifications', { params })
    
    // Filter only Latinized classifications
    classifications.value = data.filter((item) =>
      item.type.includes('::Latinized::')
    )
  } catch (error) {
    console.error('Failed to load taxon classifications:', error)
    classifications.value = []
  }
}

// Watch for changes in taxon ID to refresh data
watch(() => props.taxon?.id, loadClassifications, { immediate: true })
</script>

<style scoped>
.inline-markdown :deep(p) {
  display: inline;
}
</style>
