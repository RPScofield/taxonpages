// Mesozoic Era stratigraphic data based on ICS Chart 2024-12
// Time in Ma (million years ago)
// Colors based on International Chronostratigraphic Chart 2024

export const MESOZOIC_DATA = {
  name: 'Mesozoic',
  start: 251.902,
  end: 66.0,
  color: '#67c5ca',
  periods: [
    {
      name: 'Triassic',
      start: 251.902,
      end: 201.4,
      color: '#812b92',
      series: [
        {
          name: 'Upper Triassic',
          start: 237.0,
          end: 201.4,
          stages: [
            { name: 'Rhaetian', start: 208.5, end: 201.4 },
            { name: 'Norian', start: 227.0, end: 208.5 },
            { name: 'Carnian', start: 237.0, end: 227.0 }
          ]
        },
        {
          name: 'Middle Triassic',
          start: 247.2,
          end: 237.0,
          stages: [
            { name: 'Ladinian', start: 242.0, end: 237.0 },
            { name: 'Anisian', start: 247.2, end: 242.0 }
          ]
        },
        {
          name: 'Lower Triassic',
          start: 251.902,
          end: 247.2,
          stages: [
            { name: 'Olenekian', start: 251.2, end: 247.2 },
            { name: 'Induan', start: 251.902, end: 251.2 }
          ]
        }
      ]
    },
    {
      name: 'Jurassic',
      start: 201.4,
      end: 145.0,
      color: '#34b2c9',
      series: [
        {
          name: 'Upper Jurassic',
          start: 163.5,
          end: 145.0,
          stages: [
            { name: 'Tithonian', start: 149.2, end: 145.0 },
            { name: 'Kimmeridgian', start: 154.8, end: 149.2 },
            { name: 'Oxfordian', start: 161.5, end: 154.8 },
            { name: 'Callovian', start: 163.5, end: 161.5 }
          ]
        },
        {
          name: 'Middle Jurassic',
          start: 174.7,
          end: 163.5,
          stages: [
            { name: 'Bathonian', start: 168.2, end: 163.5 },
            { name: 'Bajocian', start: 170.9, end: 168.2 },
            { name: 'Aalenian', start: 174.7, end: 170.9 }
          ]
        },
        {
          name: 'Lower Jurassic',
          start: 201.4,
          end: 174.7,
          stages: [
            { name: 'Toarcian', start: 184.2, end: 174.7 },
            { name: 'Pliensbachian', start: 192.9, end: 184.2 },
            { name: 'Sinemurian', start: 199.5, end: 192.9 },
            { name: 'Hettangian', start: 201.4, end: 199.5 }
          ]
        }
      ]
    },
    {
      name: 'Cretaceous',
      start: 145.0,
      end: 66.0,
      color: '#7fc64e',
      series: [
        {
          name: 'Upper Cretaceous',
          start: 100.5,
          end: 66.0,
          stages: [
            { name: 'Maastrichtian', start: 72.1, end: 66.0 },
            { name: 'Campanian', start: 83.6, end: 72.1 },
            { name: 'Santonian', start: 86.3, end: 83.6 },
            { name: 'Coniacian', start: 89.8, end: 86.3 },
            { name: 'Turonian', start: 93.9, end: 89.8 },
            { name: 'Cenomanian', start: 100.5, end: 93.9 }
          ]
        },
        {
          name: 'Lower Cretaceous',
          start: 145.0,
          end: 100.5,
          stages: [
            { name: 'Albian', start: 113.0, end: 100.5 },
            { name: 'Aptian', start: 121.4, end: 113.0 },
            { name: 'Barremian', start: 125.77, end: 121.4 },
            { name: 'Hauterivian', start: 132.6, end: 125.77 },
            { name: 'Valanginian', start: 139.8, end: 132.6 },
            { name: 'Berriasian', start: 145.0, end: 139.8 }
          ]
        }
      ]
    }
  ]
}

// Helper function to find a stage by name (case-insensitive)
export function findStage(stageName) {
  if (!stageName) return null
  
  // Ensure stageName is a string before calling toLowerCase
  const searchName = String(stageName).toLowerCase().trim()
  
  // First try: exact match
  for (const period of MESOZOIC_DATA.periods) {
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
    for (const period of MESOZOIC_DATA.periods) {
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

// Helper function to get all stages as a flat array
export function getAllStages() {
  const stages = []
  
  for (const period of MESOZOIC_DATA.periods) {
    for (const series of period.series) {
      for (const stage of series.stages) {
        stages.push({
          ...stage,
          series: series.name,
          period: period.name
        })
      }
    }
  }
  
  return stages.sort((a, b) => b.start - a.start) // Sort oldest to youngest
}
