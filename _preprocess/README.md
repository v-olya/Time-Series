# Preprocess scripts

This folder contains utilities to preprocess the merged CSVs and export JSON artifacts
for the frontend.

Create a virtual environment:

```bash
python -m venv .venv
```

Activate (pick the variant that matches your shell):

POSIX (macOS / Linux / WSL / Git Bash):

```bash
source .venv/bin/activate
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Run the venv and execute the script:

```bash
python -m pip install -r _preprocess/requirements.txt
python _preprocess/export_processed_json.py
```


Or, the same without activating the venv:

```bash
# POSIX
.venv/bin/python -m pip install -r _preprocess/requirements.txt
.venv/bin/python _preprocess/export_processed_json.py

# Windows
.venv\Scripts\python.exe -m pip install -r _preprocess\requirements.txt
.venv\Scripts\python.exe _preprocess\export_processed_json.py

Output:

- `web/public/data/processed/{dairy,eggs,flour}_eda.json`

Files produced include the main time series (`timeSeries`), scaled series, 12-month rolling mean/std, STL decomposition components, and ACF values.
