r"""For each category, reads CSVs in `web/public/data/`, 
computes transforms (parse dates, standard scaling, 12-month rolling mean/std, STL decomposition, ACF) 
and writes `web/public/data/processed/{category}_eda.json`.

"""
from pathlib import Path
import json
import pandas as pd
import numpy as np

from statsmodels.tsa.seasonal import STL
from statsmodels.tsa.stattools import acf
from sklearn.preprocessing import StandardScaler
from statsmodels.tsa.statespace.sarimax import SARIMAX
import warnings


BASE = Path(__file__).resolve().parents[1]
DATA_DIR = BASE / "web" / "public" / "data"
INPUT_FILES = {
    "dairy": DATA_DIR / "merged_dairy_prices.csv",
    "eggs": DATA_DIR / "merged_eggs_prices.csv",
    "flour": DATA_DIR / "merged_flour_prices.csv",
}

OUT_DIR = DATA_DIR / "processed"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def to_iso(series: pd.Series):
    """Convert pandas Series to list of dicts with ISO date (YYYY-MM-DD) format."""
    return [{"date": d.strftime("%Y-%m-%d"), "value": (float(v) if pd.notna(v) else None)} for d, v in series.items()]


def process_file(name: str, path: Path):
    print(f"Processing {name} from {path}")
    df = pd.read_csv(path, parse_dates=["Month"])  # expects Month column
    df = df.set_index("Month").asfreq("MS")

    numeric = df.select_dtypes(include=[np.number]).copy()
    if numeric.shape[1] == 0:
        print(f"No numeric columns found in {path}, skipping")
        return

    # Find the minimum last date across all numeric columns to ensure consistent end date
    last_dates = []
    for col in numeric.columns:
        col_series = numeric[col].astype(float).dropna()
        if len(col_series) > 0:
            last_dates.append(col_series.index[-1])
    if not last_dates:
        print(f"No valid series in {path}, skipping")
        return
    min_last_date = min(last_dates)
    print(f"Trimming all series to end at {min_last_date}")

    # Trim all series to min_last_date
    for col in numeric.columns:
        numeric[col] = numeric[col].astype(float).loc[:min_last_date]

    preferred = f"{name}Index"
    if preferred in numeric.columns:
        target_col = preferred
    else:
        target_col = numeric.columns[0]

    series = numeric[target_col].astype(float)

    scaler = StandardScaler()
    series_scaled = pd.Series(scaler.fit_transform(series.values.reshape(-1, 1)).flatten(), index=series.index)

    rolling_mean_12 = series.rolling(window=12, min_periods=1).mean()
    rolling_std_12 = series.rolling(window=12, min_periods=1).std()

    stl = STL(series.dropna(), period=12, robust=True)
    res = stl.fit()
    trend = res.trend.reindex(series.index)
    seasonal = res.seasonal.reindex(series.index)
    resid = res.resid.reindex(series.index)

    acf_vals = acf(series.dropna(), nlags=36, fft=False)
    lags = list(range(len(acf_vals)))

    time_series = to_iso(series)

    series_dict = {}
    for col in numeric.columns:
        if col != target_col:
            col_series = numeric[col].astype(float)
            series_dict[col] = to_iso(col_series)

    out = {
        "meta": {"series": target_col, "start": time_series[0]["date"], "end": time_series[-1]["date"], "freq": "MS"},
        "timeSeries": time_series,
        "series": series_dict,
        "scaled": to_iso(series_scaled),
        "rolling": {"ma_12": to_iso(rolling_mean_12), "std_12": to_iso(rolling_std_12)},
        "decomposition": {"trend": to_iso(trend), "seasonal": to_iso(seasonal), "resid": to_iso(resid)},
        "acf": {"lags": lags, "values": [float(v) for v in acf_vals]},
        "metrics": {},
    }

    # Generate SARIMAX forecasts for every column
    # Return (pred_mean, conf_85, conf_95) where each is pandas Series
    # For confidence interval, we return DataFrame with columns ['lower','upper']
    def generate_forecast_with_intervals(series: pd.Series, periods: int = 12):

        s = series.dropna().astype(float)
        if s.empty or len(s) < 12:
            return None, None, None

        # Ensure index has frequency
        try:
            s = s.asfreq('MS')
        except Exception:
            s.index = pd.DatetimeIndex(s.index)
            s = s.asfreq('MS')

        # Try an AIC-based model selection on series with weak seasonality. 
        # Try a small grid of (p,d,q)x(P,D,Q,12) candidates and pick the model with lowest AIC
        def select_sarimax_by_aic(s, max_p=1, max_q=1, max_P=1, max_Q=1):
            best_aic = np.inf
            best_res = None
            best_order = None
            best_seasonal = None
            # try small grid to keep runtime reasonable
            d_candidates = [0, 1]
            D_candidates = [0, 1]

            for p in range(0, max_p + 1):
                for q in range(0, max_q + 1):
                    for P in range(0, max_P + 1):
                        for Q in range(0, max_Q + 1):
                            for d in d_candidates:
                                for D in D_candidates:
                                    try:
                                        with warnings.catch_warnings():
                                            warnings.filterwarnings("ignore")
                                            mod = SARIMAX(s, order=(p, d, q),
                                                          seasonal_order=(P, D, Q, 12),
                                                          enforce_stationarity=False,
                                                          enforce_invertibility=False)
                                            res = mod.fit(disp=False)
                                        aic = getattr(res, 'aic', np.inf)
                                        if aic < best_aic:
                                            best_aic = aic
                                            best_res = res
                                            best_order = (p, d, q)
                                            best_seasonal = (P, D, Q, 12)
                                    except Exception:
                                        continue
            return best_res, best_order, best_seasonal

        try:
            best_res, best_order, best_seasonal = select_sarimax_by_aic(s)
            model_info = None
            if best_res is None:
                # fall back to a simple non-seasonal model if selection failed
                mod = SARIMAX(s, order=(0, 1, 1), seasonal_order=(0, 0, 0, 12),
                              enforce_stationarity=False, enforce_invertibility=False)
                res = mod.fit(disp=False)
                model_info = {"order": (0, 1, 1), "seasonal_order": (0, 0, 0, 12), "method": "fallback"}
            else:
                res = best_res
                model_info = {"order": best_order, "seasonal_order": best_seasonal, "method": "aic_grid"}

            pred = res.get_forecast(steps=periods)
            pred_mean = pred.predicted_mean
            last = s.index[-1]
            future_idx = pd.date_range(last + pd.offsets.MonthBegin(1), periods=periods, freq='MS')
            pred_mean.index = future_idx

            # 85% and 95% intervals
            ci85 = pred.conf_int(alpha=0.15)
            ci95 = pred.conf_int(alpha=0.05)
            ci85.index = future_idx
            ci95.index = future_idx

            return pred_mean, ci85, ci95, model_info
        except Exception:
            return None, None, None, None

    forecasts = {}
    forecast_intervals = {}
    forecast_models = {}
    periods = 6
    for col in numeric.columns:
        try:
            col_series = numeric[col].astype(float)
            mean, ci85, ci95, model_info = generate_forecast_with_intervals(col_series, periods=periods)
            if mean is None:
                forecasts[col] = []
                forecast_intervals[col] = {}
                forecast_models[col] = None
                continue

            # Write forecasts using ISO date format (YYYY-MM-DD)
            forecasts[col] = to_iso(mean)
            intervals = {}
            if ci85 is not None:
                intervals['85'] = [{"date": d.strftime("%Y-%m-%d"), "lower": float(row.iloc[0]), "upper": float(row.iloc[1])} for d, row in ci85.iterrows()]
            if ci95 is not None:
                intervals['95'] = [{"date": d.strftime("%Y-%m-%d"), "lower": float(row.iloc[0]), "upper": float(row.iloc[1])} for d, row in ci95.iterrows()]
            forecast_intervals[col] = intervals
            forecast_models[col] = model_info
        except Exception as e:
            print(f"  Forecast failed for {col}: {e}")
            forecasts[col] = []
            forecast_intervals[col] = {}
            forecast_models[col] = None


    # Write JSON for frontend
    tiny = {"forecasts": {}}
    for col, mean_list in forecasts.items():
        tiny_list = []
        ci85_map = {}
        ci95_map = {}
        if forecast_intervals.get(col):
            for item in forecast_intervals[col].get('85', []):
                ci85_map[item['date']] = (item.get('lower'), item.get('upper'))
            for item in forecast_intervals[col].get('95', []):
                ci95_map[item['date']] = (item.get('lower'), item.get('upper'))

        for m in mean_list:
            dt = m['date']
            lower85, upper85 = ci85_map.get(dt, (None, None))
            lower95, upper95 = ci95_map.get(dt, (None, None))
            tiny_entry = {
                "date": dt,
                "value": m['value'],
                "lower_85": (None if lower85 is None else float(lower85)),
                "upper_85": (None if upper85 is None else float(upper85)),
                "lower_95": (None if lower95 is None else float(lower95)),
                "upper_95": (None if upper95 is None else float(upper95)),
            }
            tiny_list.append(tiny_entry)
        tiny["forecasts"][col] = tiny_list

    tiny_path = OUT_DIR / f"{name}_forecasts.json"
    with open(tiny_path, 'w', encoding='utf-8') as f:
        json.dump(tiny, f, ensure_ascii=False, indent=0)
    print(f"Wrote forecasts for FE: {tiny_path}")

    # Write human-readable CSV summary with chosen model per series
    summary_rows = []
    for series, m in forecast_models.items():
        if m is None:
            order = ""
            seasonal_order = ""
            method = ""
            reason = "no model"
        else:
            order = ",".join(str(x) for x in m.get('order', [])) if m.get('order') else ""
            seasonal_order = ",".join(str(x) for x in m.get('seasonal_order', [])) if m.get('seasonal_order') else ""
            method = m.get('method', "")
            if method == 'fallback':
                reason = 'fallback (simple default used)'
            else:
                try:
                    P, D, Q, mper = m.get('seasonal_order', (0, 0, 0, 12))
                    if any(x != 0 for x in (P, D, Q)):
                        reason = 'AIC preferred seasonal'
                    else:
                        reason = 'AIC preferred non-seasonal'
                except Exception:
                    reason = ''

        summary_rows.append({
            'series': series,
            'order': order,
            'seasonal_order': seasonal_order,
            'method': method,
            'reason': reason,
        })

    # CSV
    summary_csv_path = OUT_DIR / f"{name}_model_summary.csv"
    import csv
    with open(summary_csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['series', 'order', 'seasonal_order', 'method', 'reason'])
        writer.writeheader()
        for r in summary_rows:
            writer.writerow(r)
    print(f"Wrote model summary CSV: {summary_csv_path}")


    # Finally write the _eda.json
    out_path = OUT_DIR / f"{name}_eda.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"Wrote {out_path}")


def main():
    for name, path in INPUT_FILES.items():
        if not path.exists():
            print(f"Input missing: {path}")
            continue
        process_file(name, path)


if __name__ == "__main__":
    main()