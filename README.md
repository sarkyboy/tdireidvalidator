# ReID Analysis Tool

This tool helps analyze and validate Re-Identification (ReID) results by providing a visual interface to review and verify identity matches.

## Features

- Visual display of all captured images grouped by UUID
- Duration filtering for identity appearances
- CSV import support for TDI Reporting data
- Accuracy calculation and statistics
- Interactive marking system for validation
- Related images viewing

## Installation

1. Make sure you have Go installed on your system
2. Clone this repository
3. Run `go build reid.go` to compile the program

## Usage

### Basic Usage

1. Open a terminal/command prompt
2. Navigate to the directory containing the program
3. Run the program with the target directory as an argument:
   ```
   ./reid [directory_path]
   ```
   Replace `[directory_path]` with the path to your ReID images directory

### Interface Guide

#### Main Interface
- Each UUID group shows:
  - First and last appearance times
  - Duration of appearances
  - Number of captures
  - All related images

#### Image Information
- Click on any image to view all related captures
- "Track ID" button: Click to copy the UUID
- "Appeared Before?" section:
  - "New Mark": Mark as a new appearance
  - "Already Marked": Mark as previously appeared

#### Duration Filter
- Use the slider to filter identities based on their appearance duration
- Helps focus on specific time ranges of interest

#### CSV Import (Optional)
1. Click "Choose File" in the CSV section
2. Select the CSV file exported from TDI Reporting (Data Query section)
3. The tool will automatically match UUIDs with the CSV data

### Understanding Statistics

#### Accuracy Metrics
- **Total Identities**: Total number of ReID records from GPU
- **Total Validated Identities**: Number of manually verified identities
- **OverMerged**: Count of different identities incorrectly merged as one
- **UnderMerged**: Count of same identities incorrectly split into different IDs
- **ReID Accuracy**: Calculated as:
  ```
  Accuracy = (1 - (OverMerged + UnderMerged) / TotalRecognized) * 100%
  ```

## Tips for Better Analysis

1. **Systematic Review**
   - Review identities in chronological order
   - Pay attention to appearance times and durations

2. **Validation Process**
   - Mark overmerged cases using the "Already Marked" button
   - Use the duration filter to focus on specific time periods

3. **CSV Integration**
   - Import CSV data for additional context
   - Cross-reference with TDI reporting data

4. **Performance Optimization**
   - Filter by duration to handle large datasets
   - Use the marking system to track progress

## Troubleshooting

### Common Issues

1. **Images Not Displaying**
   - Ensure image paths are accessible
   - Check if the program has necessary permissions
   - Verify image file formats (JPG only)

2. **CSV Import Issues**
   - Verify CSV format matches TDI Reporting export
   - Check for special characters in the CSV file
   - Ensure CSV is not open in another program

3. **Performance Issues**
   - Use duration filter to reduce displayed data
   - Close other resource-intensive applications
   - Check available system memory

### Support

For additional support or to report issues, please contact your system administrator or create an issue in the repository.
