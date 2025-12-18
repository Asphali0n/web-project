import time
import pandas as pd
import os
from selenium import webdriver
from time import sleep
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

# URL configuration
FILE_URL = "https://pmc.ncbi.nlm.nih.gov/articles/instance/9733967/bin/mmc1.xlsx"
OUTPUT_FILENAME = "mmc1.xlsx"
current_folder = os.getcwd()
file_path = os.path.join(current_folder, OUTPUT_FILENAME)

def download_headless():
  current_folder = os.getcwd()
  chrome_options = Options()
  
  # --- ACTIVATE HEADLESS MODE ---
  chrome_options.add_argument("--headless=new") 
  
  # Configure download preferences (Critical for headless mode)
  prefs = {
    "download.default_directory": current_folder,
    "download.prompt_for_download": False,
    "download.directory_upgrade": True,
  }
  chrome_options.add_experimental_option("prefs", prefs)

  print("Launching Headless Browser...")
  driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
  
  try:
    driver.get(FILE_URL)
    file_path = os.path.join(current_folder, OUTPUT_FILENAME)
    timeout = 20 # seconds
    elapsed = 0
    
    print("Waiting for download to complete...")
    while not os.path.exists(file_path):
      time.sleep(1)
      elapsed += 1
      if elapsed > timeout:
        print("Timeout: File did not appear in time.")
        break

    if os.path.exists(file_path):
      print(f"Success! File saved at: {file_path}")
    
  except Exception as e:
    print(f"Error: {e}")
  finally:
    driver.quit()
def load_mmc1() :
  if os.path.exists(file_path):
    os.remove(file_path)
  download_headless()
  sleep(3)
  current_folder = os.getcwd()
  file_path = os.path.join(current_folder, OUTPUT_FILENAME)
  if os.path.exists(file_path):
    try :
      dataset = pd.read_excel(file_path, sheet_name='data')
      return dataset
    except Exception as e : 
      print('##',e)
  else :
    print("no file found")
