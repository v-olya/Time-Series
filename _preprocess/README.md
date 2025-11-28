# Preprocess scripts

This folder contains utilities to preprocess the merged CSVs and export JSON artifacts
for the frontend.

Usage (Windows PowerShell):

```powershell
python -m venv .venv
.\.venv\Scripts\pip.exe install -r requirements.txt
python export_processed_json.py
```

Output:

- `web/public/data/processed/{dairy,eggs,flour}_eda.json`

Files produced include the main time series (`timeSeries`), scaled series, 12-month rolling mean/std,
STL decomposition components, and ACF values. Forecast placeholders are left empty.
