<!--
  Enhanced Stratigraphic Visualization using geo-timeline library
  
  This component uses the GeoTimeScale from @zjugis/geo-timeline to provide
  an interactive, visually attractive stratigraphic timescale display with
  zoom and navigation capabilities.
-->
<template>
  <div
    ref="containerRef"
    class="geo-timescale-container"
    :style="{ height: `${height}px` }"
  />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { GeoTimeScale } from '@zjugis/geo-timeline'

const props = defineProps({
  intervals: {
    type: Array,
    required: true,
    default: () => []
  },
  height: {
    type: Number,
    default: 400
  },
  simplify: {
    type: Boolean,
    default: true
  },
  initialStage: {
    type: String,
    default: null
  },
  occurrenceStages: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['stage-change'])

const containerRef = ref(null)
let geoTimeScale = null

onMounted(() => {
  if (!containerRef.value || !props.intervals || props.intervals.length === 0) {
    return
  }

  try {
    // Create the GeoTimeScale instance
    geoTimeScale = new GeoTimeScale(containerRef.value, props.intervals, {
      height: props.height,
      simplify: props.simplify,
      neighborWidth: 100,
      tickLength: 15,
      fontSize: 12,
      transition: 450,
      onChange: (node) => {
        emit('stage-change', node)
      }
    })

    // Set initial stage if provided
    if (props.initialStage && geoTimeScale) {
      geoTimeScale.stage = props.initialStage
    }
  } catch (error) {
    console.error('Error initializing GeoTimeScale:', error)
  }
})

// Watch for stage changes from parent
watch(() => props.initialStage, (newStage) => {
  if (geoTimeScale && newStage) {
    try {
      geoTimeScale.stage = newStage
    } catch (error) {
      console.warn('Error setting stage:', error)
    }
  }
})

onBeforeUnmount(() => {
  // Cleanup if needed
  if (geoTimeScale && containerRef.value) {
    // Clear the container
    containerRef.value.innerHTML = ''
  }
})
</script>

<style scoped>
.geo-timescale-container {
  width: 100%;
  overflow: hidden;
}

/* Override default geo-timeline styles if needed */
.geo-timescale-container :deep(svg) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.geo-timescale-container :deep(text) {
  user-select: none;
}
</style>
