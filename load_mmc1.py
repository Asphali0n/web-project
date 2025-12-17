import time
import pandas as pd
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.core.os_manager import ChromeType

# URL configuration
FILE_URL = "https://pmc.ncbi.nlm.nih.gov/articles/instance/9733967/bin/mmc1.xlsx"
OUTPUT_FILENAME = "mmc1.xlsx"

def download_headless():
    current_folder = os.getcwd()
    chrome_options = Options()
    
    # --- BRAVE CONFIGURATION ---
    # Point Selenium to the Brave executable
    # Check your path with `which brave` in terminal if this doesn't work.
    chrome_options.binary_location = "/usr/bin/brave" 
    
    # --- ACTIVATE HEADLESS MODE ---
    chrome_options.add_argument("--headless=new")
    
    # --- LINUX/HYPRLAND STABILITY FLAGS ---
    # These help prevent crashes in headless environments on Linux
    chrome_options.add_argument("--disable-gpu") 
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    # Configure download preferences
    prefs = {
        "download.default_directory": current_folder,
        "download.prompt_for_download": False,
        "download.directory_upgrade": True,
        "plugins.always_open_pdf_externally": True 
    }
    chrome_options.add_experimental_option("prefs", prefs)

    print("Launching Brave (Headless)...")
    
    # Use ChromeDriverManager with ChromeType.BRAVE to ensure version matching
    try:
        service = Service(ChromeDriverManager(chrome_type=ChromeType.BRAVE).install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
    except Exception as e:
        print(f"Driver setup failed: {e}")
        return

    try:
        driver.get(FILE_URL)
        file_path = os.path.join(current_folder, OUTPUT_FILENAME)
        timeout = 20 # seconds
        elapsed = 0
        
        print("Waiting for download to complete...")
        # Check for the file and ensure the temporary .crdownload file is gone
        while elapsed < timeout:
            if os.path.exists(file_path):
                # Small buffer to ensure write completion
                time.sleep(1) 
                print(f"Success! File saved at: {file_path}")
                break
            time.sleep(1)
            elapsed += 1
        else:
            print("Timeout: File did not appear in time.")

    except Exception as e:
        print(f"Error during execution: {e}")
    finally:
        driver.quit()

def load_mmc1():
    # Clear previous file if exists to ensure we get a fresh download
    if os.path.exists(OUTPUT_FILENAME):
        os.remove(OUTPUT_FILENAME)
        
    download_headless()
    
    current_folder = os.getcwd()
    file_path = os.path.join(current_folder, OUTPUT_FILENAME)
    
    if os.path.exists(file_path):
        try:
            print("Loading dataset...")
            # FIXED: Used read_excel instead of read_csv for .xlsx files
            dataset = pd.read_excel(file_path, sheet_name='data')
            print(f"Loaded dataset with shape: {dataset.shape}")
            return dataset
        except Exception as e:
            print(f"Error reading Excel file: {e}")
            print("Ensure you have 'openpyxl' installed: pip install openpyxl")
    else:
        print("No file found to load.")

if __name__ == "__main__":
    df = load_mmc1()
    if df is not None:
        print(df.head())