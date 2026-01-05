import PaleobioDB from '@/services/PaleobioDB'

/**
 * Fetch and transform geological timescale data from Paleobiology Database
 * This data will replace/enhance the hardcoded mesozoicData
 */

// Constants for Paleobiology Database interval types
const INTERVAL_TYPE = {
  PERIOD: 3,    // Period level (e.g., Triassic, Jurassic, Cretaceous)
  SERIES: 4,    // Series/Epoch level (e.g., Upper Jurassic)
  STAGE: 5      // Stage/Age level (e.g., Tithonian, Kimmeridgian)
}

// Geological time boundaries (in Ma - million years ago)
const TIME_BOUNDARY = {
  MESOZOIC_START: 252.0,  // Start of Mesozoic Era
  MESOZOIC_END: 66.0      // End of Mesozoic Era (K-Pg boundary)
}

// Data source labels
export const DATA_SOURCE = {
  PALEOBIODB: 'Paleobiology Database',
  FALLBACK: 'ICS Chart 2024-12'
}

let cachedTimescaleData = null

/**
 * Fetch timescale data from Paleobiology Database
 * @returns {Promise<Object>} Formatted timescale data
 */
export async function fetchTimescaleData() {
  // Return cached data if available
  if (cachedTimescaleData) {
    return cachedTimescaleData
  }

  try {
    const data = await PaleobioDB.getTimescaleDiagram(1)
    
    // Transform the data into the format expected by the chart component
    cachedTimescaleData = transformPaleobioDBData(data)
    return cachedTimescaleData
  } catch (error) {
    console.error('Failed to fetch timescale data from PaleobioDB:', error)
    // Return null to indicate failure - component can fall back to hardcoded data
    return null
  }
}

/**
 * Transform Paleobiology Database data into our internal format
 * @param {Object} data - Raw data from PaleobioDB
 * @returns {Object} Formatted data structure
 */
function transformPaleobioDBData(data) {
  if (!data || !data.records) {
    return null
  }

  // Group intervals by type (Period, Epoch/Series, Age/Stage)
  const periods = []
  const intervalMap = new Map()

  // First pass: create a map of all intervals by ID
  data.records.forEach(interval => {
    // Validate age values before parsing
    const startAge = parseFloat(interval.eag)
    const endAge = parseFloat(interval.lag)
    
    // Skip intervals with invalid age data
    if (isNaN(startAge) || isNaN(endAge)) {
      console.warn(`Skipping interval "${interval.nam}" with invalid age data:`, {
        eag: interval.eag,
        lag: interval.lag
      })
      return
    }
    
    intervalMap.set(interval.oid, {
      id: interval.oid,
      name: interval.nam,
      abbr: interval.abr,
      color: interval.col || '#cccccc',
      start: startAge,
      end: endAge,
      parentId: interval.pid,
      type: interval.lvl // Level/type of interval
    })
  })

  // Second pass: organize into hierarchical structure
  // Identify periods (typically level 3 in standard timescale)
  intervalMap.forEach(interval => {
    if (interval.type === INTERVAL_TYPE.PERIOD && 
        interval.start >= TIME_BOUNDARY.MESOZOIC_END && 
        interval.end <= TIME_BOUNDARY.MESOZOIC_START) {
      // This is likely a Mesozoic or Cenozoic period
      const period = {
        name: interval.name,
        color: interval.color,
        start: interval.start,
        end: interval.end,
        series: []
      }

      // Find child series (epochs)
      intervalMap.forEach(child => {
        if (child.parentId === interval.id && child.type === INTERVAL_TYPE.SERIES) {
          const series = {
            name: child.name,
            start: child.start,
            end: child.end,
            stages: []
          }

          // Find child stages (ages)
          intervalMap.forEach(stage => {
            if (stage.parentId === child.id && stage.type === INTERVAL_TYPE.STAGE) {
              series.stages.push({
                name: stage.name,
                start: stage.start,
                end: stage.end
              })
            }
          })

          // Sort stages by age (oldest first)
          series.stages.sort((a, b) => b.start - a.start)
          period.series.push(series)
        }
      })

      // Sort series by age (oldest first)
      period.series.sort((a, b) => b.start - a.start)
      periods.push(period)
    }
  })

  // Sort periods by age (oldest first)
  periods.sort((a, b) => b.start - a.start)

  return {
    name: 'Geological Timescale',
    source: DATA_SOURCE.PALEOBIODB,
    periods
  }
}

/**
 * Helper function to find a stage by name (case-insensitive)
 * Works with both cached PaleobioDB data and fallback data
 * @param {string} stageName - Name of the stage to find
 * @param {Object} timescaleData - Timescale data to search
 * @returns {Object|null} Stage data with period and series info
 */
export function findStage(stageName, timescaleData) {
  if (!stageName || !timescaleData || !timescaleData.periods) {
    return null
  }
  
  // Ensure stageName is a string before calling toLowerCase
  const searchName = String(stageName).toLowerCase().trim()
  
  // First try: exact match
  for (const period of timescaleData.periods) {
    for (const series of period.series) {
      for (const stage of series.stages) {
        if (stage.name.toLowerCase() === searchName) {
          return {
            ...stage,
            series: series.name,
            period: period.name
          }
        }
      }
    }
  }
  
  // Second try: normalize common variations
  // Remove common suffixes and qualifiers like "Stage", "Age", parentheses, etc.
  const normalizedSearch = searchName
    .replace(/\s+(stage|age)$/i, '')
    .replace(/\s*\([^)]*\)/g, '') // Remove parentheses and content
    .trim()
  
  if (normalizedSearch !== searchName) {
    for (const period of timescaleData.periods) {
      for (const series of period.series) {
        for (const stage of series.stages) {
          const normalizedStageName = stage.name.toLowerCase()
            .replace(/\s+(stage|age)$/i, '')
            .replace(/\s*\([^)]*\)/g, '')
            .trim()
          
          if (normalizedStageName === normalizedSearch) {
            return {
              ...stage,
              series: series.name,
              period: period.name
            }
          }
        }
      }
    }
  }
  
  return null
}

/**
 * Helper function to get all stages as a flat array
 * @param {Object} timescaleData - Timescale data
 * @returns {Array} Flat array of all stages
 */
export function getAllStages(timescaleData) {
  if (!timescaleData || !timescaleData.periods) {
    return []
  }

  const stages = []
  
  for (const period of timescaleData.periods) {
    for (const series of period.series) {
      for (const stage of series.stages) {
        stages.push({
          ...stage,
          series: series.name,
          period: period.name,
          periodColor: period.color
        })
      }
    }
  }
  
  return stages.sort((a, b) => b.start - a.start) // Sort oldest to youngest
}
