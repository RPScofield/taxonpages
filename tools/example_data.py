# Example Moult Data Configuration
# 
# Instructions:
# - Each section below represents one moult cycle
# - Enter 52 numbers (0-100) representing the % of birds in moult for each week
# - You can copy/paste data from spreadsheets
# - Use this file as a template to organize your data before editing the Python script
#
# Format example: [0, 0, 0, 20, 40, 60, 80, 100, 80, 60, 40, 20, 0, 0, ...]

# Post-Juvenile Moult (52 weeks)
# Example: Starts Week 5, peaks Week 10, ends Week 15
POST_JUVENILE = [0, 0, 0, 0, 20, 40, 60, 80, 100, 80, 60, 40, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

# 1st Basic Cycle (52 weeks)
# Example: Low level moult throughout winter
FIRST_BASIC = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 10, 20, 20, 10, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

# 1st Alternate Cycle (52 weeks)
# Example: Sharp peak in Spring (approx week 35-40)
FIRST_ALTERNATE = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 30, 60, 90, 100, 90, 60, 30, 10, 0, 0, 0, 0, 0, 0, 0, 0]

# Adult Basic Cycle (52 weeks)
# Example: Late summer heavy moult
ADULT_BASIC = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 80, 100, 100, 80, 50, 20]

# NOTES:
# - Week 1 = First week of January
# - Week 52 = Last week of December
# - Each value should be between 0-100
# - The script will auto-pad or trim to exactly 52 values if needed
