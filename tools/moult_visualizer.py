#!/usr/bin/env python3
"""
Moult Visualizer - A tool to visualize annual moult cycles

This script creates a circular (polar) visualization showing the percentage of birds
in moult across 52 weeks for different moult cycles.
"""

import matplotlib.pyplot as plt
import numpy as np
import matplotlib.cm as cm
import matplotlib.colors as mcolors


def run_moult_visualizer():
    # ==========================================
    #   USER DATA INTERFACE (EDIT THIS SECTION)
    # ==========================================
    # Instructions: 
    # Enter 52 numbers (0-100) for each cycle representing the % of birds in moult.
    # You can paste these directly from a spreadsheet column.
    
    # 1. Post-Juvenile Moult (52 weeks)
    # Example: Starts Week 5, peaks Week 10, ends Week 15
    pj_data = [0]*4 + [20, 40, 60, 80, 100, 80, 60, 40, 20] + [0]*39
    
    # 2. 1st Basic Cycle (52 weeks)
    # Example: Low level moult throughout winter
    fb_data = [0]*15 + [10, 10, 20, 20, 10, 10] + [0]*31
    
    # 3. 1st Alternate Cycle (52 weeks)
    # Example: Sharp peak in Spring (approx week 35-40)
    fa_data = [0]*35 + [10, 30, 60, 90, 100, 90, 60, 30, 10] + [0]*8
    
    # 4. Adult Basic Cycle (52 weeks)
    # Example: Late summer heavy moult
    ab_data = [0]*45 + [50, 80, 100, 100, 80, 50, 20] 

    # (Auto-fill ensuring lists are exactly 52 items long in case of copy-paste errors)
    def pad_data(d): return (d + [0]*52)[:52]
    pj_data = pad_data(pj_data)
    fb_data = pad_data(fb_data)
    fa_data = pad_data(fa_data)
    ab_data = pad_data(ab_data)

    # ==========================================
    #   VISUALIZATION LOGIC (DO NOT EDIT BELOW)
    # ==========================================
    
    # Setup Data Structure
    all_data = [pj_data, fb_data, fa_data, ab_data]
    ring_labels = ["Post-Juv", "1st Basic", "1st Alt", "Adult Basic"]
    
    # Setup Time (52 Weeks)
    N = 52
    theta = np.linspace(0.0, 2 * np.pi, N, endpoint=False)
    width = 2 * np.pi / N
    
    # Setup Figure
    fig, ax = plt.subplots(figsize=(12, 12), subplot_kw={'projection': 'polar'})
    ax.set_theta_zero_location("N")
    ax.set_theta_direction(-1) # Clockwise
    
    # --- DRAW RINGS ---
    
    # 1. Inner Ring: Months (Visual Reference)
    month_labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    # We plot a white ring for the month track
    ax.bar(theta, [1]*N, width=width, bottom=1.5, color='white', edgecolor='lightgray', linewidth=0.5)
    
    # Place Month Labels (every ~4.3 weeks)
    for i, label in enumerate(month_labels):
        # Calculate angle for the middle of the month
        # 52 weeks / 12 months = 4.33 weeks per month
        week_index = i * (52/12) + (52/24) 
        angle = week_index * (2 * np.pi / 52)
        
        # Adjust text rotation
        rotation = np.degrees(-angle)
        if -90 > rotation > -270: rotation += 180 
            
        ax.text(angle, 2.0, label, ha='center', va='center', rotation=rotation, 
                fontsize=10, fontweight='bold', color='#333333')

    # 2. Data Rings (Heatmap Style)
    base_radius = 3.0
    
    # Colormap: White (0%) -> Dark Blue (100%)
    # You can change 'Blues' to 'Reds', 'Greens', 'Viridis', etc.
    cmap = plt.cm.YlOrRd 
    norm = mcolors.Normalize(vmin=0, vmax=100)
    
    for i, (dataset, label) in enumerate(zip(all_data, ring_labels)):
        radius = base_radius + i
        
        # We plot each week as a separate bar segment with its own color
        colors = [cmap(norm(val)) if val > 0 else '#f9f9f9' for val in dataset]
        edge_colors = ['#eeeeee' if val == 0 else 'none' for val in dataset]
        
        ax.bar(theta, [1]*N, width=width, bottom=radius, color=colors, edgecolor=edge_colors, linewidth=0.5)
        
        # Add Ring Label at the start (Week 0 / Jan 1)
        ax.text(0, radius + 0.5, label, ha='left', va='center', fontsize=9, fontweight='bold')

    # --- FORMATTING ---
    ax.set_axis_off()
    
    # Add a Colorbar Key
    sm = cm.ScalarMappable(cmap=cmap, norm=norm)
    sm.set_array([])
    cbar = plt.colorbar(sm, ax=ax, pad=0.1, shrink=0.3, aspect=15)
    cbar.set_label('% Birds in Moult', rotation=270, labelpad=15)
    
    plt.title("Annual Moult Cycle (Weekly Resolution)", fontsize=16, y=1.02)
    
    # Save the figure
    output_file = 'moult_visualization.png'
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    print(f"Visualization saved to: {output_file}")
    
    # Also show if running interactively
    # plt.show()


if __name__ == "__main__":
    run_moult_visualizer()
