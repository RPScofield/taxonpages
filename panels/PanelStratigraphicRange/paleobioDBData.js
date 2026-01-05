import PaleobioDB from '@/services/PaleobioDB'

/**
 * Fetch and transform geological timescale data from Paleobiology Database
 * This data will replace/enhance the hardcoded mesozoicData
 */

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
    intervalMap.set(interval.oid, {
      id: interval.oid,
      name: interval.nam,
      abbr: interval.abr,
      color: interval.col || '#cccccc',
      start: parseFloat(interval.eag),
      end: parseFloat(interval.lag),
      parentId: interval.pid,
      type: interval.lvl // Level/type of interval
    })
  })

  // Second pass: organize into hierarchical structure
  // Identify periods (typically level 3 in standard timescale)
  intervalMap.forEach(interval => {
    if (interval.type === 3 && interval.start >= 66.0 && interval.end <= 252.0) {
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
        if (child.parentId === interval.id && child.type === 4) {
          const series = {
            name: child.name,
            start: child.start,
            end: child.end,
            stages: []
          }

          // Find child stages (ages)
          intervalMap.forEach(stage => {
            if (stage.parentId === child.id && stage.type === 5) {
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
    source: 'Paleobiology Database',
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
  
  const searchName = stageName.toLowerCase().trim()
  
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
