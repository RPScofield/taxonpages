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

// Helper: safely get a string from multiple possible fields on a classification object
const getStringFields = (c) => {
  const candidates = [
    c?.label,
    c?.value,            // some backends use 'value'
    c?.name,             // some use 'name'
    c?.type,
    // taxon_name_classification_set may be an object; try its label or name if present
    (typeof c?.taxon_name_classification_set === 'string') ? c.taxon_name_classification_set : c?.taxon_name_classification_set?.label || c?.taxon_name_classification_set?.name
  ]
  return candidates.filter(x => typeof x === 'string' && x.trim().length > 0)
}

// Safe lowercase check helper
const includesIgnoreCase = (str, needle) => {
  if (typeof str !== 'string') return false
  return str.toLowerCase().includes(needle.toLowerCase())
}

// Normalize display value: prefer label/value/name; if only type present, return last segment after '::'
const classificationDisplay = (c) => {
  if (!c) return null
  if (typeof c.label === 'string' && c.label.trim()) return c.label.trim()
  if (typeof c.value === 'string' && c.value.trim()) return c.value.trim()
  if (typeof c.name === 'string' && c.name.trim()) return c.name.trim()
  if (typeof c.type === 'string' && c.type.trim()) {
    const parts = c.type.split('::').map(p => p.trim()).filter(Boolean)
    return parts.length ? parts[parts.length - 1] : c.type.trim()
  }
  // fallback to any string-like field
  const s = getStringFields(c)[0]
  return s || null
}

// FIX 2: More robust search for Gender/Form across many possible fields
const gender = computed(() => {
  const list = props.taxon.taxon_name_classifications || []
  const g = list.find(c => {
    // check any string field for 'gender'
    const strings = getStringFields(c)
    return strings.some(s => includesIgnoreCase(s, 'gender'))
  })
  const raw = classificationDisplay(g)
  return raw ? raw : null
})

const partOfSpeech = computed(() => {
  const list = props.taxon.taxon_name_classifications || []
  const p = list.find(c => {
    const strings = getStringFields(c)
    // look for "part of speech", "partofspeech", "form", "form of", or "grammatical"
    return strings.some(s => {
      const sLower = s.toLowerCase()
      return sLower.includes('partofspeech') || sLower.includes('part of speech') || sLower.includes('form') || sLower.includes('grammatical') || sLower.includes('speech')
    })
  })
  const raw = classificationDisplay(p)
  return raw ? raw : null
})

const hasData = computed(() => !!(props.taxon.etymology || gender.value || partOfSpeech.value))
</script>
