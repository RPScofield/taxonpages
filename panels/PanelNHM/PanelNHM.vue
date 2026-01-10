<template>
  <VCard>
    <VCardHeader>
      <div class="flex items-center gap-2">
        <span>Natural History Museum</span>
        <a
          href="https://data.nhm.ac.uk"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs text-gray-500 hover:text-primary-500"
          title="Visit NHM Data Portal"
        >
          🔗
        </a>
      </div>
    </VCardHeader>
    <VCardContent>
      <VSpinner v-if="isLoading" />
      
      <div v-else-if="hasError" class="text-sm text-red-600 dark:text-red-400">
        Failed to load Natural History Museum data
      </div>
      
      <div v-else-if="specimens.length === 0" class="text-sm text-gray-600 dark:text-gray-400">
        No specimen records found in NHM catalogue
      </div>
      
      <div v-else>
        <!-- Display specimen count -->
        <div class="text-sm mb-4 text-gray-700 dark:text-gray-300">
          Found {{ totalSpecimens }} specimen{{ totalSpecimens !== 1 ? 's' : '' }}
        </div>

        <!-- Image Gallery Section -->
        <div v-if="specimenImages.length > 0" class="mb-6">
          <h3 class="text-md font-semibold mb-3">Specimen Images</h3>
          <GalleryImage 
            :images="formattedImagesForGallery"
          />
        </div>

        <!-- Location/Collection Data -->
        <div class="mb-4">
          <h3 class="text-md font-semibold mb-3">Collection Locations</h3>
          <div class="space-y-2">
            <div
              v-for="(location, index) in uniqueLocations"
              :key="index"
              class="text-sm p-2 bg-base-100 dark:bg-base-800 rounded"
            >
              <div class="font-medium">{{ location.locality || 'Unknown location' }}</div>
              <div v-if="location.country" class="text-gray-600 dark:text-gray-400">
                {{ location.country }}
              </div>
              <div v-if="location.coordinates" class="text-xs text-gray-500">
                📍 {{ location.coordinates }}
              </div>
            </div>
          </div>
        </div>

        <!-- Link to full records -->
        <div class="mt-4">
          <a
            :href="nhmSearchUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-primary-500 hover:text-primary-600"
          >
            View all records on NHM Data Portal →
          </a>
        </div>
      </div>
    </VCardContent>
  </VCard>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { stripHTML } from '../../src/modules/otus/utils/stripHtml'

const props = defineProps({
  taxon: {
    type: Object,
    required: true
  },
  otuId: {
    type: [String, Number],
    required: false
  }
})

const NHM_API_BASE = 'https://data.nhm.ac.uk/api/3'
const COLLECTION_RESOURCE_ID = '05ff2255-c38a-40c9-b657-4ccb55ab2feb'

const isLoading = ref(false)
const hasError = ref(false)
const specimens = ref([])
const totalSpecimens = ref(0)
const specimenImages = ref([])

let controller = null

// Computed property for scientific name
const scientificName = computed(() => {
  return props.taxon?.cached || props.taxon?.name || stripHTML(props.taxon?.cached_html) || null
})

// Computed property for unique locations
const uniqueLocations = computed(() => {
  const locations = []
  const seen = new Set()
  
  for (const specimen of specimens.value) {
    const locality = specimen.locality || specimen.higherGeography || ''
    const country = specimen.country || ''
    const coords = specimen.decimalLatitude && specimen.decimalLongitude
      ? `${specimen.decimalLatitude}, ${specimen.decimalLongitude}`
      : null
    
    const key = `${locality}-${country}-${coords}`
    if (!seen.has(key) && (locality || country || coords)) {
      seen.add(key)
      locations.push({
        locality,
        country,
        coordinates: coords
      })
    }
  }
  
  return locations.slice(0, 10) // Limit to 10 unique locations
})

// Computed property for NHM search URL
const nhmSearchUrl = computed(() => {
  return `https://data.nhm.ac.uk/dataset/collection-specimens?q=${encodeURIComponent(scientificName.value || '')}`
})

// Format images for the ImageViewer component
const formattedImagesForGallery = computed(() => {
  return specimenImages.value.map(img => ({
    id: `nhm-${img.catalogNumber || Math.random()}`,
    original: img.url,
    medium: img.url,
    thumb: img.url,
    label: img.alt,
    attribution: 'Natural History Museum, London'
  }))
})

// Fetch specimen data from NHM API
async function loadSpecimens() {
  if (!scientificName.value) {
    console.warn('No scientific name found for taxon:', props.taxon)
    specimens.value = []
    isLoading.value = false
    hasError.value = false
    return
  }

  isLoading.value = true
  hasError.value = false

  try {
    // Cancel previous request (if any)
    if (controller) controller.abort()
    controller = new AbortController()

    // Search NHM collection using CKAN datastore API
    const { data } = await axios.get(`${NHM_API_BASE}/action/datastore_search`, {
      params: {
        resource_id: COLLECTION_RESOURCE_ID,
        q: scientificName.value,
        limit: 100 // Get up to 100 records
      },
      signal: controller.signal
    })

    if (data?.success && data?.result?.records) {
      specimens.value = data.result.records
      totalSpecimens.value = data.result.total || specimens.value.length
      
      // Extract images from specimen records
      extractImages()
    } else {
      specimens.value = []
      totalSpecimens.value = 0
      specimenImages.value = []
    }
  } catch (err) {
    // Ignore aborts; handle other errors
    if (err?.name === 'CanceledError' || err?.message === 'canceled') {
      // Request was aborted — no action needed
    } else {
      console.error('Failed to load NHM specimens:', err)
      specimens.value = []
      hasError.value = true
    }
  } finally {
    isLoading.value = false
    controller = null
  }
}

// Extract image URLs from specimen records
function extractImages() {
  const images = []
  
  for (const specimen of specimens.value) {
    // NHM records may have various image fields
    // Common fields: associatedMedia, multimedia, image, imageURL, etc.
    const imageUrl = specimen.associatedMedia || 
                     specimen.multimedia || 
                     specimen.image || 
                     specimen.imageURL ||
                     specimen.associatedMediaURL
    
    if (imageUrl) {
      // Handle multiple images separated by | or ;
      const urls = imageUrl.split(/[|;]/).map(u => u.trim()).filter(Boolean)
      
      for (const url of urls) {
        if (url.startsWith('http')) {
          images.push({
            url,
            alt: `${specimen.scientificName || scientificName.value} - ${specimen.catalogNumber || 'Specimen'}`,
            catalogNumber: specimen.catalogNumber,
            specimen
          })
        }
      }
    }
  }
  
  specimenImages.value = images.slice(0, 20) // Limit to 20 images
}

onMounted(loadSpecimens)

// Watch for taxon changes
watch(
  [() => props.taxon?.cached, () => props.taxon?.name, () => props.taxon?.cached_html],
  loadSpecimens
)

onBeforeUnmount(() => {
  if (controller) controller.abort()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
