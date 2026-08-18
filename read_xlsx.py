import urllib.request
import pandas as pd

url = "https://docs.google.com/spreadsheets/d/1hva7q5dwCcVhPfHqzKfnsq0_eeTRG6lu/export?format=xlsx"
file_path = "sheet.xlsx"

try:
    urllib.request.urlretrieve(url, file_path)
    xls = pd.ExcelFile(file_path)
    print("Sheet names:", xls.sheet_names)
    
    for sheet_name in xls.sheet_names:
        print(f"\n--- {sheet_name} ---")
        df = pd.read_excel(xls, sheet_name=sheet_name, nrows=5)
        print(df.head())
except Exception as e:
    print("Error:", e)
