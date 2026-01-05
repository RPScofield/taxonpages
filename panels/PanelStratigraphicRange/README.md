# Enhanced Stratigraphic Visualization

This document describes the enhanced stratigraphic range panel that integrates the `@zjugis/geo-timeline` library to provide an interactive, visually attractive geological timescale display.

## Overview

The stratigraphic range panel now features two visualization modes:

1. **List View** - The original simple hierarchical list of periods, series, and stages
2. **Timeline View** - An interactive D3.js-based geological timeline with zoom and navigation

## Features

### Interactive Timeline View
- **Interactive Navigation**: Click on geological stages to navigate the timeline
- **Zoom Support**: Use mouse wheel to zoom in and out for detailed exploration
- **Hierarchical Display**: Shows periods, series, and stages in a visually organized manner
- **Color-Coded Periods**: Each geological period uses standard ICS (International Chronostratigraphic Chart) colors
- **Occurrence Highlighting**: Displays fossil occurrences when available
- **Stage Information**: Shows detailed information about selected stages including time ranges

### View Toggle
Users can switch between list and timeline views using toggle buttons in the panel header.

## Implementation Details

### New Files

#### 1. `GeoTimeScaleViewer.client.vue`
A Vue component that wraps the `GeoTimeScale` from the geo-timeline library. It's marked as `.client.vue` to ensure it only loads on the client side (not during SSR) since D3.js requires browser APIs.

**Props:**
- `intervals` (Array): Geological time interval data in geo-timeline format
- `height` (Number): Height of the timeline visualization (default: 400px)
- `simplify` (Boolean): Whether to show simplified view (default: true)
- `initialStage` (String): Initial stage to focus on
- `occurrenceStages` (Array): Array of stage names with occurrences

**Events:**
- `stage-change`: Emitted when user selects a different stage

#### 2. `dataTransformer.js`
Utility functions for transforming data between the internal hierarchical format and the flat array format required by geo-timeline.

**Functions:**
- `transformToGeoTimelineFormat(stratigraphicData)`: Converts nested period/series/stage structure to flat interval array
- `lightenColor(color, percent)`: Helper to generate lighter shades for child intervals
- `getStageNames(stratigraphicData)`: Extracts all stage names from the data
- `findFirstOccurrenceStage(stratigraphicData, occurrencesByStage)`: Finds the first stage with fossil occurrences

### Modified Files

#### `PanelStratigraphicRange.vue`
Enhanced with:
- View mode toggle (list/timeline)
- Integration of GeoTimeScaleViewer component
- Data transformation for geo-timeline format
- Stage selection and information display
- Separate legends for each view mode

#### `mesozoicData.js`
Added color information to geological periods based on ICS Chart 2024:
- Triassic: `#812b92` (purple)
- Jurassic: `#34b2c9` (blue)
- Cretaceous: `#7fc64e` (green)

## Dependencies

### Added Dependencies
- `@zjugis/geo-timeline` (^1.6.0): The core visualization library
- `d3` (^7.9.0): D3.js library for data-driven visualizations

These are listed in `package.json` and should be installed with `npm install`.

## Data Format

The geo-timeline library expects data in a specific flat array format:

```javascript
[
  {
    id: 0,              // Unique numeric ID
    name: "Mesozoic",   // Display name
    color: "#67c5ca",   // Hex color code
    textColor: "white", // Text color for contrast
    end: 66.0,          // End time in Ma (million years ago)
    start: 251.902,     // Start time in Ma
    level: 0            // Hierarchy level (0 = root)
  },
  {
    id: 1,
    name: "Triassic",
    level: 1,           // Level 1 = Period
    parentId: 0,        // Parent interval ID
    color: "#812b92",
    textColor: "white",
    end: 201.4,
    start: 251.902
  },
  {
    id: 2,
    name: "Upper Triassic",
    level: 2,           // Level 2 = Series
    parentId: 1,
    color: "#a341b8",
    end: 201.4,
    start: 237.0
  },
  {
    id: 3,
    name: "Rhaetian",
    level: 3,           // Level 3 = Stage
    parentId: 2,
    leaf: true,         // Indicates this is a leaf node
    color: "#c06bd9",
    end: 201.4,
    start: 208.5
  }
]
```

## Usage

The panel is automatically available in the taxa page layout when configured in `taxa_page.yml`:

```yaml
taxa_page:
  overview:
    panels:
      - - - panel:stratigraphic-range
```

No additional configuration is needed - the panel will:
1. Load timescale data from Paleobiology Database (if available)
2. Fall back to hardcoded Mesozoic data
3. Fetch occurrence data from local DWC records and PaleobioDB
4. Display the interactive timeline by default

## Browser Compatibility

The visualization requires modern browser features:
- SVG support
- ES6+ JavaScript
- Mouse/touch events for interaction

The component uses `ClientOnly` wrapper to ensure it only renders on the client side, preventing SSR issues.

## Performance Considerations

- The timeline data is transformed once on mount and cached
- D3.js animations are optimized with transition timing (450ms default)
- Large datasets are simplified in the "simplify" mode to show only 2 levels at once

## Future Enhancements

Potential improvements for future iterations:
- Integration of GeoTimeLine for horizontal timeline view
- Integration of GeoTimeSlider for time range selection
- Support for custom timescales beyond Mesozoic
- Export functionality for timeline images
- Comparison view for multiple taxa

## Testing

To test the visualization locally:
1. Install dependencies: `npm install`
2. Build the project: `npm run build`
3. Run development server: `npm run dev`
4. Navigate to a taxon page with stratigraphic data

A standalone demo is also available in `/tmp/geo-timeline-demo.html` for quick testing of the geo-timeline integration.

## Credits

This implementation uses the excellent [geo-timeline](https://github.com/hongfaqiu/geo-timeline) library by hongfaqiu, which provides D3.js-based geological timeline visualizations.
