<script setup>
import { computed, onMounted } from 'vue'

const props = defineProps({
  taxon: {
    type: Object,
    required: true
  }
})

// This will help us debug. Open your browser console (F12) to see the data.
onMounted(() => {
  console.log('Taxon Classifications:', props.taxon.taxon_name_classifications)
})

const gender = computed(() => {
  // Broad search for any classification containing 'Gender'
  const g = props.taxon.taxon_name_classifications?.find(c => 
    c.type?.toLowerCase().includes('gender') || 
    c.taxon_name_classification_set?.toLowerCase().includes('gender')
  )
  // Try to return a label first, then the end of the type string
  return g ? (g.label || g.type.split('::').pop()) : null
})

const partOfSpeech = computed(() => {
  // Broad search for 'PartOfSpeech' or 'Form'
  const p = props.taxon.taxon_name_classifications?.find(c => 
    c.type?.toLowerCase().includes('partofspeech') || 
    c.type?.toLowerCase().includes('form') ||
    c.taxon_name_classification_set?.toLowerCase().includes('partofspeech')
  )
  return p ? (p.label || p.type.split('::').pop()) : null
})

const hasData = computed(() => 
  !!(props.taxon.etymology || gender.value || partOfSpeech.value)
)
</script>
