# TaxonPages Tools

This directory contains Python-based tools for various data collection and visualization tasks.

## Available Tools

1. **Moult Visualizer** - Creates circular visualizations of annual moult cycles for birds
2. **GSI Fossil Gallery Downloader** - Downloads fossil images from the Geological Survey of India

---

# Moult Visualizer Tool

A Python-based tool to create circular (polar) visualizations of annual moult cycles for birds. This tool displays the percentage of birds in moult across 52 weeks for different moult cycles.

## Overview

The Moult Visualizer creates a circular heatmap showing:
- **Post-Juvenile Moult** (inner ring)
- **1st Basic Cycle** (second ring)
- **1st Alternate Cycle** (third ring)
- **Adult Basic Cycle** (outer ring)

Each ring shows 52 weeks arranged in a circle, with months labeled around the perimeter. The color intensity represents the percentage of birds in moult (0-100%).

## Usage

### Option 1: Using GitHub Actions (Recommended)

1. Go to the **Actions** tab in your repository
2. Select the **Moult Visualizer** workflow
3. Click **Run workflow**
4. After the workflow completes, download the generated visualization from the **Artifacts** section

### Option 2: Running Locally

#### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

#### Installation

1. Install the required Python dependencies:
   ```bash
   pip install -r tools/requirements.txt
   ```

#### Running the Script

1. Navigate to the tools directory:
   ```bash
   cd tools
   ```

2. (Optional) Edit `moult_visualizer.py` to customize your data:
   - Open the file in a text editor
   - Find the "USER DATA INTERFACE" section
   - Modify the data arrays for each cycle (52 values, 0-100)
   - Alternatively, refer to `example_data.py` for a template with all 52 weeks laid out

3. Run the visualizer:
   ```bash
   python moult_visualizer.py
   ```

4. The visualization will be saved as `moult_visualization.png` in the tools directory

## Customizing Your Data

You can customize the moult data in two ways:

### Method 1: Edit the Python Script Directly

Edit the `moult_visualizer.py` file and modify the data arrays in the "USER DATA INTERFACE" section:

```python
# 1. Post-Juvenile Moult (52 weeks)
pj_data = [0]*4 + [20, 40, 60, 80, 100, 80, 60, 40, 20] + [0]*39

# 2. 1st Basic Cycle (52 weeks)
fb_data = [0]*15 + [10, 10, 20, 20, 10, 10] + [0]*31

# 3. 1st Alternate Cycle (52 weeks)
fa_data = [0]*35 + [10, 30, 60, 90, 100, 90, 60, 30, 10] + [0]*8

# 4. Adult Basic Cycle (52 weeks)
ab_data = [0]*45 + [50, 80, 100, 100, 80, 50, 20]
```

Each array should contain exactly 52 numbers (0-100) representing the percentage of birds in moult for each week of the year.

### Method 2: Use the Example Data Template

The `example_data.py` file provides a template with all 52 weeks explicitly laid out for each cycle. This makes it easier to:
- See the full year at a glance
- Copy/paste data from spreadsheets
- Organize your data before editing the main script

After preparing your data in `example_data.py`, copy the values to the corresponding arrays in `moult_visualizer.py`.

### Tips for Data Entry

- You can paste data directly from a spreadsheet column
- The script automatically pads or trims lists to exactly 52 items
- Use Python list notation: `[0]*10` creates 10 zeros
- Concatenate lists with `+`: `[0]*5 + [50, 100, 50] + [0]*44`

## Customizing the Visualization

You can modify the visualization by editing the script (advanced users):

### Change Color Scheme

Find this line in the script:
```python
cmap = plt.cm.YlOrRd  # Yellow-Orange-Red colormap
```

Replace with other matplotlib colormaps:
- `plt.cm.Blues` - White to dark blue
- `plt.cm.Greens` - White to dark green
- `plt.cm.Reds` - White to dark red
- `plt.cm.Viridis` - Viridis colormap
- `plt.cm.Plasma` - Plasma colormap

