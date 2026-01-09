/**
 * Data transformer for converting stratigraphic data to geo-timeline format
 * 
 * Converts hierarchical stratigraphic data (periods, series, stages)
 * into the flat array format required by @zjugis/geo-timeline
 */

/**
 * Transform stratigraphic data from nested structure to geo-timeline format
 * @param {Object} stratigraphicData - Nested data with periods, series, stages
 * @returns {Array} - Flat array of interval items for geo-timeline
 */
export function transformToGeoTimelineFormat(stratigraphicData) {
  if (!stratigraphicData || !stratigraphicData.periods) {
    return []
  }

  const intervals = []
  let idCounter = 1

  // Add root node
  const rootId = 0
  intervals.push({
    id: rootId,
    name: stratigraphicData.name || 'Geologic Time',
    color: '#666666',
    textColor: 'white',
    end: stratigraphicData.end || 0,
    start: stratigraphicData.start || 4000,
    level: 0
  })

  // Process each period
  stratigraphicData.periods.forEach((period) => {
    const periodId = idCounter++
    intervals.push({
      id: periodId,
      name: period.name,
      level: 1,
      parentId: rootId,
      color: period.color || '#cccccc',
      textColor: period.textColor || 'white',
      end: period.end,
      start: period.start
    })

    // Process each series in the period
    if (period.series && Array.isArray(period.series)) {
      period.series.forEach((series) => {
        const seriesId = idCounter++
        intervals.push({
          id: seriesId,
          name: series.name,
          level: 2,
          parentId: periodId,
          color: series.color || lightenColor(period.color || '#cccccc', 20),
          textColor: series.textColor || '#000000',
          end: series.end,
          start: series.start
        })

        // Process each stage in the series
        if (series.stages && Array.isArray(series.stages)) {
          series.stages.forEach((stage) => {
            const stageId = idCounter++
            intervals.push({
              id: stageId,
              name: stage.name,
              level: 3,
              parentId: seriesId,
              leaf: true,
              color: stage.color || lightenColor(period.color || '#cccccc', 40),
              textColor: stage.textColor || '#000000',
              end: stage.end,
              start: stage.start
            })
          })
        }
      })
    }
  })

  return intervals
}

/**
 * Lighten a hex color by a percentage
 * @param {string} color - Hex color code (e.g., '#812b92')
 * @param {number} percent - Percentage to lighten (0-100)
 * @returns {string} - Lightened hex color
 */
function lightenColor(color, percent) {
  if (!color || !color.startsWith('#')) {
    return '#cccccc'
  }

  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, ((num >> 16) & 0xff) + amt)
  const G = Math.min(255, ((num >> 8) & 0xff) + amt)
  const B = Math.min(255, (num & 0xff) + amt)

  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
}

/**
 * Get a list of stage names from the stratigraphic data
 * @param {Object} stratigraphicData - Nested data with periods, series, stages
 * @returns {Array<string>} - Array of stage names
 */
export function getStageNames(stratigraphicData) {
  if (!stratigraphicData || !stratigraphicData.periods) {
    return []
  }

  const stageNames = []

  stratigraphicData.periods.forEach((period) => {
    if (period.series && Array.isArray(period.series)) {
      period.series.forEach((series) => {
        if (series.stages && Array.isArray(series.stages)) {
          series.stages.forEach((stage) => {
            stageNames.push(stage.name)
          })
        }
      })
    }
  })

  return stageNames
}

/**
 * Find the first stage with occurrences
 * @param {Object} stratigraphicData - Nested data
 * @param {Object} occurrencesByStage - Map of stage names to occurrence counts
 * @returns {string|null} - Name of first stage with occurrences, or null
 */
export function findFirstOccurrenceStage(stratigraphicData, occurrencesByStage) {
  if (!stratigraphicData || !stratigraphicData.periods || !occurrencesByStage) {
    return null
  }

  // Normalize the occurrencesByStage keys to lowercase for more robust matching
  // Accumulate values if multiple keys normalize to the same lowercase key
  const normalizedOccurrences = {}
  Object.entries(occurrencesByStage).forEach(([key, value]) => {
    const normalizedKey = key.toLowerCase()
    // Only accumulate numeric values
    if (typeof value === 'number' && !isNaN(value)) {
      normalizedOccurrences[normalizedKey] = (normalizedOccurrences[normalizedKey] || 0) + value
    }
  })

  for (const period of stratigraphicData.periods) {
    if (period.series && Array.isArray(period.series)) {
      for (const series of period.series) {
        if (series.stages && Array.isArray(series.stages)) {
          for (const stage of series.stages) {
            const normalizedStageName = stage.name.toLowerCase()
            const occurrenceCount = normalizedOccurrences[normalizedStageName]
            // Check for valid count > 0 (using != null to catch both null and undefined)
            if (occurrenceCount != null && occurrenceCount > 0) {
              return stage.name
            }
          }
        }
      }
    }
  }

  return null
}
