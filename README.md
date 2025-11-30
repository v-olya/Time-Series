# Time series visualizations

The App for real-life data analysis and visualizations. See `web/` for Front End and `_preprocess/` for python preprocessing scripts.

## About
This repository demonstrates visualizations for a set of time series that come from National Open Data Catalogue;  you can download the full dataset from <a href="https://data.gov.cz/dataset?iri=https%3A%2F%2Fdata.gov.cz%2Fzdroj%2Fdatov%C3%A9-sady%2F00025593%2F02f3decfbfdabecebd4c0548f55390a0">data.gov.cz</a>.

The `_preprocess/` scripts transform raw CSV exports into cleaned and aggregated data, and the `web/` Next.js app contains interactive Plotly visualizations that use the processed outputs.

## Data provenance

- **Raw inputs:** the raw files are stored in `_preprocess/` (notably `CEN02.csv` and the per-product time-series CSVs under `_preprocess/dairy`, `_preprocess/eggs`, and `_preprocess/flour`).
- **Preprocessing:** scripts such as `_preprocess/split_data.py`, `_preprocess/aggregate.py`, and `_preprocess/export_processed_json.py` are used to clean, split, and export the processed datasets.
- **Processed outputs:** the frontend consumes merged CSVs and JSON files under `web/public/data/` (for example, `web/public/data/merged_dairy_prices.csv` and `web/public/data/processed/*.json`).

If you need a reproducible run, execute the preprocessing scripts in `_preprocess/` (see `_preprocess/README.md`) to regenerate the `web/public/data/` artifacts.

## Frontend notes — Plotly cleanup model

The app uses a page-level cleanup model to avoid heavy Plotly rendering blocking navigation. 
Each Plotly graph registers its DOM node with `lib/plotlyManager.ts` (the easiest way is to use `components/Plots/PlotlyWrapper.tsx`, which registers on initialization and unregisters on unmount). 

A global client component, `components/Plots/PlotlyPurger.tsx`, is mounted in `app/layout.tsx` and listens for navigation events (capture-phase link clicks, `popstate`, and `beforeunload`). When navigation starts it calls `purgeAllPlotly()` which invokes `Plotly.purge()` for all registered graph nodes (with a DOM fallback) to abort rendering and free resources.

**If you use programmatic navigation** (e.g. `router.push(...)`), call `purgeAllPlotly()` before navigating. Alternatively, register graph divs directly using the `onInitialized` handler on `react-plotly.js` and the `registerGraphDiv`/`unregisterGraphDiv` helpers.

## Screenshots

A simple home page with an overview of existing data entities:

![Screenshot_30-11-2025_23638_localhost](https://github.com/user-attachments/assets/2589f549-ccc0-4de0-b407-16021ed8194b)

Category EDA with Plotly: TimeSeries, Scatter and Radar plots, 2D and 3D Heatmaps, Waterfall and Funnel charts.

![Screenshot_30-11-2025_232047_localhost](https://github.com/user-attachments/assets/0849414a-379f-4a68-ba27-b16b12817657)
