# Time series

Exploratory visualizations and simple forecasts over real price time series. Source data: National Open Data Catalogue, full dataset <a href="https://data.gov.cz/dataset?iri=https%3A%2F%2Fdata.gov.cz%2Fzdroj%2Fdatov%C3%A9-sady%2F00025593%2F02f3decfbfdabecebd4c0548f55390a0">here</a>.

- **Preprocessing:** per-series SARIMAX (picked by lowest AIC), run offline in `_preprocess/`.
- **Client-side ML:** a compact dense network in `web/app/lib/inBrowserForecasts.ts` using `@tensorflow/tfjs` (short windows, auto-regressive predictions in browser).

## Structure

- `_preprocess/` – raw CSVs (`CEN02.csv`, per-product time series) and Python scripts for splitting, aggregation and export (see `_preprocess/README.md`).
- `web/` – Next.js app with Plotly-based EDA (time series, scatter, radar, 2D and 3D heatmaps, waterfall, funnel) and optional in-browser ML.
- `web/public/data/` – processed CSV/JSON artifacts consumed by the frontend.

## From `web/`

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint` / `npm run lint:fix`
- `npm run generate:palette`

## Data lifecycle

- **Raw inputs:** `_preprocess/CEN02.csv` and per-category CSVs under `_preprocess/dairy`, etc.
- **Processing:** run the Python scripts in `_preprocess/` to regenerate the artifacts under `web/public/data/`.
- **Forecasting:** SARIMAX runs in preprocessing; TensorFlow forecasts run in-browser on the currently selected series.

## Plotly lifecycle

Plotly graphs register their DOM nodes via `web/app/lib/plotlyManager.ts` (typically through `web/app/components/Plots/PlotlyWrapper.tsx`).

`web/app/components/Plots/PlotlyPurger.tsx`, mounted in `web/app/layout.tsx`, listens for navigation and calls `purgeAllPlotly()` to abort rendering and free resources. When navigating programmatically (e.g. `router.push`), call `purgeAllPlotly()` first or wire `registerGraphDiv`/`unregisterGraphDiv` directly in your Plotly components.

## Extending the app

- **New product category:** add raw CSV(s) under `_preprocess/<category>/`, update the preprocessing script so it exports merged artifacts into `web/public/data/`, then create a route in `web/app/<category>/page.tsx` with Plotly components wired to the new data.
- **New chart type:** add a reusable Plotly wrapper under `web/app/components/Plots/` and embed it in the relevant category page; register graph divs via `PlotlyWrapper` or `registerGraphDiv` / `unregisterGraphDiv` so `PlotlyPurger` can clean them up.

## Screenshots

Home overview:

![Screenshot_30-11-2025_23638_localhost](https://github.com/user-attachments/assets/2589f549-ccc0-4de0-b407-16021ed8194b)

Category EDA:

![Screenshot_2-12-2025_6139_localhost](https://github.com/user-attachments/assets/573db599-ccdf-4107-b3f9-93ee8ba3cb39)


