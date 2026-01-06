#!/usr/bin/env python3
"""
GSI Fossil Gallery Downloader - A functional test tool

This script downloads fossil images from the Geological Survey of India (GSI)
photo gallery. It searches for images containing 'Paleontology' in their source
path and saves them to a local directory.
"""

import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin


def run_functional_test():
    # The actual public gallery page
    gallery_url = "https://www.gsi.gov.in/webcenter/portal/OCBIS/pages_pageGeoInfo/pagePhotoGallery"
    save_folder = "GSI_Fossils_Download"
    
    if not os.path.exists(save_folder):
        os.makedirs(save_folder)

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/110.0.0.0 Safari/537.36"
    }

    print(f"--- Starting Test on {gallery_url} ---")
    
    try:
        response = requests.get(gallery_url, headers=headers, timeout=20)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # GSI uses specific patterns for their fossil images
        # We look for all images that contain 'Paleontology' in their source path
        images = soup.find_all('img')
        
        found_count = 0
        for img in images:
            src = img.get('src')
            if src and 'Paleontology' in src:
                img_url = urljoin(gallery_url, src)
                filename = src.split('/')[-1].split('?')[0] # Clean filename
                
                print(f"Found image: {filename}")
                
                # Download logic
                img_data = requests.get(img_url, headers=headers).content
                with open(os.path.join(save_folder, filename), 'wb') as f:
                    f.write(img_data)
                found_count += 1

        print(f"\nTest Complete. {found_count} images saved to '{save_folder}'.")

    except Exception as e:
        print(f"Test Failed: {e}")


if __name__ == "__main__":
    run_functional_test()
