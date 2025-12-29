<template>
  <div v-if="hasData" class="panel-container border-t border-gray-200 py-4">
    <h3 class="text-lg font-medium text-gray-900 mb-2">Etymology & Grammar</h3>
    
    <div class="flex flex-col gap-6">
      
      <div v-if="taxon.etymology" class="w-full">
        <span class="block text-sm font-semibold text-gray-500 uppercase mb-1">Etymology</span>
        <p class="text-base text-gray-700 leading-relaxed" v-html="formatMarkdown(taxon.etymology)"></p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
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
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  taxon: { type: Object, required: true }
})

// FIX 1: Convert **text** from database into <b>text</b> for the browser
const formatMarkdown = (text) => {
  if (!text) return ''
  // This replaces **word** with <b>word</b>
  return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
}

// FIX 2: More aggressive search for Gender/Form
const gender = computed(() => {
  const g = props.taxon.taxon_name_classifications?.find(c => 
    c.type?.toLowerCase().includes('gender') || 
    c.taxon_name_classification_set?.toLowerCase().includes('gender')
  )
  return g ? (g.label || g.type.split('::').pop()) : null
})

const partOfSpeech = computed(() => {
  const p = props.taxon.taxon_name_classifications?.find(c => 
    c.type?.toLowerCase().includes('partofspeech') || 
    c.type?.toLowerCase().includes('form')
  )
  return p ? (p.label || p.type.split('::').pop()) : null
})

const hasData = computed(() => !!(props.taxon.etymology || gender.value || partOfSpeech.value))
</script>
