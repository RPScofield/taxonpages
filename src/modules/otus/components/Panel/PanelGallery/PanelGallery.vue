<template>
  <VCard v-if="images.length || descendantImages.length || isLoadingDescendants">
    <VCardContent>
      <!-- Current taxon images -->
      <GalleryImage 
        v-if="images.length"
        :images="images" 
      />
      
      <!-- Descendant taxa thumbnail gallery -->
      <div 
        v-if="descendantImages.length || isLoadingDescendants"
        :class="{ 'mt-4': images.length }"
      >
        <h3 
          v-if="images.length" 
          class="text-md font-semibold mb-3"
        >
          Images from {{ descendantLabel }}
        </h3>
        
        <!-- Loading state -->
        <div 
          v-if="isLoadingDescendants" 
          class="flex justify-center py-8"
        >
          <VSpinner 
            logo-class="w-8 h-8"
            legend="Loading descendant images..."
          />
        </div>
        
        <!-- Thumbnail grid -->
        <div 
          v-else
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
        >
          <router-link
            v-for="item in descendantImages"
            :key="item.otuId"
            :to="{ name: 'otus-id', params: { id: item.otuId } }"
            class="flex flex-col items-center group"
          >
            <div class="w-full aspect-square bg-base-background border border-base-muted rounded-md overflow-hidden hover:border-primary-500 transition-colors">
              <img
                v-if="item.image"
                :src="item.image.thumb"
                :alt="item.name"
                class="w-full h-full object-cover"
              />
              <div 
                v-else
                class="w-full h-full flex items-center justify-center text-base-muted"
              >
                No image
              </div>
            </div>
            <span 
              class="text-xs mt-1 text-center line-clamp-2 group-hover:text-primary-500"
              v-html="item.name"
            />
          </router-link>
        </div>
      </div>
    </VCardContent>
  </VCard>
</template>

<script setup>
import { ref, computed, onServerPrefetch, onMounted, onBeforeUnmount, watch } from 'vue'
import { useImageStore } from '../../../store/useImageStore'
import TaxonWorks from '../../../services/TaxonWorks'
import { useOtuPageRequest } from '../../../helpers/useOtuPageRequest'

const props = defineProps({
  otuId: {
    type: [String, Number],
    required: true
  },

  sort_order: {
    type: [Array],
    default: () => []
  },
  
  taxon: {
    type: Object,
    default: () => ({})
  }
})

const store = useImageStore()
const images = computed(() => store.images || [])
const descendantImages = ref([])
const taxonomy = ref(null)
const isLoadingDescendants = ref(false)

const descendantLabel = computed(() => {
  if (!taxonomy.value || !taxonomy.value.descendants.length) {
    return 'descendants'
  }
  
  // Get the rank of descendants to create an appropriate label
  const firstDescendant = taxonomy.value.descendants[0]
  if (firstDescendant) {
    // Simple pluralization - can be improved
    return 'descendant taxa'
  }
  return 'descendants'
})

async function loadDescendantImages() {
  isLoadingDescendants.value = true
  
  try {
    // Fetch taxonomy with descendants
    const { data } = await useOtuPageRequest('panel:gallery-descendants', () =>
      TaxonWorks.getTaxonomy(props.otuId, {
        params: { 
          max_descendants_depth: 999,  // Get all descendants recursively
          validity: true
        }
      })
    )
    
    taxonomy.value = data
    
    if (!data.descendants || data.descendants.length === 0) {
      return
    }
    
    // Collect all leaf descendant OTUs (species level taxa)
    const leafDescendants = []
    
    function collectLeafDescendants(node) {
      if (node.leaf_node) {
        // This is a leaf node (typically species level)
        leafDescendants.push(node)
      }
      if (node.descendants && node.descendants.length > 0) {
        node.descendants.forEach(descendant => {
          collectLeafDescendants(descendant)
        })
      }
    }
    
    collectLeafDescendants(data)
    
    // If no leaf descendants found, use immediate descendants
    const descendantsToShow = leafDescendants.length > 0 
      ? leafDescendants 
      : data.descendants
    
    // Limit to first 50 descendants to avoid overwhelming the API and UI
    const limitedDescendants = descendantsToShow.slice(0, 50)
    
    // For each descendant, fetch their first image
    const imagePromises = limitedDescendants.map(async (descendant) => {
      try {
        const response = await TaxonWorks.getOtuImages(descendant.otu_id, {
          params: {
            extend: ['depictions'],
            otu_scope: ['all', 'coordinate_otus']
          }
        })
        
        const firstImageId = response.data.image_order?.[0]
        const firstImage = firstImageId ? response.data.images[firstImageId] : null
        
        if (firstImage) {
          const { url, project_token } = __APP_ENV__
          
          if (firstImage.original_png) {
            firstImage.original = `${url}/${firstImage.original_png?.substring(8)}?project_token=${project_token}`
          }
        }
        
        return {
          otuId: descendant.otu_id,
          name: descendant.name,
          image: firstImage
        }
      } catch (e) {
        // Return null for taxa that fail to load
        return null
      }
    })
    
    const results = await Promise.all(imagePromises)
    
    // Filter to only include taxa with images
    descendantImages.value = results.filter(item => item !== null && item.image !== null)
  } catch (e) {
    console.error('Error loading descendant images:', e)
  } finally {
    isLoadingDescendants.value = false
  }
}

onServerPrefetch(async () => {
  await store.loadImages(props.otuId, { sortOrder: props.sortOrder })
  await loadDescendantImages()
})

onMounted(() => {
  if (!store.images) {
    store.loadImages(props.otuId, { sortOrder: props.sort_order })
  }
  if (descendantImages.value.length === 0 && !isLoadingDescendants.value) {
    loadDescendantImages()
  }
})

watch(() => props.otuId, () => {
  descendantImages.value = []
  loadDescendantImages()
})

onBeforeUnmount(() => {
  store.resetRequest()
  store.$reset()
})
</script>