### Change Ring Labels

Modify the `ring_labels` list:
```python
ring_labels = ["Post-Juv", "1st Basic", "1st Alt", "Adult Basic"]
```

## Output

The script generates:
- **File**: `moult_visualization.png`
- **Resolution**: 300 DPI (publication quality)
- **Format**: PNG with transparent background support
- **Size**: 12x12 inches (3600x3600 pixels at 300 DPI)

## Example Visualization

The default data creates a visualization showing:
- Post-juvenile moult peaking around week 10 (early March)
- Light first basic moult in winter (weeks 15-20)
- Strong first alternate moult in spring (weeks 35-40)
- Heavy adult basic moult in late summer (weeks 45-52)

## Technical Details

- **Framework**: matplotlib with polar projection
- **Data Structure**: 4 rings × 52 weeks = 208 data points
- **Time Direction**: Clockwise from North (Week 1 = top)
- **Month Labels**: Positioned at month midpoints
- **Colormap**: Normalized 0-100% scale

## Troubleshooting

### Missing Dependencies

If you get import errors, install the requirements:
```bash
pip install -r tools/requirements.txt
```

### Python Version Issues

Ensure you're using Python 3.8 or higher:
```bash
python --version
```

### File Not Found

Make sure you're in the correct directory:
```bash
cd /path/to/taxonpages/tools
python moult_visualizer.py
```

---

# GSI Fossil Gallery Downloader

A functional test tool that downloads fossil images from the Geological Survey of India (GSI) photo gallery. This tool searches for images containing 'Paleontology' in their source path and saves them to a local directory.

## Overview

The GSI Fossil Gallery Downloader:
- Connects to the GSI public photo gallery
- Searches for all images with 'Paleontology' in their URL
- Downloads fossil images automatically
- Saves images to a `GSI_Fossils_Download` directory

## Usage

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- Internet connection

### Installation

1. Install the required Python dependencies:
   ```bash
   pip install -r tools/requirements.txt
   ```

### Running the Script

1. Navigate to the tools directory:
   ```bash
   cd tools
   ```

2. Run the downloader:
   ```bash
   python gsi_gallery_downloader.py
   ```

3. The script will:
   - Create a `GSI_Fossils_Download` directory if it doesn't exist
   - Connect to the GSI photo gallery
   - Search for paleontology images
   - Download and save them locally

### Output

- **Directory**: `GSI_Fossils_Download/` (created automatically)
- **Files**: Downloaded fossil images with their original filenames
- **Console Output**: Progress information including:
  - Connection status
  - Number of images found
  - Download progress
  - Final count of saved images

## Technical Details

- **Source**: https://www.gsi.gov.in/webcenter/portal/OCBIS/pages_pageGeoInfo/pagePhotoGallery
- **Filter**: Images containing 'Paleontology' in their source path
- **Timeout**: 20 seconds for connection
- **User-Agent**: Configured to mimic a standard browser

## Troubleshooting

### Connection Issues

If you encounter connection errors:
- Check your internet connection
- Verify the GSI website is accessible
- Try again later (the site may be temporarily unavailable)

### Missing Dependencies

If you get import errors, install the requirements:
```bash
pip install -r tools/requirements.txt
```

### Permission Errors

Make sure you have write permissions in the tools directory:
```bash
chmod +x gsi_gallery_downloader.py
```

## Notes

- The downloaded images are saved locally and are excluded from version control via `.gitignore`
- This tool serves as a functional test for web scraping capabilities
- The script is designed to be respectful of the source website with appropriate timeouts and headers

## Contributing

To improve this tool:
1. Fork the repository
2. Make your changes to `tools/moult_visualizer.py`
3. Test locally
4. Submit a pull request

## License

This tool is part of the TaxonPages project. See the main repository LICENSE file for details.
