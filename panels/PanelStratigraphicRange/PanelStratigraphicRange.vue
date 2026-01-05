<!--
  Stratigraphic Range Panel
  
  This panel displays stratigraphic/geological time data for fossil occurrences.
  It integrates with the Paleobiology Database (paleobiodb.org) to fetch
  the international geological timescale, with a fallback to hardcoded Mesozoic data.
  
  Data sources:
  - Primary: Paleobiology Database API (https://paleobiodb.org/data1.2/timescales/diagram.json?id=1)
  - Fallback: ICS Chart 2024-12 (hardcoded in mesozoicData.js)
-->
<template>
  <VCard>
    <VCardHeader>Stratigraphic Range</VCardHeader>
    <VCardContent :class="isLoading && 'min-h-[6rem]'">
      <VSpinner v-if="isLoading" />
      <div
        v-else-if="!hasData"
        class="text-sm text-gray-600 p-4"
      >
        No stratigraphic data available for this taxon.
      </div>
      <div
        v-else
        class="stratigraphic-chart"
      >
        <!-- Period headers -->
        <div class="flex flex-col gap-2 mb-4">
          <div
            v-for="period in visiblePeriods"
            :key="period.name"
            class="period-section"
          >
            <div
              class="period-header text-sm font-bold p-2 rounded-t"
              :style="{ backgroundColor: getPeriodColor(period.name) }"
            >
              {{ period.name }}
            </div>
            
            <!-- Series within period -->
            <div
              v-for="series in period.series"
              :key="series.name"
              class="series-section"
            >
              <div class="series-header text-xs font-semibold p-2 bg-gray-100">
                {{ series.name }}
              </div>
              
              <!-- Stages within series -->
              <div class="stages-container">
                <div
                  v-for="stage in series.stages"
                  :key="stage.name"
                  class="stage-row flex items-center p-1 hover:bg-gray-50 cursor-pointer"
                  :class="{ 'bg-blue-50': hasOccurrenceInStage(stage.name) }"
                  :title="`${stage.name}: ${stage.start} - ${stage.end} Ma`"
                >
                  <div class="stage-name text-xs flex-1 pl-4">
                    {{ stage.name }}
                  </div>
                  <div class="stage-age text-xs text-gray-500 pr-2">
                    {{ stage.start }}-{{ stage.end }} Ma
                  </div>
                  <div
                    v-if="hasOccurrenceInStage(stage.name)"
                    class="occurrence-marker w-3 h-3 rounded-full bg-blue-600 mr-2"
                    :title="`${getOccurrenceCount(stage.name)} occurrence(s)`"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div class="legend mt-4 p-3 bg-gray-50 rounded text-xs">
          <div class="font-semibold mb-2">Legend</div>
          <div class="flex items-center gap-2 mb-1">
            <div class="w-3 h-3 rounded-full bg-blue-600" />
            <span>Species occurrence recorded</span>
          </div>
          <div class="text-gray-600 mt-2">
            Total occurrences: {{ totalOccurrences }}
          </div>
          <div class="text-gray-500 text-[10px] mt-2">
            Data source: {{ timescaleData ? DATA_SOURCE.PALEOBIODB : DATA_SOURCE.FALLBACK }}
          </div>
        </div>
      </div>
    </VCardContent>
  </VCard>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { makeAPIRequest } from '@/utils'
import { MESOZOIC_DATA, findStage as findStageFallback } from './mesozoicData.js'
import { fetchTimescaleData, findStage as findStagePaleobioDB, DATA_SOURCE } from './paleobioDBData.js'
import PaleobioDB from '@/services/PaleobioDB'

const props = defineProps({
  otuId: {
    type: Number,
    required: true
  },
  taxon: {
    type: Object,
    required: false,
    default: null
  }
})

const isLoading = ref(false)
const dwcRecords = ref([])
const occurrencesByStage = ref({})
const timescaleData = ref(null)

const hasData = computed(() => {
  return Object.keys(occurrencesByStage.value).length > 0
})

const totalOccurrences = computed(() => {
  return Object.values(occurrencesByStage.value).reduce((sum, count) => sum + count, 0)
})

const visiblePeriods = computed(() => {
  // Use PaleobioDB data if available, otherwise fall back to hardcoded data
  const dataSource = timescaleData.value || MESOZOIC_DATA
  
  if (!dataSource || !dataSource.periods) {
    return []
  }

  // Show all periods, series, and stages with occurrence flags
  return dataSource.periods.map(period => {
    const seriesWithFlags = period.series.map(series => {
      const stagesWithOccurrences = series.stages.filter(stage =>
        hasOccurrenceInStage(stage.name)
      )
      return {
        ...series,
        hasOccurrences: stagesWithOccurrences.length > 0
      }
    })

    return {
      ...period,
      series: seriesWithFlags,
      hasOccurrences: seriesWithFlags.some(s => s.hasOccurrences)
    }
  })
})

function getPeriodColor(periodName) {
  // First try to get color from loaded timescale data
  if (timescaleData.value && timescaleData.value.periods) {
    const period = timescaleData.value.periods.find(p => p.name === periodName)
    if (period && period.color) {
      return period.color
    }
  }
  
  // Fall back to hardcoded colors
  const colors = {
    'Triassic': '#812b92',
    'Jurassic': '#34b2c9',
    'Cretaceous': '#7fc64e'
  }
  return colors[periodName] || '#cccccc'
}

function hasOccurrenceInStage(stageName) {
  return occurrencesByStage.value[stageName.toLowerCase()] > 0
}

function getOccurrenceCount(stageName) {
  return occurrencesByStage.value[stageName.toLowerCase()] || 0
}

function extractGeologicalContext(record) {
  // Try to extract geological/stratigraphic information from various DWC fields
  const geologicalFields = [
    record.formation,
    record.member,
    record.group,
    record.bed,
    record.geologicalContextID,
    record.lithostratigraphicTerms,
    record.chronostratigraphicTerms,
    record.biostratigraphicTerms,
    record.earliestEonOrLowestEonothem,
    record.latestEonOrHighestEonothem,
    record.earliestEraOrLowestErathem,
    record.latestEraOrHighestErathem,
    record.earliestPeriodOrLowestSystem,
    record.latestPeriodOrHighestSystem,
    record.earliestEpochOrLowestSeries,
    record.latestEpochOrHighestSeries,
    record.earliestAgeOrLowestStage,
    record.latestAgeOrHighestStage
  ].filter(Boolean)

  return geologicalFields
}

function parseStratigraphicData(records) {
  const stageCount = {}
  const dataSource = timescaleData.value || MESOZOIC_DATA

  if (!dataSource || !dataSource.periods) {
    return stageCount
  }

  records.forEach(record => {
    const geologicalInfo = extractGeologicalContext(record)
    
    // Try to find stage names in the geological context
    geologicalInfo.forEach(info => {
      const infoStr = String(info).toLowerCase()
      
      // Check each stage in our timescale data
      dataSource.periods.forEach(period => {
        period.series.forEach(series => {
          series.stages.forEach(stage => {
            const stageName = stage.name.toLowerCase()
            
            // Use word boundary regex for more precise matching
            const regex = new RegExp(`\\b${stageName}\\b`, 'i')
            if (regex.test(infoStr)) {
              stageCount[stageName] = (stageCount[stageName] || 0) + 1
            }
          })
        })
      })
    })

    // Also check the specific DWC stage fields
    const earliestStage = record.earliestAgeOrLowestStage
    const latestStage = record.latestAgeOrHighestStage

    if (earliestStage) {
      const findStageFunc = timescaleData.value ? findStagePaleobioDB : findStageFallback
      const stage = findStageFunc(earliestStage, dataSource)
      if (stage) {
        const stageName = stage.name.toLowerCase()
        stageCount[stageName] = (stageCount[stageName] || 0) + 1
      }
    }

    if (latestStage && latestStage !== earliestStage) {
      const findStageFunc = timescaleData.value ? findStagePaleobioDB : findStageFallback
      const stage = findStageFunc(latestStage, dataSource)
      if (stage) {
        const stageName = stage.name.toLowerCase()
        stageCount[stageName] = (stageCount[stageName] || 0) + 1
      }
    }
  })

  return stageCount
}

/**
 * Parse PaleobioDB occurrence records to extract stratigraphic stages
 * @param {Array} occurrences - PaleobioDB occurrence records
 * @returns {Object} Stage counts
 */
function parsePaleobioDBOccurrences(occurrences) {
  const stageCount = {}
  const dataSource = timescaleData.value || MESOZOIC_DATA

  if (!dataSource || !dataSource.periods || !occurrences || !Array.isArray(occurrences)) {
    return stageCount
  }

  occurrences.forEach(occ => {
    // PaleobioDB provides early_interval and late_interval fields
    // which contain the stratigraphic interval names
    const earlyInterval = occ.eag || occ.early_interval
    const lateInterval = occ.lag || occ.late_interval
    
    // Try to match intervals to stages in our timescale
    const intervals = [earlyInterval, lateInterval].filter(Boolean)
    
    intervals.forEach(interval => {
      if (!interval) return
      
      const intervalStr = String(interval).toLowerCase().trim()
      
      // Try exact matching first
      const findStageFunc = timescaleData.value ? findStagePaleobioDB : findStageFallback
      const stage = findStageFunc(interval, dataSource)
      
      if (stage) {
        const stageName = stage.name.toLowerCase()
        stageCount[stageName] = (stageCount[stageName] || 0) + 1
      } else {
        // If no exact match, try partial matching
        dataSource.periods.forEach(period => {
          period.series.forEach(series => {
            series.stages.forEach(stage => {
              const stageName = stage.name.toLowerCase()
              // Check if interval string contains the stage name or vice versa
              if (intervalStr.includes(stageName) || stageName.includes(intervalStr)) {
                stageCount[stageName] = (stageCount[stageName] || 0) + 1
              }
            })
          })
        })
      }
    })
  })

  return stageCount
}

/**
 * Helper to get scientific name from taxon object
 */
function getTaxonScientificName(taxon) {
  if (!taxon) return null
  
  // Strip HTML tags if present
  const stripHtml = (html) => {
    if (!html) return ''
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }
  
  return taxon.cached || taxon.name || stripHtml(taxon.cached_html) || null
}

onMounted(async () => {
  isLoading.value = true
  
  // First, try to load timescale data from Paleobiology Database
  try {
    const paleobioData = await fetchTimescaleData()
    if (paleobioData && paleobioData.periods && paleobioData.periods.length > 0) {
      timescaleData.value = paleobioData
      console.log('Successfully loaded timescale data from Paleobiology Database')
    } else {
      console.warn('PaleobioDB returned empty data, using fallback Mesozoic data')
    }
  } catch (error) {
    console.warn('Failed to load timescale data from PaleobioDB, using fallback:', error)
  }
  
  // Fetch both local DWC records and PaleobioDB occurrences in parallel
  const promises = []
  
  // Fetch local DWC records
  promises.push(
    makeAPIRequest
      .get(`/otus/${props.otuId}/inventory/dwc.json`)
      .then((response) => {
        dwcRecords.value = response.data || []
        
        // Filter for collection objects
        const collectionObjects = dwcRecords.value.filter(
          item => item.dwc_occurrence_object_type === 'CollectionObject'
        )
        
        // Parse stratigraphic data from local records
        return parseStratigraphicData(collectionObjects)
      })
      .catch((error) => {
        console.error('Error fetching local DWC stratigraphic data:', error)
        return {}
      })
  )
  
  // Fetch PaleobioDB occurrences if taxon info is available
  if (props.taxon) {
    const scientificName = getTaxonScientificName(props.taxon)
    
    if (scientificName) {
      console.log('Fetching PaleobioDB occurrences for:', scientificName)
      
      promises.push(
        PaleobioDB.getOccurrences(scientificName)
          .then((data) => {
            if (data && data.records && data.records.length > 0) {
              console.log(`Found ${data.records.length} PaleobioDB occurrences`)
              return parsePaleobioDBOccurrences(data.records)
            } else {
              console.log('No PaleobioDB occurrences found')
              return {}
            }
          })
          .catch((error) => {
            console.error('Error fetching PaleobioDB occurrences:', error)
            return {}
          })
      )
    }
  }
  
  // Wait for all data sources and merge the results
  Promise.all(promises)
    .then((results) => {
      // Merge stage counts from all sources
      const mergedStageCount = {}
      
      results.forEach(stageCount => {
        Object.keys(stageCount).forEach(stage => {
          mergedStageCount[stage] = (mergedStageCount[stage] || 0) + stageCount[stage]
        })
      })
      
      occurrencesByStage.value = mergedStageCount
    })
    .finally(() => {
      isLoading.value = false
    })
})
</script>

<style scoped>
.stratigraphic-chart {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.period-header {
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.series-header {
  border-left: 3px solid #666;
}

.stage-row {
  border-left: 2px solid #e5e7eb;
  transition: background-color 0.2s;
}

.occurrence-marker {
  flex-shrink: 0;
}
</style>
