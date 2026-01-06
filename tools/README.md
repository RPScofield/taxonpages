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

3. Run the visualizer:
   ```bash
   python moult_visualizer.py
   ```

4. The visualization will be saved as `moult_visualization.png` in the tools directory

## Customizing Your Data

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

## Contributing

To improve this tool:
1. Fork the repository
2. Make your changes to `tools/moult_visualizer.py`
3. Test locally
4. Submit a pull request

## License

This tool is part of the TaxonPages project. See the main repository LICENSE file for details.
