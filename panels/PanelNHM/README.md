# PanelNHM - Natural History Museum Integration

This panel integrates with the Natural History Museum's Data Portal (https://data.nhm.ac.uk) to display specimen records and images for taxa.

## Features

- Fetches specimen records from the NHM CKAN API based on the taxon's scientific name
- Displays specimen images in a gallery format using the TaxonPages GalleryImage component
- Shows collection location data for specimens
- Provides links to the full NHM Data Portal for detailed records
- Automatically handles API requests with proper error handling and loading states

## API Integration

The panel integrates with the Natural History Museum's Data Portal API, which provides a RESTful interface returning data in JSON format.

- **API Documentation**: https://data.nhm.ac.uk/api.html
- **Base URL**: `https://data.nhm.ac.uk/api/3`
- **Resource ID**: `05ff2255-c38a-40c9-b657-4ccb55ab2feb` (Collection specimens)
- **Endpoint**: `action/datastore_search` - CKAN datastore search action
- **Method**: GET with query parameters
- **Response Format**: JSON

The panel uses the `datastore_search` action to query specimen records by scientific name.

## Data Displayed

1. **Specimen Count**: Total number of specimens found in the NHM catalogue
2. **Specimen Images**: Up to 20 images from specimen records, displayed in an interactive gallery
3. **Collection Locations**: Up to 10 unique collection locations with:
   - Locality information
   - Country
   - GPS coordinates (when available)

## Image Fields

The panel attempts to extract images from various possible fields in the specimen records:
- `associatedMedia`
- `multimedia`
- `image`
- `imageURL`
- `associatedMediaURL`

Images are displayed using the TaxonPages `GalleryImage` component for consistent UI and full-screen viewing capabilities.

## Configuration

The panel is configured in `config/taxa_page.yml`:

```yaml
taxa_page:
  overview:
    panels:
      - - - panel:gallery
          ...
        - - panel:map
          ...
          - panel:nhm  # Natural History Museum panel
          ...
```

## Usage

The panel automatically loads when viewing a taxon page and will:
1. Extract the scientific name from the taxon
2. Query the NHM API for matching specimens
3. Display results with images and location data
4. Handle errors gracefully if the API is unavailable

## Limitations

- Maximum of 100 specimen records retrieved per query
- Maximum of 20 images displayed
- Maximum of 10 unique locations shown
- Requires internet connectivity to access the NHM API
- Some taxa may not have records in the NHM catalogue

## Future Enhancements

Possible improvements:
- Integration with the main gallery panel to merge NHM images with TaxonWorks images
- Additional filtering options (by date, location, etc.)
- Display of specimen metadata (collector, date, etc.)
- Pagination for viewing more than 100 records
- Caching of API responses to improve performance

## Technical Details

- **Framework**: Vue 3 Composition API
- **HTTP Client**: Axios
- **State Management**: Vue Composition API refs and computed properties
- **UI Components**: TaxonPages global components (VCard, VSpinner, GalleryImage, etc.)
